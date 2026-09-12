import requests
from django.conf import settings
from datetime import timedelta
import secrets

from django.conf import settings
from django.contrib.auth import get_user_model
from django.utils import timezone

from google.auth.transport import requests as google_requests
from google.oauth2 import id_token

from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView

from .serializers import (
    EmailTokenObtainPairSerializer,
    RegisterSerializer,
    UserSerializer,
)


User = get_user_model()


class RegisterView(generics.CreateAPIView):
    """
    POST /api/auth/register/
    Create a new customer account.
    """

    permission_classes = [permissions.AllowAny]
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.save()

        return Response(
            UserSerializer(user).data,
            status=status.HTTP_201_CREATED,
        )


class LoginView(TokenObtainPairView):
    """
    POST /api/auth/login/
    Login using email and password.
    """

    permission_classes = [permissions.AllowAny]
    serializer_class = EmailTokenObtainPairSerializer


class GoogleLoginView(APIView):
    """
    POST /api/auth/google/
    Login or register using Google.
    """

    permission_classes = [permissions.AllowAny]

    def post(self, request):
        credential = request.data.get("credential")

        if not credential:
            return Response(
                {"detail": "Google credential is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not settings.GOOGLE_CLIENT_ID:
            return Response(
                {
                    "detail": (
                        "Google Sign-In is not configured "
                        "on the server."
                    )
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        try:
            google_user = id_token.verify_oauth2_token(
                credential,
                google_requests.Request(),
                settings.GOOGLE_CLIENT_ID,
            )
        except ValueError:
            return Response(
                {"detail": "Invalid Google credential."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        email = google_user.get("email")

        if not email:
            return Response(
                {
                    "detail": (
                        "Google account email was not provided."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not google_user.get("email_verified"):
            return Response(
                {"detail": "Google email is not verified."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = User.objects.filter(
            email__iexact=email
        ).first()

        if not user:
            name = (google_user.get("name") or "").strip()

            first_name = (
                google_user.get("given_name")
                or (name.split(" ")[0] if name else "")
            )

            last_name = (
                google_user.get("family_name")
                or (
                    " ".join(name.split(" ")[1:])
                    if len(name.split(" ")) > 1
                    else ""
                )
            )

            user = User(
                username=email,
                email=email,
                first_name=first_name,
                last_name=last_name,
            )

            user.set_unusable_password()
            user.save()

        refresh = RefreshToken.for_user(user)

        return Response(
            {
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "user": UserSerializer(user).data,
            },
            status=status.HTTP_200_OK,
        )


class LogoutView(APIView):
    """
    POST /api/auth/logout/
    Logout and blacklist refresh token.
    """

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        refresh = request.data.get("refresh")

        if not refresh:
            return Response(
                {"detail": "Refresh token is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            token = RefreshToken(refresh)
            token.blacklist()

        except TokenError:
            return Response(
                {"detail": "Invalid or expired token."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            {"detail": "Logged out successfully."},
            status=status.HTTP_205_RESET_CONTENT,
        )


class ProfileView(generics.RetrieveUpdateAPIView):
    """
    GET/PUT/PATCH /api/auth/profile/
    View or update the logged-in customer's profile.
    """

    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user

    def update(self, request, *args, **kwargs):
        instance = self.get_object()

        serializer = self.get_serializer(
            instance,
            data=request.data,
            partial=True,
        )

        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        return Response(
            serializer.data,
            status=status.HTTP_200_OK,
        )


class CustomerListView(generics.ListAPIView):
    """
    GET /api/auth/customers/
    Admin-only list of all customers.
    """

    permission_classes = [permissions.IsAdminUser]
    serializer_class = UserSerializer

    def get_queryset(self):
        return User.objects.filter(
            is_staff=False
        ).order_by("-created_at")


class ForgotPasswordView(APIView):
    """
    POST /api/auth/forgot-password/

    Generate a 6-digit OTP and send it to the user's email.
    OTP is valid for 10 minutes.
    """

    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get("email", "").strip()

        if not email:
            return Response(
                {"detail": "Email is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = User.objects.filter(
            email__iexact=email
        ).first()

        # Don't reveal whether an email exists.
        if not user:
            return Response(
                {
                    "detail": (
                        "If an account with this email exists, "
                        "a password reset OTP has been sent."
                    )
                },
                status=status.HTTP_200_OK,
            )

        # Generate a secure 6-digit OTP.
        otp = f"{secrets.randbelow(1000000):06d}"

        user.reset_otp = otp
        user.reset_otp_created_at = timezone.now()

        user.save(
            update_fields=[
                "reset_otp",
                "reset_otp_created_at",
            ]
        )

        subject = "Spice Garden - Password Reset OTP"

        message = (
            "Hello,\n\n"
            "We received a request to reset your "
            "Spice Garden account password.\n\n"
            f"Your password reset OTP is: {otp}\n\n"
            "This OTP is valid for 10 minutes.\n\n"
            "Do not share this OTP with anyone.\n\n"
            "If you did not request a password reset, "
            "you can safely ignore this email.\n\n"
            "Thanks,\n"
            "Spice Garden"
        )

        try:
            response = requests.post(
                "https://api.resend.com/emails",
                headers={
                    "Authorization": (
                        f"Bearer {settings.RESEND_API_KEY}"
                    ),
                    "Content-Type": "application/json",
                },
                json={
                    "from": "onboarding@resend.dev",
                    "to": [user.email],
                    "subject": subject,
                    "text": message,
                },
                timeout=30,
            )

            if not response.ok:
                raise Exception(response.text)

        except Exception as exc:
            print("Password reset OTP email error:", exc)

            # Clear OTP if email sending failed.
            user.reset_otp = None
            user.reset_otp_created_at = None

            user.save(
                update_fields=[
                    "reset_otp",
                    "reset_otp_created_at",
                ]
            )

            return Response(
                {
                    "detail": (
                        "Unable to send the password reset OTP. "
                        "Please check the email configuration."
                    )
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        return Response(
            {
                "detail": (
                    "If an account with this email exists, "
                    "a password reset OTP has been sent."
                )
            },
            status=status.HTTP_200_OK,
        )


class ResetPasswordView(APIView):
    """
    POST /api/auth/reset-password/

    Reset password using:
    - email
    - 6-digit OTP
    - new password

    OTP expires after 10 minutes and can only be used once.
    """

    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get("email", "").strip()
        otp = request.data.get("otp", "").strip()
        password = request.data.get("password", "")

        if not email:
            return Response(
                {"detail": "Email is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not otp:
            return Response(
                {"detail": "OTP is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not password:
            return Response(
                {"detail": "Password is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if len(password) < 8:
            return Response(
                {
                    "detail": (
                        "Password must be at least 8 characters."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = User.objects.filter(
            email__iexact=email
        ).first()

        if not user:
            return Response(
                {"detail": "Invalid email or OTP."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not user.reset_otp or not user.reset_otp_created_at:
            return Response(
                {
                    "detail": (
                        "No password reset OTP is available. "
                        "Please request a new OTP."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # OTP is valid for 10 minutes.
        otp_age = timezone.now() - user.reset_otp_created_at

        if otp_age > timedelta(minutes=10):
            user.reset_otp = None
            user.reset_otp_created_at = None

            user.save(
                update_fields=[
                    "reset_otp",
                    "reset_otp_created_at",
                ]
            )

            return Response(
                {
                    "detail": (
                        "This OTP has expired. "
                        "Please request a new OTP."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if otp != user.reset_otp:
            return Response(
                {"detail": "Invalid OTP."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # OTP is correct — change the password.
        user.set_password(password)

        # Make the OTP single-use.
        user.reset_otp = None
        user.reset_otp_created_at = None

        user.save(
            update_fields=[
                "password",
                "reset_otp",
                "reset_otp_created_at",
            ]
        )

        return Response(
            {
                "detail": (
                    "Your password has been reset successfully."
                )
            },
            status=status.HTTP_200_OK,
        )

class PincodeLocationView(APIView):
    """
    GET /api/auth/pincode/<pin>/
    Look up an Indian PIN code on the server and return its location.
    """

    permission_classes = [permissions.AllowAny]

    def get(self, request, pin):
        import json
        from urllib.error import HTTPError, URLError
        from urllib.request import Request, urlopen

        pin = str(pin).strip()

        if not pin.isdigit() or len(pin) != 6:
            return Response(
                {"detail": "Enter a valid 6-digit PIN code."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        url = f"https://api.postalpincode.in/pincode/{pin}"

        try:
            req = Request(
                url,
                headers={"User-Agent": "Spice-Garden/1.0"},
            )
            with urlopen(req, timeout=8) as response:
                data = json.loads(response.read().decode("utf-8"))
        except (HTTPError, URLError, TimeoutError, ValueError) as exc:
            print("PIN lookup error:", exc)
            return Response(
                {"detail": "Unable to look up this PIN code right now."},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        if (
            not isinstance(data, list)
            or not data
            or data[0].get("Status") != "Success"
            or not isinstance(data[0].get("PostOffice"), list)
            or not data[0]["PostOffice"]
        ):
            return Response(
                {"detail": "Location not found for this PIN code."},
                status=status.HTTP_404_NOT_FOUND,
            )

        office = data[0]["PostOffice"][0]

        return Response(
            {
                "pin_code": pin,
                "area": office.get("Name", ""),
                "district": office.get("District", ""),
                "state": office.get("State", ""),
                "country": office.get("Country", "India"),
            },
            status=status.HTTP_200_OK,
        )
