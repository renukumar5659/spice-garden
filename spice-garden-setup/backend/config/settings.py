"""
Django settings for the Spice Garden Restaurant project.

Local development:
    Uses values from .env

Production:
    Uses environment variables supplied by Render.
"""

from pathlib import Path
from datetime import timedelta
import os

import dj_database_url
from decouple import Csv, config
from corsheaders.defaults import default_headers


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

ALLOWED_HOSTS = [
    "localhost",
    "127.0.0.1",
    "spice-garden-backend-flzi.onrender.com",
]

if RENDER_EXTERNAL_HOSTNAME:
    if RENDER_EXTERNAL_HOSTNAME not in ALLOWED_HOSTS:
        ALLOWED_HOSTS.append(
            RENDER_EXTERNAL_HOSTNAME
        )

ENV_ALLOWED_HOSTS = config(
    "ALLOWED_HOSTS",
    default="",
    cast=Csv(),
)

for host in ENV_ALLOWED_HOSTS:
    if host and host not in ALLOWED_HOSTS:
        ALLOWED_HOSTS.append(host)


# ============================================================
# FRONTEND
# ============================================================

FRONTEND_URL = config(
    "FRONTEND_URL",
    default="https://spice-garden-frontend.onrender.com",
).rstrip("/")


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

    # CORS
    "corsheaders",

    # REST Framework
    "rest_framework",
    "rest_framework_simplejwt",

    # Cloudinary
    "cloudinary",
    "cloudinary_storage",

    # Project apps
    "users",
    "menu",
    "orders",
]


# ============================================================
# MIDDLEWARE
# ============================================================

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",

    # CORS must be before CommonMiddleware
    "corsheaders.middleware.CorsMiddleware",

    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",

    "django.middleware.csrf.CsrfViewMiddleware",

    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]


# ============================================================
# CORS CONFIGURATION
# ============================================================

# Explicitly allow the deployed React frontend.
# Keep the legacy Render frontend URL temporarily so an older
# deployment can still communicate with the API.
CORS_ALLOWED_ORIGINS = [
    "https://spice-garden-1j9d.onrender.com",
    "https://spice-garden-frontend.onrender.com",

    # Local development
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

# Also read any origins supplied through Render.
ENV_CORS_ALLOWED_ORIGINS = config(
    "CORS_ALLOWED_ORIGINS",
    default="",
    cast=Csv(),
)

for origin in ENV_CORS_ALLOWED_ORIGINS:
    origin = origin.strip().rstrip("/")
    if origin and origin not in CORS_ALLOWED_ORIGINS:
        CORS_ALLOWED_ORIGINS.append(origin)

# Always include FRONTEND_URL from Render.
if FRONTEND_URL and FRONTEND_URL not in CORS_ALLOWED_ORIGINS:
    CORS_ALLOWED_ORIGINS.append(FRONTEND_URL)

CORS_ALLOW_ALL_ORIGINS = False
CORS_ALLOW_CREDENTIALS = True

# Explicitly allow the headers used by Axios/JSON/JWT requests.
CORS_ALLOW_HEADERS = list(default_headers) + [
    "Authorization",
]

# Cache successful preflight responses.
CORS_PREFLIGHT_MAX_AGE = 86400


# ============================================================
# CSRF TRUSTED ORIGINS
# ============================================================

CSRF_TRUSTED_ORIGINS = [
    "https://spice-garden-1j9d.onrender.com",
    "https://spice-garden-frontend.onrender.com",

    # Local development
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

if FRONTEND_URL and FRONTEND_URL not in CSRF_TRUSTED_ORIGINS:
    CSRF_TRUSTED_ORIGINS.append(FRONTEND_URL)

for origin in ENV_CORS_ALLOWED_ORIGINS:
    origin = origin.strip().rstrip("/")
    if origin and origin not in CSRF_TRUSTED_ORIGINS:
        CSRF_TRUSTED_ORIGINS.append(origin)


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
            "django.template.backends."
            "django.DjangoTemplates"
        ),
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
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

DATABASE_URL = os.environ.get(
    "DATABASE_URL"
)

if DATABASE_URL:
    # Render / Production PostgreSQL
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


# ============================================================
# CLOUDINARY CONFIGURATION
# ============================================================

CLOUDINARY_STORAGE = {
    "CLOUD_NAME": config(
        "CLOUDINARY_CLOUD_NAME",
        default="",
    ),

    "API_KEY": config(
        "CLOUDINARY_API_KEY",
        default="",
    ),

    "API_SECRET": config(
        "CLOUDINARY_API_SECRET",
        default="",
    ),
}


# ============================================================
# MEDIA FILES
# ============================================================

MEDIA_URL = "/media/"

MEDIA_ROOT = BASE_DIR / "media"


# ============================================================
# STORAGE CONFIGURATION
# ============================================================

STORAGES = {
    # User uploaded files
    "default": {
        "BACKEND": (
            "cloudinary_storage.storage."
            "MediaCloudinaryStorage"
        ),
    },

    # Django static files
    "staticfiles": {
        "BACKEND": (
            "whitenoise.storage."
            "CompressedManifestStaticFilesStorage"
        ),
    },
}


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
        "rest_framework_simplejwt.authentication."
        "JWTAuthentication",
    ),

    "DEFAULT_PERMISSION_CLASSES": (
        "rest_framework.permissions."
        "IsAuthenticatedOrReadOnly",
    ),

    "DEFAULT_PAGINATION_CLASS": (
        "rest_framework.pagination."
        "PageNumberPagination"
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
# PRODUCTION SECURITY
# ============================================================

# Render terminates HTTPS at its proxy. Tell Django which forwarded
# protocol represents the original client request so preflight/API
# requests are not redirected unexpectedly.
SECURE_PROXY_SSL_HEADER = (
    "HTTP_X_FORWARDED_PROTO",
    "https",
)

if not DEBUG:

    CSRF_COOKIE_SECURE = True

    SESSION_COOKIE_SECURE = True

    SECURE_SSL_REDIRECT = True

    SECURE_HSTS_SECONDS = 31536000

    SECURE_HSTS_INCLUDE_SUBDOMAINS = True

    SECURE_HSTS_PRELOAD = True

    X_FRAME_OPTIONS = "DENY"


# ============================================================
# LOGGING
# ============================================================

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