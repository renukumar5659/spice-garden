from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import DashboardStatsView, OrderStatusUpdateView, OrderViewSet

router = DefaultRouter()
router.register("", OrderViewSet, basename="order")

# Custom routes must come BEFORE the router's `<pk>/` pattern, otherwise
# "stats/" would be matched as an order's primary key.
urlpatterns = [
    path("stats/", DashboardStatsView.as_view(), name="order-stats"),
    path("<int:pk>/status/", OrderStatusUpdateView.as_view(), name="order-status-update"),
    *router.urls,
]
