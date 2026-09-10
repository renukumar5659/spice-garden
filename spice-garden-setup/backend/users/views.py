from django.conf import settings
from django.contrib.auth import get_user_model

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
    """POST /api/auth/register/ — create a new customer account."""
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
    """POST /api/auth/login/ — email + password login."""
    permission_classes = [permissions.AllowAny]
    serializer_class = EmailTokenObtainPairSerializer


class GoogleLoginView(APIView):
    """
    POST /api/auth/google/ — login or register using Google.

    The frontend sends the Google Identity Services ID token
    as the `credential` field.
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
                {"detail": "Google Sign-In is not configured on the server."},
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
                {"detail": "Google account email was not provided."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not google_user.get("email_verified"):
            return Response(
                {"detail": "Google email is not verified."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Find an existing account using the verified Google email.
        user = User.objects.filter(
            email__iexact=email
        ).first()

        # Create a new account if this email does not exist.
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

            # Google handles authentication for this account.
            user.set_unusable_password()

            user.save()

        # Create the same JWT tokens used by normal login.
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
    """POST /api/auth/logout/ — blacklist the given refresh token."""
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
    GET/PUT /api/auth/profile/ —
    view or update the logged-in customer's profile.
    """

    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user


class CustomerListView(generics.ListAPIView):
    """GET /api/auth/customers/ — admin-only list of all customers."""
    permission_classes = [permissions.IsAdminUser]
    serializer_class = UserSerializer

    def get_queryset(self):
        return User.objects.filter(
            is_staff=False
        ).order_by("-created_at")