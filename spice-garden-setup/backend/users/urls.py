from django.urls import path

from .views import (
    GoogleLoginView,
    LoginView,
    RegisterView,
    ProfileView,
    LogoutView,
    CustomerListView,
    ForgotPasswordView,
    ResetPasswordView,
)

urlpatterns = [

    # =========================================================
    # AUTHENTICATION
    # =========================================================

    path(
        "login/",
        LoginView.as_view(),
        name="login",
    ),

    path(
        "register/",
        RegisterView.as_view(),
        name="register",
    ),

    path(
        "google/",
        GoogleLoginView.as_view(),
        name="google-login",
    ),

    path(
        "logout/",
        LogoutView.as_view(),
        name="logout",
    ),

    # =========================================================
    # PROFILE
    # =========================================================

    path(
        "profile/",
        ProfileView.as_view(),
        name="profile",
    ),

    # =========================================================
    # CUSTOMERS
    # =========================================================

    path(
        "customers/",
        CustomerListView.as_view(),
        name="customer-list",
    ),

    # =========================================================
    # PASSWORD RESET
    # =========================================================

    path(
        "forgot-password/",
        ForgotPasswordView.as_view(),
        name="forgot-password",
    ),

    path(
        "reset-password/",
        ResetPasswordView.as_view(),
        name="reset-password",
    ),
]