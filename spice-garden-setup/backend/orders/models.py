import uuid

from django.conf import settings
from django.db import models

from menu.models import MenuItem

DELIVERY_CHARGE = 40  # flat delivery charge in INR


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

    order_id = models.CharField(
        max_length=20,
        unique=True,
        editable=False,
    )

    customer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="orders",
    )

    full_name = models.CharField(max_length=150)
    phone = models.CharField(max_length=15)
    email = models.EmailField()
    delivery_address = models.TextField()
    pin_code = models.CharField(max_length=10)
    special_instructions = models.TextField(blank=True)

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

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PLACED,
    )

    # Razorpay payment information
    payment_status = models.CharField(
        max_length=20,
        choices=PaymentStatus.choices,
        default=PaymentStatus.PENDING,
    )

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

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def save(self, *args, **kwargs):
        if not self.order_id:
            self.order_id = f"SG{uuid.uuid4().hex[:8].upper()}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Order {self.order_id} ({self.get_status_display()})"


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

    quantity = models.PositiveIntegerField(default=1)

    price = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        help_text="Price per unit at time of order.",
    )

    @property
    def line_total(self):
        return self.quantity * self.price

    def __str__(self):
        return f"{self.quantity} x {self.menu_item.name}"