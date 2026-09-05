from rest_framework.routers import DefaultRouter

from .views import CategoryViewSet, MenuItemViewSet

router = DefaultRouter()
router.register("menu", MenuItemViewSet, basename="menu")
router.register("categories", CategoryViewSet, basename="category")

urlpatterns = router.urls
