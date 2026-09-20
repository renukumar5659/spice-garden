"""
Django settings for the Spice Garden Restaurant project.

Local development:
    Uses values from .env

Production:
    Uses environment variables supplied by the hosting platform.
"""

from pathlib import Path
from datetime import timedelta
import os

import dj_database_url
from decouple import Csv, config
from django.core.checks import ERROR


# ============================================================
# BASE DIRECTORY
# ============================================================

BASE_DIR = Path(__file__).resolve().parent.parent


# ============================================================
# SECURITY
# ============================================================

SECRET_KEY = config(
    "SECRET_KEY",
    default="dev-only-insecure-key-change-in-production",
)

DEBUG = config(
    "DEBUG",
    default=True,
    cast=bool,
)


# ============================================================
# ALLOWED HOSTS
# ============================================================

RENDER_EXTERNAL_HOSTNAME = os.environ.get(
    "RENDER_EXTERNAL_HOSTNAME"
)

default_allowed_hosts = "localhost,127.0.0.1"

if RENDER_EXTERNAL_HOSTNAME:
    default_allowed_hosts += f",{RENDER_EXTERNAL_HOSTNAME}"

ALLOWED_HOSTS = config(
    "ALLOWED_HOSTS",
    default=default_allowed_hosts,
    cast=Csv(),
)


# ============================================================
# FRONTEND
# ============================================================

FRONTEND_URL = config(
    "FRONTEND_URL",
    default="http://localhost:5173",
)


# ============================================================
# RAZORPAY
# ============================================================

RAZORPAY_KEY_ID = config(
    "RAZORPAY_KEY_ID",
    default="",
)

RAZORPAY_KEY_SECRET = config(
    "RAZORPAY_KEY_SECRET",
    default="",
)


# ============================================================
# GOOGLE SIGN-IN
# ============================================================

GOOGLE_CLIENT_ID = config(
    "GOOGLE_CLIENT_ID",
    default="",
)


# ============================================================
# EMAIL / PASSWORD RESET
# ============================================================

EMAIL_BACKEND = (
    "django.core.mail.backends.smtp.EmailBackend"
)

EMAIL_HOST = config(
    "EMAIL_HOST",
    default="smtp.gmail.com",
)

EMAIL_PORT = config(
    "EMAIL_PORT",
    default=587,
    cast=int,
)

EMAIL_USE_TLS = config(
    "EMAIL_USE_TLS",
    default=True,
    cast=bool,
)

EMAIL_HOST_USER = config(
    "EMAIL_HOST_USER",
    default="",
)

EMAIL_HOST_PASSWORD = config(
    "EMAIL_HOST_PASSWORD",
    default="",
)

DEFAULT_FROM_EMAIL = config(
    "DEFAULT_FROM_EMAIL",
    default=EMAIL_HOST_USER,
)


# ============================================================
# RESEND
# ============================================================

RESEND_API_KEY = config(
    "RESEND_API_KEY",
    default="",
)


# ============================================================
# INSTALLED APPS
# ============================================================

INSTALLED_APPS = [
    # Django
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",

    # Third-party
    "rest_framework",
    "rest_framework_simplejwt",
    "rest_framework_simplejwt.token_blacklist",
    "corsheaders",

    # Local apps
    "users",
    "menu",
    "orders",
    "reviews",
]


# ============================================================
# MIDDLEWARE
# ============================================================

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",

    # WhiteNoise
    "whitenoise.middleware.WhiteNoiseMiddleware",

    "django.contrib.sessions.middleware.SessionMiddleware",

    # CORS
    "corsheaders.middleware.CorsMiddleware",

    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",

    "django.contrib.auth.middleware.AuthenticationMiddleware",

    "django.contrib.messages.middleware.MessageMiddleware",

    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]


# ============================================================
# URL CONFIGURATION
# ============================================================

ROOT_URLCONF = "config.urls"


# ============================================================
# TEMPLATES
# ============================================================

TEMPLATES = [
    {
        "BACKEND": (
            "django.template.backends.django.DjangoTemplates"
        ),

        "DIRS": [],

        "APP_DIRS": True,

        "OPTIONS": {
            "context_processors": [
                (
                    "django.template.context_processors.debug"
                ),
                (
                    "django.template.context_processors.request"
                ),
                (
                    "django.contrib.auth.context_processors.auth"
                ),
                (
                    "django.contrib.messages.context_processors.messages"
                ),
            ],
        },
    },
]


# ============================================================
# WSGI / ASGI
# ============================================================

WSGI_APPLICATION = "config.wsgi.application"

ASGI_APPLICATION = "config.asgi.application"


# ============================================================
# DATABASE
# ============================================================

DATABASE_URL = os.environ.get("DATABASE_URL")

if DATABASE_URL:
    # Production / Render
    DATABASES = {
        "default": dj_database_url.parse(
            DATABASE_URL,
            conn_max_age=600,
        )
    }

else:
    # Local PostgreSQL
    DATABASES = {
        "default": dj_database_url.config(
            default=(
                f"postgresql://"
                f"{config('DB_USER')}:"
                f"{config('DB_PASSWORD')}"
                f"@{config('DB_HOST')}:"
                f"{config('DB_PORT')}/"
                f"{config('DB_NAME')}"
            ),
            conn_max_age=600,
        )
    }


# ============================================================
# CUSTOM USER MODEL
# ============================================================

AUTH_USER_MODEL = "users.User"


# ============================================================
# PASSWORD VALIDATION
# ============================================================

AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": (
            "django.contrib.auth.password_validation."
            "UserAttributeSimilarityValidator"
        )
    },
    {
        "NAME": (
            "django.contrib.auth.password_validation."
            "MinimumLengthValidator"
        )
    },
    {
        "NAME": (
            "django.contrib.auth.password_validation."
            "CommonPasswordValidator"
        )
    },
    {
        "NAME": (
            "django.contrib.auth.password_validation."
            "NumericPasswordValidator"
        )
    },
]


# ============================================================
# INTERNATIONALIZATION
# ============================================================

LANGUAGE_CODE = "en-us"

TIME_ZONE = "Asia/Kolkata"

USE_I18N = True

USE_TZ = True
# ============================================================
# STATIC FILES
# ============================================================

STATIC_URL = "/static/"

STATIC_ROOT = BASE_DIR / "staticfiles"

STORAGES = {
    "staticfiles": {
        "BACKEND": "whitenoise.storage.CompressedStaticFilesStorage",
    },
}

# Prevent a missing manifest entry from crashing the API
WHITENOISE_MANIFEST_STRICT = False


# ============================================================
# MEDIA FILES
# ============================================================

MEDIA_URL = "/media/"

MEDIA_ROOT = BASE_DIR / "media"


# ============================================================
# DEFAULT PRIMARY KEY
# ============================================================

DEFAULT_AUTO_FIELD = (
    "django.db.models.BigAutoField"
)


# ============================================================
# DJANGO REST FRAMEWORK
# ============================================================

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),

    "DEFAULT_PERMISSION_CLASSES": (
        "rest_framework.permissions.IsAuthenticatedOrReadOnly",
    ),

    "DEFAULT_PAGINATION_CLASS": (
        "rest_framework.pagination.PageNumberPagination"
    ),

    "PAGE_SIZE": 20,
}


# ============================================================
# JWT
# ============================================================

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(
        minutes=config(
            "ACCESS_TOKEN_LIFETIME_MIN",
            default=60,
            cast=int,
        )
    ),

    "REFRESH_TOKEN_LIFETIME": timedelta(
        days=config(
            "REFRESH_TOKEN_LIFETIME_DAYS",
            default=7,
            cast=int,
        )
    ),

    "ROTATE_REFRESH_TOKENS": True,

    "BLACKLIST_AFTER_ROTATION": True,

    "AUTH_HEADER_TYPES": (
        "Bearer",
    ),
}


# ============================================================
# CORS
# ============================================================

CORS_ALLOWED_ORIGINS = [
    FRONTEND_URL.rstrip("/"),
]

CORS_ALLOW_CREDENTIALS = True


# ============================================================
# CSRF
# ============================================================

CSRF_TRUSTED_ORIGINS = [
    FRONTEND_URL.rstrip("/"),
]


# ============================================================
# PRODUCTION SECURITY
# ============================================================

if not DEBUG:

    CSRF_COOKIE_SECURE = True

    SESSION_COOKIE_SECURE = True

    SECURE_SSL_REDIRECT = True

    SECURE_PROXY_SSL_HEADER = (
        "HTTP_X_FORWARDED_PROTO",
        "https",
    )

    SECURE_HSTS_SECONDS = 31536000

    SECURE_HSTS_INCLUDE_SUBDOMAINS = True

    SECURE_HSTS_PRELOAD = True

    X_FRAME_OPTIONS = "DENY"
    LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
        },
    },
    "loggers": {
        "django": {
            "handlers": ["console"],
            "level": "INFO",
        },
        "django.request": {
            "handlers": ["console"],
            "level": "ERROR",
            "propagate": False,
        },
    },
}
    