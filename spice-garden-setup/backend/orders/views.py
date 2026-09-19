import csv
from datetime import timedelta
from decimal import Decimal

from django.conf import settings
from django.db.models import Sum, Count, F, DecimalField, ExpressionWrapper
from django.db.models.functions import TruncDate, TruncMonth
from django.http import HttpResponse
from django.utils import timezone

from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response

from openpyxl import Workbook

from .models import Order, OrderItem
from .serializers import (
    OrderSerializer,
    OrderCreateSerializer,
    OrderStatusUpdateSerializer,
)


# =========================================================
# HELPER
# =========================================================

def is_admin(user):
    return user.is_staff or user.is_superuser


def get_period(request):
    try:
        period = int(request.GET.get("period", 30))
    except (TypeError, ValueError):
        period = 30

    if period not in [7, 30, 90, 365]:
        period = 30

    return period


def get_period_dates(period):
    today = timezone.localdate()

    start_date = today - timedelta(
        days=period - 1
    )

    return start_date, today


# =========================================================
# ORDER LIST + CREATE
# =========================================================

class OrderListCreateView(
    generics.ListCreateAPIView
):

    permission_classes = [
        IsAuthenticated
    ]

    def get_queryset(self):

        queryset = (
            Order.objects
            .select_related("customer")
            .prefetch_related(
                "items__menu_item"
            )
            .all()
            .order_by("-created_at")
        )

        if is_admin(
            self.request.user
        ):
            return queryset

        return queryset.filter(
            customer=self.request.user
        )

    def get_serializer_class(self):

        if self.request.method == "POST":
            return OrderCreateSerializer

        return OrderSerializer

    def get_serializer_context(self):

        return {
            "request": self.request
        }


# =========================================================
# ORDER DETAIL
# =========================================================

class OrderDetailView(
    generics.RetrieveDestroyAPIView
):

    permission_classes = [
        IsAuthenticated
    ]

    serializer_class = OrderSerializer

    def get_queryset(self):

        queryset = (
            Order.objects
            .select_related("customer")
            .prefetch_related(
                "items__menu_item"
            )
            .all()
        )

        if is_admin(
            self.request.user
        ):
            return queryset

        return queryset.filter(
            customer=self.request.user
        )

    def get_serializer_context(self):

        return {
            "request": self.request
        }

    def delete(
        self,
        request,
        *args,
        **kwargs
    ):

        if not is_admin(request.user):

            return Response(
                {
                    "detail":
                    "Admin permission required."
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        return super().delete(
            request,
            *args,
            **kwargs
        )


# =========================================================
# CREATE RAZORPAY ORDER
# =========================================================

class CreateRazorpayOrderView(
    generics.GenericAPIView
):

    permission_classes = [
        IsAuthenticated
    ]

    def post(
        self,
        request,
        pk
    ):

        try:

            order = Order.objects.get(
                pk=pk,
                customer=request.user
            )

        except Order.DoesNotExist:

            return Response(
                {
                    "detail":
                    "Order not found."
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        try:

            import razorpay

            key_id = getattr(
                settings,
                "RAZORPAY_KEY_ID",
                ""
            )

            key_secret = getattr(
                settings,
                "RAZORPAY_KEY_SECRET",
                ""
            )

            if not key_id or not key_secret:

                return Response(
                    {
                        "detail":
                        "Razorpay credentials are not configured."
                    },
                    status=(
                        status.HTTP_500_INTERNAL_SERVER_ERROR
                    ),
                )

            client = razorpay.Client(
                auth=(
                    key_id,
                    key_secret
                )
            )

            amount = int(
                Decimal(
                    str(
                        order.total_amount
                        or 0
                    )
                ) * 100
            )

            razorpay_order = (
                client.order.create(
                    {
                        "amount": amount,
                        "currency": "INR",
                        "receipt":
                            str(
                                order.order_id
                            ),
                    }
                )
            )

            order.razorpay_order_id = (
                razorpay_order["id"]
            )

            order.save(
                update_fields=[
                    "razorpay_order_id",
                    "updated_at",
                ]
            )

            return Response(
                {
                    "id":
                        razorpay_order["id"],

                    "order_id":
                        order.order_id,

                    "amount":
                        razorpay_order["amount"],

                    "currency":
                        razorpay_order["currency"],
                },
                status=status.HTTP_200_OK,
            )

        except Exception as e:

            print(
                "RAZORPAY CREATE ERROR:",
                str(e)
            )

            return Response(
                {
                    "detail":
                    "Unable to create Razorpay order.",

                    "error":
                    str(e),
                },
                status=(
                    status.HTTP_500_INTERNAL_SERVER_ERROR
                ),
            )


# =========================================================
# VERIFY RAZORPAY PAYMENT
# =========================================================

class VerifyRazorpayPaymentView(
    generics.GenericAPIView
):

    permission_classes = [
        IsAuthenticated
    ]

    def post(
        self,
        request,
        pk
    ):

        try:

            order = Order.objects.get(
                pk=pk,
                customer=request.user
            )

        except Order.DoesNotExist:

            return Response(
                {
                    "detail":
                    "Order not found."
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        razorpay_order_id = (
            request.data.get(
                "razorpay_order_id"
            )
        )

        razorpay_payment_id = (
            request.data.get(
                "razorpay_payment_id"
            )
        )

        razorpay_signature = (
            request.data.get(
                "razorpay_signature"
            )
        )

        if not all(
            [
                razorpay_order_id,
                razorpay_payment_id,
                razorpay_signature,
            ]
        ):

            return Response(
                {
                    "detail":
                    "Missing Razorpay payment information."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if (
            order.razorpay_order_id
            and
            order.razorpay_order_id
            != razorpay_order_id
        ):

            return Response(
                {
                    "detail":
                    "Razorpay order ID does not match."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:

            import razorpay

            key_id = getattr(
                settings,
                "RAZORPAY_KEY_ID",
                ""
            )

            key_secret = getattr(
                settings,
                "RAZORPAY_KEY_SECRET",
                ""
            )

            if not key_id or not key_secret:

                return Response(
                    {
                        "detail":
                        "Razorpay credentials are not configured."
                    },
                    status=(
                        status.HTTP_500_INTERNAL_SERVER_ERROR
                    ),
                )

            client = razorpay.Client(
                auth=(
                    key_id,
                    key_secret
                )
            )

            client.utility.verify_payment_signature(
                {
                    "razorpay_order_id":
                        razorpay_order_id,

                    "razorpay_payment_id":
                        razorpay_payment_id,

                    "razorpay_signature":
                        razorpay_signature,
                }
            )

            order.razorpay_order_id = (
                razorpay_order_id
            )

            order.razorpay_payment_id = (
                razorpay_payment_id
            )

            order.razorpay_signature = (
                razorpay_signature
            )

            order.payment_status = (
                Order.PaymentStatus.PAID
            )

            order.save(
                update_fields=[
                    "razorpay_order_id",
                    "razorpay_payment_id",
                    "razorpay_signature",
                    "payment_status",
                    "updated_at",
                ]
            )

            return Response(
                {
                    "success":
                        True,

                    "message":
                        "Payment verified successfully.",

                    "order":
                        OrderSerializer(
                            order,
                            context={
                                "request":
                                request
                            }
                        ).data,
                },
                status=status.HTTP_200_OK,
            )

        except Exception as e:

            print(
                "RAZORPAY VERIFY ERROR:",
                str(e)
            )

            order.payment_status = (
                Order.PaymentStatus.FAILED
            )

            order.save(
                update_fields=[
                    "payment_status",
                    "updated_at",
                ]
            )

            return Response(
                {
                    "success":
                        False,

                    "detail":
                        "Payment verification failed.",

                    "error":
                        str(e),
                },
                status=status.HTTP_400_BAD_REQUEST,
            )


# =========================================================
# UPDATE ORDER STATUS
# =========================================================

class OrderStatusUpdateView(
    generics.UpdateAPIView
):

    permission_classes = [
        IsAuthenticated,
        IsAdminUser
    ]

    serializer_class = (
        OrderStatusUpdateSerializer
    )

    queryset = Order.objects.all()

    lookup_field = "pk"

    http_method_names = [
        "patch",
        "put"
    ]


# =========================================================
# ADMIN ANALYTICS
# =========================================================

@api_view(["GET"])
@permission_classes(
    [
        IsAuthenticated,
        IsAdminUser
    ]
)
def order_analytics(request):

    try:

        # -------------------------------------------------
        # PERIOD
        # -------------------------------------------------

        period = get_period(request)

        start_date, end_date = (
            get_period_dates(period)
        )

        # -------------------------------------------------
        # ORDERS
        # -------------------------------------------------

        orders = Order.objects.filter(
            created_at__date__gte=start_date,
            created_at__date__lte=end_date,
        )

        # -------------------------------------------------
        # TOTAL ORDERS
        # -------------------------------------------------

        total_orders = orders.count()

        # -------------------------------------------------
        # TOTAL REVENUE
        # -------------------------------------------------

        total_revenue = (
            orders.aggregate(
                total=Sum(
                    "total_amount"
                )
            )["total"]
            or Decimal("0")
        )

        total_revenue = float(
            total_revenue
        )

        # -------------------------------------------------
        # AVERAGE ORDER VALUE
        # -------------------------------------------------

        average_order_value = (
            total_revenue / total_orders
            if total_orders
            else 0
        )

        # -------------------------------------------------
        # CUSTOMERS
        # -------------------------------------------------

        customers = (
            orders
            .values("customer")
            .distinct()
            .count()
        )

        # -------------------------------------------------
        # DAILY SALES
        # -------------------------------------------------

        daily_data = (
            orders
            .annotate(
                date=TruncDate(
                    "created_at"
                )
            )
            .values("date")
            .annotate(
                orders=Count("id"),
                revenue=Sum(
                    "total_amount"
                ),
            )
            .order_by("date")
        )

        sales = []

        for item in daily_data:

            if not item["date"]:
                continue

            sales.append(
                {
                    "date":
                        item["date"].strftime(
                            "%Y-%m-%d"
                        ),

                    "orders":
                        int(
                            item["orders"]
                            or 0
                        ),

                    "revenue":
                        float(
                            item["revenue"]
                            or 0
                        ),
                }
            )

        # -------------------------------------------------
        # MONTHLY SALES
        # -------------------------------------------------

        monthly_data = (
            orders
            .annotate(
                month=TruncMonth("created_at")
            )
            .values("month")
            .annotate(
                orders=Count("id"),
                revenue=Sum("total_amount"),
            )
            .order_by("month")
        )

        monthly_sales = []

        for item in monthly_data:
            if not item["month"]:
                continue

            monthly_sales.append(
                {
                    "month": item["month"].strftime("%Y-%m"),
                    "orders": int(item["orders"] or 0),
                    "revenue": float(item["revenue"] or 0),
                }
            )

        # -------------------------------------------------
        # HOURLY SALES
        # -------------------------------------------------

        hourly_sales = []

        for hour in range(24):
            hour_orders = [
                order
                for order in orders
                if order.created_at
                and order.created_at.hour == hour
            ]

            hourly_sales.append(
                {
                    "hour": f"{hour:02d}:00",
                    "orders": len(hour_orders),
                    "revenue": round(
                        sum(
                            float(order.total_amount or 0)
                            for order in hour_orders
                        ),
                        2,
                    ),
                }
            )

        # -------------------------------------------------
        # WEEKDAY SALES
        # -------------------------------------------------

        weekday_names = [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday",
        ]

        weekday_sales = []

        for weekday_number, weekday_name in enumerate(weekday_names):
            weekday_orders = [
                order
                for order in orders
                if order.created_at
                and order.created_at.weekday() == weekday_number
            ]

            weekday_sales.append(
                {
                    "weekday": weekday_name,
                    "day": weekday_name,
                    "orders": len(weekday_orders),
                    "revenue": round(
                        sum(
                            float(order.total_amount or 0)
                            for order in weekday_orders
                        ),
                        2,
                    ),
                }
            )

        # -------------------------------------------------
        # PEAK SALES INFORMATION
        # -------------------------------------------------

        peak_sales_hour = max(
            hourly_sales,
            key=lambda item: item["revenue"],
            default={
                "hour": None,
                "orders": 0,
                "revenue": 0,
            },
        )

        peak_sales_day = max(
            sales,
            key=lambda item: item["revenue"],
            default={
                "date": None,
                "orders": 0,
                "revenue": 0,
            },
        )

        # -------------------------------------------------
        # ORDER STATUS
        # -------------------------------------------------

        status_data = (
            orders
            .values("status")
            .annotate(
                count=Count("id")
            )
            .order_by("status")
        )

        order_status = []

        for item in status_data:

            order_status.append(
                {
                    "status":
                        item["status"]
                        or "Unknown",

                    "count":
                        int(
                            item["count"]
                            or 0
                        ),
                }
            )

        # -------------------------------------------------
        # PAYMENT STATUS
        # -------------------------------------------------

        payment_data = (
            orders
            .values(
                "payment_status"
            )
            .annotate(
                count=Count("id")
            )
            .order_by(
                "payment_status"
            )
        )

        payment_status = []

        for item in payment_data:

            payment_status.append(
                {
                    "status":
                        item[
                            "payment_status"
                        ]
                        or "Unknown",

                    "count":
                        int(
                            item["count"]
                            or 0
                        ),
                }
            )

        # -------------------------------------------------
        # BEST SALES DAY
        # -------------------------------------------------

        if sales:

            best_sales_day = max(
                sales,
                key=lambda x:
                    x["revenue"]
            )

        else:

            best_sales_day = {
                "date": None,
                "orders": 0,
                "revenue": 0,
            }

        # -------------------------------------------------
        # TOP PRODUCTS
        # -------------------------------------------------

        product_data = (
            OrderItem.objects
            .filter(
                order__created_at__date__gte=
                    start_date,

                order__created_at__date__lte=
                    end_date,
            )
            .values(
                "menu_item",
                "menu_item__name",
            )
            .annotate(
                quantity_sold=Sum(
                    "quantity"
                ),

                revenue=Sum(
                    ExpressionWrapper(
                        F("quantity") * F("price"),
                        output_field=DecimalField(
                            max_digits=14,
                            decimal_places=2,
                        ),
                    )
                ),

                order_count=Count(
                    "order",
                    distinct=True
                ),
            )
            .order_by(
                "-quantity_sold"
            )
        )

        top_products = []

        for item in product_data[:10]:

            top_products.append(
                {
                    "menu_item":
                        item["menu_item"],

                    "name":
                        item[
                            "menu_item__name"
                        ]
                        or "Unknown Product",

                    "quantity":
                        int(
                            item["quantity_sold"]
                            or 0
                        ),

                    "revenue":
                        float(
                            item["revenue"]
                            or 0
                        ),

                    "order_count":
                        int(
                            item[
                                "order_count"
                            ]
                            or 0
                        ),
                }
            )

        # -------------------------------------------------
        # TOP REVENUE PRODUCTS
        # -------------------------------------------------

        top_revenue_products = sorted(
            top_products,
            key=lambda x:
                x["revenue"],
            reverse=True
        )

        # -------------------------------------------------
        # TOP CUSTOMERS
        # -------------------------------------------------

        customer_data = (
            orders
            .values(
                "customer",
                "customer__username",
                "customer__email",
                "full_name",
            )
            .annotate(
                orders=Count("id"),
                revenue=Sum(
                    "total_amount"
                ),
            )
            .order_by(
                "-revenue"
            )
        )

        top_customers = []

        for item in customer_data[:10]:

            name = (
                item["full_name"]
                or item[
                    "customer__username"
                ]
                or item[
                    "customer__email"
                ]
                or "Customer"
            )

            top_customers.append(
                {
                    "customer":
                        item["customer"],

                    "name":
                        name,

                    "email":
                        item[
                            "customer__email"
                        ]
                        or "",

                    "orders":
                        int(
                            item["orders"]
                            or 0
                        ),

                    "revenue":
                        float(
                            item["revenue"]
                            or 0
                        ),
                }
            )

        # -------------------------------------------------
        # BEST PRODUCT INFORMATION
        # -------------------------------------------------

        best_selling_product = (
            top_products[0]
            if top_products
            else None
        )

        highest_revenue_product = (
            top_revenue_products[0]
            if top_revenue_products
            else None
        )

        # -------------------------------------------------
        # RESPONSE
        # -------------------------------------------------

        return Response(
            {
                "period":
                    period,

                "start_date":
                    start_date.strftime(
                        "%Y-%m-%d"
                    ),

                "end_date":
                    end_date.strftime(
                        "%Y-%m-%d"
                    ),

                "summary": {

                    "total_orders":
                        total_orders,

                    "total_revenue":
                        round(
                            total_revenue,
                            2
                        ),

                    "gross_revenue":
                        round(
                            total_revenue,
                            2
                        ),

                    "average_order_value":
                        round(
                            average_order_value,
                            2
                        ),

                    "customers":
                        customers,
                },

                "sales":
                    sales,

                "daily_sales":
                    sales,

                "monthly_sales":
                    monthly_sales,

                "hourly_sales":
                    hourly_sales,

                "weekday_sales":
                    weekday_sales,

                "order_status":
                    order_status,

                "status_breakdown":
                    order_status,

                "status":
                    {
                        item["status"]: item["count"]
                        for item in order_status
                    },

                "payment_status":
                    payment_status,

                "payment_breakdown":
                    payment_status,

                "best_sales_day":
                    best_sales_day,

                "peak_sales_day":
                    peak_sales_day,

                "peak_sales_hour":
                    peak_sales_hour,

                "top_products":
                    top_products,

                "top_selling_products":
                    top_products,

                "top_revenue_products":
                    top_revenue_products,

                "best_selling_product":
                    best_selling_product,

                "highest_revenue_product":
                    highest_revenue_product,

                "top_customers":
                    top_customers,

                "product_sales":
                    top_products,
            },

            status=status.HTTP_200_OK
        )

    except Exception as e:

        print(
            "ANALYTICS ERROR:",
            str(e)
        )

        return Response(
            {
                "detail":
                    "Unable to load analytics.",

                "error":
                    str(e),
            },

            status=(
                status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        )


# =========================================================
# DASHBOARD STATS
# =========================================================

@api_view(["GET"])
@permission_classes(
    [
        IsAuthenticated,
        IsAdminUser
    ]
)
def order_stats(request):

    try:

        total_orders = (
            Order.objects.count()
        )

        total_revenue = (
            Order.objects.aggregate(
                total=Sum(
                    "total_amount"
                )
            )["total"]
            or Decimal("0")
        )

        # -------------------------------------------------
        # PENDING
        # -------------------------------------------------

        try:

            pending_orders = (
                Order.objects.filter(
                    status=
                        Order.Status.PLACED
                ).count()
            )

        except AttributeError:

            pending_orders = (
                Order.objects.filter(
                    status="PLACED"
                ).count()
            )

        # -------------------------------------------------
        # DELIVERED
        # -------------------------------------------------

        try:

            delivered_orders = (
                Order.objects.filter(
                    status=
                        Order.Status.DELIVERED
                ).count()
            )

        except AttributeError:

            delivered_orders = (
                Order.objects.filter(
                    status="DELIVERED"
                ).count()
            )

        # -------------------------------------------------
        # PAID
        # -------------------------------------------------

        try:

            paid_orders = (
                Order.objects.filter(
                    payment_status=
                        Order.PaymentStatus.PAID
                ).count()
            )

        except AttributeError:

            paid_orders = (
                Order.objects.filter(
                    payment_status="PAID"
                ).count()
            )

        return Response(
            {
                "total_orders":
                    total_orders,

                "total_revenue":
                    float(
                        total_revenue
                    ),

                "gross_revenue":
                    float(
                        total_revenue
                    ),

                "pending_orders":
                    pending_orders,

                "delivered_orders":
                    delivered_orders,

                "paid_orders":
                    paid_orders,
            },

            status=status.HTTP_200_OK
        )

    except Exception as e:

        print(
            "STATS ERROR:",
            str(e)
        )

        return Response(
            {
                "detail":
                    "Unable to load dashboard statistics.",

                "error":
                    str(e),
            },

            status=(
                status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        )


# =========================================================
# EXPORT ORDERS
# =========================================================

@api_view(["GET"])
@permission_classes(
    [
        IsAuthenticated,
        IsAdminUser
    ]
)
def order_export(request):

    try:

        period = get_period(
            request
        )

        start_date, end_date = (
            get_period_dates(
                period
            )
        )

        orders = (
            Order.objects
            .select_related(
                "customer"
            )
            .prefetch_related(
                "items__menu_item"
            )
            .filter(
                created_at__date__gte=
                    start_date,

                created_at__date__lte=
                    end_date,
            )
            .order_by(
                "-created_at"
            )
        )

        export_format = (
            request.GET.get(
                "format",
                "xlsx"
            )
            .lower()
            .strip()
        )

        # =================================================
        # CSV EXPORT
        # =================================================

        if export_format == "csv":

            response = HttpResponse(
                content_type=
                    "text/csv"
            )

            response[
                "Content-Disposition"
            ] = (
                'attachment; '
                f'filename="spice_garden_orders_{period}days.csv"'
            )

            writer = csv.writer(
                response
            )

            writer.writerow(
                [
                    "Order ID",
                    "Customer",
                    "Full Name",
                    "Phone",
                    "Email",
                    "Subtotal",
                    "Delivery Charge",
                    "Total Amount",
                    "Status",
                    "Payment Status",
                    "Created At",
                ]
            )

            for order in orders:

                customer_name = ""

                if order.customer:

                    customer_name = (
                        order.customer
                        .get_full_name()
                    )

                    if not customer_name:

                        customer_name = (
                            order.customer
                            .username
                        )

                writer.writerow(
                    [
                        order.order_id,

                        customer_name,

                        getattr(
                            order,
                            "full_name",
                            ""
                        ),

                        getattr(
                            order,
                            "phone",
                            ""
                        ),

                        getattr(
                            order,
                            "email",
                            ""
                        ),

                        float(
                            getattr(
                                order,
                                "subtotal",
                                0
                            )
                            or 0
                        ),

                        float(
                            getattr(
                                order,
                                "delivery_charge",
                                0
                            )
                            or 0
                        ),

                        float(
                            getattr(
                                order,
                                "total_amount",
                                0
                            )
                            or 0
                        ),

                        getattr(
                            order,
                            "status",
                            ""
                        ),

                        getattr(
                            order,
                            "payment_status",
                            ""
                        ),

                        (
                            order.created_at
                            .isoformat()
                            if order.created_at
                            else ""
                        ),
                    ]
                )

            return response

        # =================================================
        # XLSX EXPORT
        # =================================================

        workbook = Workbook()

        worksheet = (
            workbook.active
        )

        worksheet.title = "Orders"

        headers = [
            "Order ID",
            "Customer",
            "Full Name",
            "Phone",
            "Email",
            "Subtotal",
            "Delivery Charge",
            "Total Amount",
            "Status",
            "Payment Status",
            "Created At",
        ]

        worksheet.append(
            headers
        )

        for order in orders:

            customer_name = ""

            if order.customer:

                customer_name = (
                    order.customer
                    .get_full_name()
                )

                if not customer_name:

                    customer_name = (
                        order.customer
                        .username
                    )

            worksheet.append(
                [
                    order.order_id,

                    customer_name,

                    getattr(
                        order,
                        "full_name",
                        ""
                    ),

                    getattr(
                        order,
                        "phone",
                        ""
                    ),

                    getattr(
                        order,
                        "email",
                        ""
                    ),

                    float(
                        getattr(
                            order,
                            "subtotal",
                            0
                        )
                        or 0
                    ),

                    float(
                        getattr(
                            order,
                            "delivery_charge",
                            0
                        )
                        or 0
                    ),

                    float(
                        getattr(
                            order,
                            "total_amount",
                            0
                        )
                        or 0
                    ),

                    getattr(
                        order,
                        "status",
                        ""
                    ),

                    getattr(
                        order,
                        "payment_status",
                        ""
                    ),

                    (
                        order.created_at
                        .strftime(
                            "%Y-%m-%d %H:%M:%S"
                        )
                        if order.created_at
                        else ""
                    ),
                ]
            )

        # -------------------------------------------------
        # COLUMN WIDTHS
        # -------------------------------------------------

        widths = {
            "A": 18,
            "B": 24,
            "C": 24,
            "D": 16,
            "E": 30,
            "F": 14,
            "G": 18,
            "H": 16,
            "I": 18,
            "J": 18,
            "K": 22,
        }

        for column, width in (
            widths.items()
        ):

            worksheet.column_dimensions[
                column
            ].width = width

        response = HttpResponse(
            content_type=(
                "application/vnd.openxmlformats-officedocument."
                "spreadsheetml.sheet"
            )
        )

        response[
            "Content-Disposition"
        ] = (
            'attachment; '
            f'filename="spice_garden_orders_{period}days.xlsx"'
        )

        workbook.save(
            response
        )

        return response

    except Exception as e:

        print(
            "EXPORT ERROR:",
            str(e)
        )

        return Response(
            {
                "detail":
                    "Unable to export orders.",

                "error":
                    str(e),
            },

            status=(
                status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        )