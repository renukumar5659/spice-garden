import razorpay

from django.conf import settings
from django.contrib.auth import get_user_model
from django.db.models import Sum
from django.utils import timezone

from rest_framework import generics, permissions, status, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Order
from .serializers import (
    OrderCreateSerializer,
    OrderSerializer,
    OrderStatusUpdateSerializer,
)


class OrderViewSet(viewsets.ModelViewSet):
    """
    GET  /api/orders/       -> customer: own orders | admin: all orders
    POST /api/orders/       -> place a new order from the cart
    GET  /api/orders/<id>/  -> order detail
    """

    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ["get", "post", "head"]

    def get_serializer_class(self):
        if self.action == "create":
            return OrderCreateSerializer
        return OrderSerializer

    def get_queryset(self):
        user = self.request.user

        qs = (
            Order.objects
            .prefetch_related("items__menu_item")
            .select_related("customer")
        )

        if user.is_staff:
            return qs

        return qs.filter(customer=user)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        order = serializer.save()

        return Response(
            OrderSerializer(order).data,
            status=status.HTTP_201_CREATED,
        )


class CreateRazorpayOrderView(APIView):
    """
    POST /api/orders/<id>/razorpay/
    Creates a Razorpay order for an existing Spice Garden order.
    """

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            order = Order.objects.get(pk=pk)
        except Order.DoesNotExist:
            return Response(
                {"detail": "Order not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Customers can only pay for their own orders.
        if not request.user.is_staff and order.customer != request.user:
            return Response(
                {"detail": "You do not have permission to pay for this order."},
                status=status.HTTP_403_FORBIDDEN,
            )

        if order.payment_status == Order.PaymentStatus.PAID:
            return Response(
                {"detail": "This order is already paid."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Reuse an existing Razorpay order if one was already created.
        if order.razorpay_order_id:
            return Response(
                {
                    "order_id": order.id,
                    "razorpay_order_id": order.razorpay_order_id,
                    "amount": int(order.total_amount * 100),
                    "currency": "INR",
                    "key_id": settings.RAZORPAY_KEY_ID,
                }
            )

        client = razorpay.Client(
            auth=(
                settings.RAZORPAY_KEY_ID,
                settings.RAZORPAY_KEY_SECRET,
            )
        )

        razorpay_order = client.order.create(
            {
                "amount": int(order.total_amount * 100),
                "currency": "INR",
                "receipt": order.order_id,
            }
        )

        order.razorpay_order_id = razorpay_order["id"]
        order.payment_status = Order.PaymentStatus.PENDING
        order.save(
            update_fields=[
                "razorpay_order_id",
                "payment_status",
                "updated_at",
            ]
        )

        return Response(
            {
                "order_id": order.id,
                "razorpay_order_id": razorpay_order["id"],
                "amount": razorpay_order["amount"],
                "currency": razorpay_order["currency"],
                "key_id": settings.RAZORPAY_KEY_ID,
            },
            status=status.HTTP_201_CREATED,
        )


class VerifyRazorpayPaymentView(APIView):
    """
    POST /api/orders/<id>/razorpay/verify/
    Verifies the Razorpay payment signature.
    """

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            order = Order.objects.get(pk=pk)
        except Order.DoesNotExist:
            return Response(
                {"detail": "Order not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if not request.user.is_staff and order.customer != request.user:
            return Response(
                {"detail": "You do not have permission to verify this payment."},
                status=status.HTTP_403_FORBIDDEN,
            )

        razorpay_order_id = request.data.get("razorpay_order_id")
        razorpay_payment_id = request.data.get("razorpay_payment_id")
        razorpay_signature = request.data.get("razorpay_signature")

        if not all(
            [
                razorpay_order_id,
                razorpay_payment_id,
                razorpay_signature,
            ]
        ):
            order.payment_status = Order.PaymentStatus.FAILED
            order.save(update_fields=["payment_status", "updated_at"])

            return Response(
                {"detail": "Incomplete Razorpay payment information."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if order.razorpay_order_id != razorpay_order_id:
            return Response(
                {"detail": "Razorpay order ID does not match."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        client = razorpay.Client(
            auth=(
                settings.RAZORPAY_KEY_ID,
                settings.RAZORPAY_KEY_SECRET,
            )
        )

        try:
            client.utility.verify_payment_signature(
                {
                    "razorpay_order_id": razorpay_order_id,
                    "razorpay_payment_id": razorpay_payment_id,
                    "razorpay_signature": razorpay_signature,
                }
            )
        except razorpay.errors.SignatureVerificationError:
            order.payment_status = Order.PaymentStatus.FAILED
            order.save(update_fields=["payment_status", "updated_at"])

            return Response(
                {"detail": "Payment verification failed."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        order.razorpay_payment_id = razorpay_payment_id
        order.razorpay_signature = razorpay_signature
        order.payment_status = Order.PaymentStatus.PAID
        order.status = Order.Status.CONFIRMED

        order.save(
            update_fields=[
                "razorpay_payment_id",
                "razorpay_signature",
                "payment_status",
                "status",
                "updated_at",
            ]
        )

        return Response(
            {
                "detail": "Payment verified successfully.",
                "order": OrderSerializer(order).data,
            },
            status=status.HTTP_200_OK,
        )


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

        today_start = timezone.now().replace(
            hour=0,
            minute=0,
            second=0,
            microsecond=0,
        )

        total_orders = Order.objects.count()

        todays_orders = Order.objects.filter(
            created_at__gte=today_start
        ).count()

        total_customers = User.objects.filter(
            is_staff=False
        ).count()

        total_revenue = Order.objects.filter(
            payment_status=Order.PaymentStatus.PAID
        ).aggregate(
            total=Sum("total_amount")
        )["total"] or 0

        return Response(
            {
                "total_orders": total_orders,
                "todays_orders": todays_orders,
                "total_customers": total_customers,
                "total_revenue": float(total_revenue),
            }
        )