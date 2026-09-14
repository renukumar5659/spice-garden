import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

email = os.environ.get("ADMIN_EMAIL")
password = os.environ.get("ADMIN_PASSWORD")

if not email or not password:
    print("ADMIN_EMAIL or ADMIN_PASSWORD is missing.")
else:
    user = User.objects.filter(email=email).first()

    if user:
        user.is_staff = True
        user.is_superuser = True
        user.is_active = True
        user.set_password(password)
        user.save()
        print("Admin account updated successfully.")
    else:
        user = User.objects.create_user(
            email=email,
            password=password,
        )
        user.is_staff = True
        user.is_superuser = True
        user.is_active = True
        user.save()
        print("Admin account created successfully.")