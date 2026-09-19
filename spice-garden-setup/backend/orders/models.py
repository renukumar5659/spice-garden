import uuid

from django.conf import settings
from django.db import models

from menu.models import MenuItem


# =========================================================
# DELIVERY CHARGE
# =========================================================

DELIVERY_CHARGE = 40


# =========================================================
# ORDER MODEL
# =========================================================

class Order(models.Model):

    class Status(models.TextChoices):
        PLACED = "placed", "Order Placed"
        CONFIRMED = "confirmed", "Confirmed"
        PREPARING = "preparing", "Preparing"
        READY = "ready", "Ready"
        OUT_FOR_DELIVERY = "out_for_delivery", "Out for Delivery"
        DELIVERED = "delivered", "Delivered"

    class PaymentStatus(models.TextChoices):
        PENDING = "pending", "Payment Pending"
        PAID = "paid", "Paid"
        FAILED = "failed", "Payment Failed"

    # -----------------------------------------------------
    # Order ID
    # -----------------------------------------------------

    order_id = models.CharField(
        max_length=20,
        unique=True,
        editable=False,
    )

    # -----------------------------------------------------
    # Customer
    # -----------------------------------------------------

    customer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="orders",
    )

    # -----------------------------------------------------
    # Customer / Delivery Details
    # -----------------------------------------------------

    full_name = models.CharField(
        max_length=150,
    )

    phone = models.CharField(
        max_length=15,
    )

    email = models.EmailField()

    delivery_address = models.TextField()

    pin_code = models.CharField(
        max_length=10,
    )

    special_instructions = models.TextField(
        blank=True,
    )

    # -----------------------------------------------------
    # Price Details
    # -----------------------------------------------------

    subtotal = models.DecimalField(
        max_digits=10,
        decimal_places=2,
    )

    delivery_charge = models.DecimalField(
        max_digits=6,
        decimal_places=2,
        default=DELIVERY_CHARGE,
    )

    total_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
    )

    # -----------------------------------------------------
    # Order Status
    # -----------------------------------------------------

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PLACED,
    )

    # -----------------------------------------------------
    # Payment Status
    # -----------------------------------------------------

    payment_status = models.CharField(
        max_length=20,
        choices=PaymentStatus.choices,
        default=PaymentStatus.PENDING,
    )

    # -----------------------------------------------------
    # Razorpay Details
    # -----------------------------------------------------

    razorpay_order_id = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        unique=True,
    )

    razorpay_payment_id = models.CharField(
        max_length=100,
        blank=True,
        null=True,
    )

    razorpay_signature = models.CharField(
        max_length=255,
        blank=True,
        null=True,
    )

    # -----------------------------------------------------
    # Timestamps
    # -----------------------------------------------------

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    # -----------------------------------------------------
    # Meta
    # -----------------------------------------------------

    class Meta:
        ordering = ["-created_at"]

    # -----------------------------------------------------
    # Save
    # -----------------------------------------------------

    def save(self, *args, **kwargs):

        if not self.order_id:
            self.order_id = (
                f"SG{uuid.uuid4().hex[:8].upper()}"
            )

        super().save(*args, **kwargs)

    # -----------------------------------------------------
    # String
    # -----------------------------------------------------

    def __str__(self):
        return (
            f"Order {self.order_id} "
            f"({self.get_status_display()})"
        )


# =========================================================
# ORDER ITEM MODEL
# =========================================================

class OrderItem(models.Model):

    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name="items",
    )

    menu_item = models.ForeignKey(
        MenuItem,
        on_delete=models.PROTECT,
        related_name="order_items",
    )

    quantity = models.PositiveIntegerField(
        default=1,
    )

    price = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        help_text="Price per unit at time of order.",
    )

    # -----------------------------------------------------
    # Line Total
    # -----------------------------------------------------

    @property
    def line_total(self):
        return self.quantity * self.price

    # -----------------------------------------------------
    # String
    # -----------------------------------------------------

    def __str__(self):
        return (
            f"{self.quantity} x "
            f"{self.menu_item.name}"
        )