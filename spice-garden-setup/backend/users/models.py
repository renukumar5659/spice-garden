from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """
    Custom user model. Customers log in with email.
    `is_staff` is used to distinguish admin users for the dashboard.
    """

    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=15, blank=True)
    address = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    # Password reset OTP
    reset_otp = models.CharField(
        max_length=6,
        blank=True,
        null=True,
    )

    reset_otp_created_at = models.DateTimeField(
        blank=True,
        null=True,
    )

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]

    def __str__(self):
        return f"{self.get_full_name() or self.username} <{self.email}>"