from django.db import transaction
from rest_framework import serializers

from menu.models import MenuItem
from menu.serializers import MenuItemSerializer

from .models import DELIVERY_CHARGE, Order, OrderItem


# =========================================================
# ORDER ITEM SERIALIZER
# =========================================================

class OrderItemSerializer(serializers.ModelSerializer):
    menu_item_detail = MenuItemSerializer(
        source="menu_item",
        read_only=True
    )

    line_total = serializers.ReadOnlyField()

    class Meta:
        model = OrderItem

        fields = [
            "id",
            "menu_item",
            "menu_item_detail",
            "quantity",
            "price",
            "line_total",
        ]

        read_only_fields = [
            "price",
            "line_total",
        ]


# =========================================================
# ORDER READ SERIALIZER
# =========================================================

class OrderSerializer(serializers.ModelSerializer):
    """
    Read serializer.

    Used for:
    - Customer orders
    - Admin orders
    - Order details
    """

    items = OrderItemSerializer(
        many=True,
        read_only=True
    )

    customer_name = serializers.SerializerMethodField()

    class Meta:
        model = Order

        fields = [
            # Basic order information
            "id",
            "order_id",

            # Customer information
            "customer",
            "customer_name",
            "full_name",
            "phone",
            "email",

            # Delivery information
            "delivery_address",
            "pin_code",
            "special_instructions",

            # Amount information
            "subtotal",
            "delivery_charge",
            "total_amount",

            # Order status
            "status",

            # Payment information
            "payment_status",
            "razorpay_order_id",
            "razorpay_payment_id",
            "razorpay_signature",

            # Order items
            "items",

            # Timestamps
            "created_at",
            "updated_at",
        ]

        read_only_fields = fields

    def get_customer_name(self, obj):
        """
        Return customer's full name.
        If full name is empty, return username.
        """

        return (
            obj.customer.get_full_name()
            or obj.customer.username
        )


# =========================================================
# CART ITEM INPUT SERIALIZER
# =========================================================

class CartItemInputSerializer(serializers.Serializer):
    """
    Input serializer used when creating an order.

    Example:

    {
        "menu_item": 5,
        "quantity": 2
    }
    """

    menu_item = serializers.PrimaryKeyRelatedField(
        queryset=MenuItem.objects.filter(
            available=True
        )
    )

    quantity = serializers.IntegerField(
        min_value=1
    )


# =========================================================
# ORDER CREATE SERIALIZER
# =========================================================

class OrderCreateSerializer(serializers.ModelSerializer):
    """
    Write serializer used during checkout.

    It:
    - Accepts customer details
    - Accepts cart items
    - Calculates subtotal
    - Adds delivery charge
    - Calculates total amount
    - Creates OrderItem records
    - Returns the generated order ID
    """

    items = CartItemInputSerializer(
        many=True,
        write_only=True
    )

    class Meta:
        model = Order

        fields = [
            # IMPORTANT:
            # These fields are returned after order creation.
            "id",
            "order_id",

            # Customer / delivery details
            "full_name",
            "phone",
            "email",
            "delivery_address",
            "pin_code",
            "special_instructions",

            # Calculated amount fields
            "subtotal",
            "delivery_charge",
            "total_amount",

            # Status information
            "status",
            "payment_status",

            # Razorpay order ID
            "razorpay_order_id",

            # Cart items
            "items",

            # Timestamp
            "created_at",
        ]

        read_only_fields = [
            "id",
            "order_id",
            "subtotal",
            "delivery_charge",
            "total_amount",
            "status",
            "payment_status",
            "razorpay_order_id",
            "created_at",
        ]

    # =====================================================
    # VALIDATE CART
    # =====================================================

    def validate_items(self, value):
        """
        Make sure the cart contains at least one item.
        """

        if not value:
            raise serializers.ValidationError(
                "Cart cannot be empty."
            )

        return value

    # =====================================================
    # CREATE ORDER
    # =====================================================

    @transaction.atomic
    def create(self, validated_data):

        # -------------------------------------------------
        # Get cart items
        # -------------------------------------------------

        items_data = validated_data.pop(
            "items"
        )

        # -------------------------------------------------
        # Calculate subtotal
        # -------------------------------------------------

        subtotal = sum(
            item["menu_item"].price
            * item["quantity"]
            for item in items_data
        )

        # -------------------------------------------------
        # Calculate final total
        # -------------------------------------------------

        total = (
            subtotal
            + DELIVERY_CHARGE
        )

        # -------------------------------------------------
        # Create Order
        # -------------------------------------------------

        order = Order.objects.create(
            customer=self.context[
                "request"
            ].user,

            subtotal=subtotal,

            delivery_charge=(
                DELIVERY_CHARGE
            ),

            total_amount=total,

            **validated_data,
        )

        # -------------------------------------------------
        # Create Order Items
        # -------------------------------------------------

        OrderItem.objects.bulk_create(
            [
                OrderItem(
                    order=order,

                    menu_item=item[
                        "menu_item"
                    ],

                    quantity=item[
                        "quantity"
                    ],

                    price=item[
                        "menu_item"
                    ].price,
                )

                for item in items_data
            ]
        )

        # -------------------------------------------------
        # Return created order
        # -------------------------------------------------

        return order


# =========================================================
# ORDER STATUS UPDATE SERIALIZER
# =========================================================

class OrderStatusUpdateSerializer(
    serializers.ModelSerializer
):
    """
    Used by admin to update order status.
    """

    class Meta:
        model = Order

        fields = [
            "status",
        ]