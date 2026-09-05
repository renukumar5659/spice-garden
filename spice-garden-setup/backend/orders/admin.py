from django.contrib import admin

from .models import Order, OrderItem


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ["menu_item", "quantity", "price"]


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ["order_id", "customer", "status", "total_amount", "created_at"]
    list_filter = ["status", "created_at"]
    search_fields = ["order_id", "customer__email", "phone"]
    readonly_fields = ["order_id", "subtotal", "delivery_charge", "total_amount", "created_at", "updated_at"]
    inlines = [OrderItemInline]
