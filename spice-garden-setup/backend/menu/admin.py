from django.contrib import admin

from .models import Category, MenuItem


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ["name", "order"]


@admin.register(MenuItem)
class MenuItemAdmin(admin.ModelAdmin):
    list_display = ["name", "category", "price", "is_veg", "spice_level", "available"]
    list_filter = ["category", "is_veg", "spice_level", "available"]
    search_fields = ["name", "description"]
