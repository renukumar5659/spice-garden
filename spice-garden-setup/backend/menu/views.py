from rest_framework import permissions, viewsets
from rest_framework.parsers import FormParser, MultiPartParser

from .models import Category, MenuItem
from .serializers import CategorySerializer, MenuItemSerializer


class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Anyone can read the menu.
    Only authenticated staff users can create, update, or delete.
    """

    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True

        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.is_staff
        )


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAdminOrReadOnly]


class MenuItemViewSet(viewsets.ModelViewSet):
    """
    Full CRUD for menu items.

    Supports:
    /api/menu/?category=<id>
    /api/menu/?veg=true
    /api/menu/?search=paneer

    Also accepts image uploads using multipart/form-data.
    """

    serializer_class = MenuItemSerializer
    permission_classes = [IsAdminOrReadOnly]
    parser_classes = [MultiPartParser, FormParser]

    def get_queryset(self):
        qs = MenuItem.objects.select_related("category").all()

        # Customers only see available items.
        if not (
            self.request.user.is_authenticated
            and self.request.user.is_staff
        ):
            qs = qs.filter(available=True)

        category = self.request.query_params.get("category")
        if category:
            qs = qs.filter(category_id=category)

        veg = self.request.query_params.get("veg")
        if veg is not None:
            qs = qs.filter(is_veg=(veg.lower() == "true"))

        search = self.request.query_params.get("search")
        if search:
            qs = qs.filter(name__icontains=search)

        return qs