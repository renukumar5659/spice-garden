from rest_framework import serializers

from .models import Review


class ReviewSerializer(serializers.ModelSerializer):
    customer_name = serializers.SerializerMethodField()

    class Meta:
        model = Review
        fields = ["id", "customer", "customer_name", "rating", "comment", "created_at"]
        read_only_fields = ["id", "customer", "created_at"]

    def get_customer_name(self, obj):
        return obj.customer.get_full_name() or obj.customer.username

    def create(self, validated_data):
        validated_data["customer"] = self.context["request"].user
        return super().create(validated_data)
