from django.contrib.auth import get_user_model
from django.db.models import Sum
from django.utils import timezone
from rest_framework import generics, permissions, status, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Order
from .serializers import OrderCreateSerializer, OrderSerializer, OrderStatusUpdateSerializer


class OrderViewSet(viewsets.ModelViewSet):
    """
    GET  /api/orders/       -> customer: own orders | admin: all orders
    POST /api/orders/       -> place a new order from the cart
    GET  /api/orders/<id>/  -> order detail (owner or admin)
    """
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ["get", "post", "head"]

    def get_serializer_class(self):
        if self.action == "create":
            return OrderCreateSerializer
        return OrderSerializer

    def get_queryset(self):
        user = self.request.user
        qs = Order.objects.prefetch_related("items__menu_item").select_related("customer")
        if user.is_staff:
            return qs
        return qs.filter(customer=user)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        order = serializer.save()
        return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)


class OrderStatusUpdateView(generics.UpdateAPIView):
    """PUT /api/orders/<id>/status/ — admin-only order status update."""
    queryset = Order.objects.all()
    serializer_class = OrderStatusUpdateSerializer
    permission_classes = [permissions.IsAdminUser]
    http_method_names = ["put", "patch"]

    def update(self, request, *args, **kwargs):
        response = super().update(request, *args, **kwargs)
        order = self.get_object()
        response.data = OrderSerializer(order).data
        return response


class DashboardStatsView(APIView):
    """GET /api/orders/stats/ — admin dashboard summary cards."""
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        User = get_user_model()
        today_start = timezone.now().replace(hour=0, minute=0, second=0, microsecond=0)

        total_orders = Order.objects.count()
        todays_orders = Order.objects.filter(created_at__gte=today_start).count()
        total_customers = User.objects.filter(is_staff=False).count()
        total_revenue = Order.objects.aggregate(total=Sum("total_amount"))["total"] or 0

        return Response({
            "total_orders": total_orders,
            "todays_orders": todays_orders,
            "total_customers": total_customers,
            "total_revenue": float(total_revenue),
        })
