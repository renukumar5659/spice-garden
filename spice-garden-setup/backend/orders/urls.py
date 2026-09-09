from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import (
    DashboardStatsView,
    CreateRazorpayOrderView,
    OrderStatusUpdateView,
    OrderViewSet,
    VerifyRazorpayPaymentView,
)

router = DefaultRouter()
router.register("", OrderViewSet, basename="order")

# Custom routes must come BEFORE the router's <pk>/ pattern.
urlpatterns = [
    path("stats/", DashboardStatsView.as_view(), name="order-stats"),

    path(
        "<int:pk>/razorpay/",
        CreateRazorpayOrderView.as_view(),
        name="razorpay-create-order",
    ),

    path(
        "<int:pk>/razorpay/verify/",
        VerifyRazorpayPaymentView.as_view(),
        name="razorpay-verify-payment",
    ),

    path(
        "<int:pk>/status/",
        OrderStatusUpdateView.as_view(),
        name="order-status-update",
    ),

    *router.urls,
]