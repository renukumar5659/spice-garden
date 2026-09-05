from django.db import transaction
from rest_framework import serializers

from menu.models import MenuItem
from menu.serializers import MenuItemSerializer

from .models import DELIVERY_CHARGE, Order, OrderItem


class OrderItemSerializer(serializers.ModelSerializer):
    menu_item_detail = MenuItemSerializer(source="menu_item", read_only=True)
    line_total = serializers.ReadOnlyField()

    class Meta:
        model = OrderItem
        fields = ["id", "menu_item", "menu_item_detail", "quantity", "price", "line_total"]
        read_only_fields = ["price"]


class OrderSerializer(serializers.ModelSerializer):
    """Read serializer — includes nested items and customer's name for admin views."""
    items = OrderItemSerializer(many=True, read_only=True)
    customer_name = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = [
            "id", "order_id", "customer", "customer_name", "full_name", "phone", "email",
            "delivery_address", "pin_code", "special_instructions",
            "subtotal", "delivery_charge", "total_amount", "status",
            "items", "created_at", "updated_at",
        ]
        read_only_fields = fields

    def get_customer_name(self, obj):
        return obj.customer.get_full_name() or obj.customer.username


class CartItemInputSerializer(serializers.Serializer):
    menu_item = serializers.PrimaryKeyRelatedField(queryset=MenuItem.objects.filter(available=True))
    quantity = serializers.IntegerField(min_value=1)


class OrderCreateSerializer(serializers.ModelSerializer):
    """Write serializer used at checkout — takes cart items and delivery details."""
    items = CartItemInputSerializer(many=True, write_only=True)

    class Meta:
        model = Order
        fields = [
            "full_name", "phone", "email", "delivery_address",
            "pin_code", "special_instructions", "items",
        ]

    def validate_items(self, value):
        if not value:
            raise serializers.ValidationError("Cart cannot be empty.")
        return value

    @transaction.atomic
    def create(self, validated_data):
        items_data = validated_data.pop("items")
        subtotal = sum(item["menu_item"].price * item["quantity"] for item in items_data)
        total = subtotal + DELIVERY_CHARGE

        order = Order.objects.create(
            customer=self.context["request"].user,
            subtotal=subtotal,
            delivery_charge=DELIVERY_CHARGE,
            total_amount=total,
            **validated_data,
        )
        OrderItem.objects.bulk_create([
            OrderItem(
                order=order,
                menu_item=item["menu_item"],
                quantity=item["quantity"],
                price=item["menu_item"].price,
            )
            for item in items_data
        ])
        return order


class OrderStatusUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = ["status"]
