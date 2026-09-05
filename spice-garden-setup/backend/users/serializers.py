from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id", "username", "first_name", "last_name", "email",
            "phone", "address", "is_staff", "created_at",
        ]
        read_only_fields = ["id", "is_staff", "created_at"]


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    name = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ["name", "email", "phone", "address", "password"]

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("An account with this email already exists.")
        return value

    def create(self, validated_data):
        name = validated_data.pop("name", "").strip()
        first_name, _, last_name = name.partition(" ")
        email = validated_data.pop("email")
        password = validated_data.pop("password")
        user = User(
            username=email,
            email=email,
            first_name=first_name,
            last_name=last_name,
            phone=validated_data.get("phone", ""),
            address=validated_data.get("address", ""),
        )
        user.set_password(password)
        user.save()
        return user


class EmailTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Allows login with email + password, and returns user info alongside tokens."""
    username_field = "email"

    def validate(self, attrs):
        data = super().validate(attrs)
        data["user"] = UserSerializer(self.user).data
        return data
