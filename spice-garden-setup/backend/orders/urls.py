from django.urls import path

from .views import (
    OrderListCreateView,
    OrderDetailView,
    CreateRazorpayOrderView,
    VerifyRazorpayPaymentView,
    OrderStatusUpdateView,
    order_analytics,
    order_stats,
    order_export,
)

urlpatterns = [
    path(
        "",
        OrderListCreateView.as_view(),
        name="order-list-create",
    ),

    path(
        "analytics/",
        order_analytics,
        name="order-analytics",
    ),

    path(
        "stats/",
        order_stats,
        name="order-stats",
    ),

    path(
        "export/",
        order_export,
        name="order-export",
    ),

    path(
        "<int:pk>/razorpay/",
        CreateRazorpayOrderView.as_view(),
        name="create-razorpay-order",
    ),

    path(
        "<int:pk>/razorpay/verify/",
        VerifyRazorpayPaymentView.as_view(),
        name="verify-razorpay-payment",
    ),

    path(
        "<int:pk>/status/",
        OrderStatusUpdateView.as_view(),
        name="order-status-update",
    ),

    path(
        "<int:pk>/",
        OrderDetailView.as_view(),
        name="order-detail",
    ),
]