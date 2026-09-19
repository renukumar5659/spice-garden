from django.contrib import admin
from django.urls import include, path


urlpatterns = [
    path("admin/", admin.site.urls),

    # Authentication
    path("api/auth/", include("users.urls")),

    # Orders
    path("api/orders/", include("orders.urls")),

    # Menu + Categories
    path("api/", include("menu.urls")),

    # Reviews
    path("api/reviews/", include("reviews.urls")),
]