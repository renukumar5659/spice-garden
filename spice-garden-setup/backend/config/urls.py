from django.contrib import admin
from django.urls import path, include


urlpatterns = [
    # Django Admin
    path(
        "admin/",
        admin.site.urls,
    ),

    # Authentication / Users
    path(
        "api/auth/",
        include("users.urls"),
    ),

    # Orders
    path(
        "api/orders/",
        include("orders.urls"),
    ),

    # Menu
    path(
        "api/menu/",
        include("menu.urls"),
    ),

    # Categories
    path(
        "api/categories/",
        include("menu.category_urls"),
    ),

    # Reviews
    path(
        "api/reviews/",
        include("reviews.urls"),
    ),
]