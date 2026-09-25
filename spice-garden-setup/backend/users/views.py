from django.conf import settings
from django.contrib.auth import get_user_model

from google.auth.transport import requests as google_requests
from google.oauth2 import id_token

from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView

from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.permissions import AllowAny

class GoogleLoginView(APIView):
    """
    POST /api/auth/google/

    Login or register a user using Google Sign-In.
    """

    permission_classes = [permissions.AllowAny]

    def post(self, request):
        credential = request.data.get("credential")

        if not credential:
            return Response(
                {
                    "detail": "Google credential is required."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not settings.GOOGLE_CLIENT_ID:
            return Response(
                {
                    "detail": "Google Sign-In is not configured on the server."
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
                {
                    "detail": "Invalid Google credential."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        email = google_user.get("email")

        if not email:
            return Response(
                {
                    "detail": "Google account email was not provided."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not google_user.get("email_verified"):
            return Response(
                {
                    "detail": "Google email is not verified."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        User = get_user_model()

        user = User.objects.filter(
            email__iexact=email
        ).first()

        # Create account if it doesn't exist
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

        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)

        return Response(
            {
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                    "first_name": user.first_name,
                    "last_name": user.last_name,
                },
            },
            status=status.HTTP_200_OK,
        )

User = get_user_model()


# ============================================================
# HELPER
# ============================================================

def get_tokens_for_user(user):
    """
    Create JWT access and refresh tokens.
    """

    refresh = RefreshToken.for_user(user)

    return {
        "refresh": str(refresh),
        "access": str(refresh.access_token),
    }


def user_data(user):
    """
    Return user information for React.
    """

    return {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "phone": user.phone,
        "address": user.address,
        "is_staff": user.is_staff,
        "is_superuser": user.is_superuser,
        "created_at": user.created_at,
    }


# ============================================================
# REGISTER
# ============================================================

class RegisterView(APIView):

    permission_classes = [AllowAny]

    def post(self, request):

        email = str(
            request.data.get("email", "")
        ).strip().lower()

        password = str(
            request.data.get("password", "")
        )

        first_name = str(
            request.data.get("first_name", "")
        ).strip()

        last_name = str(
            request.data.get("last_name", "")
        ).strip()

        username = str(
            request.data.get("username", "")
        ).strip()

        if not email:
            return Response(
                {"detail": "Email is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not password:
            return Response(
                {"detail": "Password is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if len(password) < 6:
            return Response(
                {
                    "detail": (
                        "Password must contain at least 6 characters."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if User.objects.filter(
            email__iexact=email
        ).exists():

            return Response(
                {
                    "detail": (
                        "An account with this email already exists."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not username:
            username = email.split("@")[0]

        original_username = username
        counter = 1

        while User.objects.filter(
            username=username
        ).exists():

            username = f"{original_username}{counter}"
            counter += 1

        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name,
        )

        tokens = get_tokens_for_user(user)

        return Response(
            {
                "message": "Registration successful.",
                "access": tokens["access"],
                "refresh": tokens["refresh"],
                "user": user_data(user),
            },
            status=status.HTTP_201_CREATED,
        )


# ============================================================
# LOGIN
# ============================================================

class LoginView(APIView):

    permission_classes = [AllowAny]

    def post(self, request):

        email = str(
            request.data.get("email", "")
        ).strip().lower()

        password = str(
            request.data.get("password", "")
        )

        if not email:
            return Response(
                {"detail": "Email is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not password:
            return Response(
                {"detail": "Password is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            user = User.objects.get(
                email__iexact=email
            )

        except User.DoesNotExist:
            return Response(
                {"detail": "Invalid email or password."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        authenticated_user = authenticate(
            request=request,
            username=user.username,
            password=password,
        )

        if authenticated_user is None:
            return Response(
                {"detail": "Invalid email or password."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        if not authenticated_user.is_active:
            return Response(
                {"detail": "This account is disabled."},
                status=status.HTTP_403_FORBIDDEN,
            )

        tokens = get_tokens_for_user(
            authenticated_user
        )

        return Response(
            {
                "message": "Login successful.",
                "access": tokens["access"],
                "refresh": tokens["refresh"],
                "user": user_data(
                    authenticated_user
                ),
            },
            status=status.HTTP_200_OK,
        )


# ============================================================
# LOGOUT
# ============================================================

class LogoutView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

        refresh_token = request.data.get(
            "refresh"
        )

        if not refresh_token:
            return Response(
                {
                    "detail": (
                        "Refresh token is required."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:

            token = RefreshToken(
                refresh_token
            )

            token.blacklist()

            return Response(
                {
                    "message": "Logout successful."
                },
                status=status.HTTP_200_OK,
            )

        except Exception:

            return Response(
                {
                    "message": "Logout successful."
                },
                status=status.HTTP_200_OK,
            )


# ============================================================
# PROFILE
# ============================================================

class ProfileView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        return Response(
            user_data(request.user),
            status=status.HTTP_200_OK,
        )

    def put(self, request):

        user = request.user

        first_name = request.data.get(
            "first_name"
        )

        last_name = request.data.get(
            "last_name"
        )

        email = request.data.get(
            "email"
        )

        phone = request.data.get(
            "phone"
        )

        address = request.data.get(
            "address"
        )

        if first_name is not None:
            user.first_name = str(
                first_name
            ).strip()

        if last_name is not None:
            user.last_name = str(
                last_name
            ).strip()

        if email is not None:

            email = str(
                email
            ).strip().lower()

            if User.objects.exclude(
                id=user.id
            ).filter(
                email__iexact=email
            ).exists():

                return Response(
                    {
                        "detail": (
                            "This email is already in use."
                        )
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            user.email = email

        if phone is not None:
            user.phone = str(phone).strip()

        if address is not None:
            user.address = str(address).strip()

        user.save()

        return Response(
            {
                "message": (
                    "Profile updated successfully."
                ),
                "user": user_data(user),
            },
            status=status.HTTP_200_OK,
        )

    # --------------------------------------------------------
    # PATCH SUPPORT
    # --------------------------------------------------------

    def patch(self, request):
        return self.put(request)


# ============================================================
# CUSTOMERS
# ============================================================

class CustomerListView(APIView):

    permission_classes = [
        permissions.IsAdminUser
    ]

    def get(self, request):

        customers = (
            User.objects
            .filter(
                is_staff=False
            )
            .order_by(
                "-created_at"
            )
        )

        serializer = UserSerializer(
            customers,
            many=True
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK,
        )


# ============================================================
# FORGOT PASSWORD
# ============================================================

class ForgotPasswordView(APIView):

    permission_classes = [AllowAny]

    def post(self, request):

        email = str(
            request.data.get("email", "")
        ).strip().lower()

        if not email:
            return Response(
                {"detail": "Email is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:

            user = User.objects.get(
                email__iexact=email
            )

        except User.DoesNotExist:

            return Response(
                {
                    "detail": (
                        "If the email exists, "
                        "a reset link will be sent."
                    )
                },
                status=status.HTTP_200_OK,
            )

        reset_token = get_random_string(
            64
        )

        user.set_unusable_password()

        user.save()

        try:

            send_mail(
                subject="Spice Garden Password Reset",
                message=(
                    "Your password reset request "
                    "has been received."
                ),
                from_email=None,
                recipient_list=[email],
                fail_silently=True,
            )

        except Exception:
            pass

        return Response(
            {
                "message": (
                    "If the email exists, "
                    "a reset link will be sent."
                )
            },
            status=status.HTTP_200_OK,
        )


# ============================================================
# RESET PASSWORD
# ============================================================

class ResetPasswordView(APIView):

    permission_classes = [AllowAny]

    def post(self, request):

        email = str(
            request.data.get("email", "")
        ).strip().lower()

        new_password = str(
            request.data.get("password", "")
        )

        if not email:
            return Response(
                {"detail": "Email is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not new_password:
            return Response(
                {"detail": "New password is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:

            user = User.objects.get(
                email__iexact=email
            )

        except User.DoesNotExist:

            return Response(
                {"detail": "User not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        user.password = make_password(
            new_password
        )

        user.save()

        return Response(
            {
                "message": (
                    "Password reset successfully."
                )
            },
            status=status.HTTP_200_OK,
        )