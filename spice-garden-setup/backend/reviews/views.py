from rest_framework import permissions, viewsets

from .models import Review
from .serializers import ReviewSerializer


class ReviewViewSet(viewsets.ModelViewSet):
    """
    GET  /api/reviews/  -> public, everyone can read reviews
    POST /api/reviews/  -> logged-in customers can post a review
    """
    queryset = Review.objects.select_related("customer").all()
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    http_method_names = ["get", "post", "head"]
