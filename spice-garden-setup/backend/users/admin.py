from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import User


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ["email", "username", "first_name", "last_name", "is_staff", "created_at"]
    ordering = ["-created_at"]
    fieldsets = UserAdmin.fieldsets + (
        ("Restaurant profile", {"fields": ("phone", "address")}),
    )
