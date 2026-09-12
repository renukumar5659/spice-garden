from django.db import models


class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    order = models.PositiveIntegerField(
        default=0,
        help_text="Controls display order on the menu page."
    )

    class Meta:
        ordering = ["order", "name"]
        verbose_name_plural = "Categories"

    def __str__(self):
        return self.name


class MenuItem(models.Model):
    class SpiceLevel(models.TextChoices):
        MILD = "mild", "Mild"
        MEDIUM = "medium", "Medium"
        HOT = "hot", "Hot"
        COOL = "cool", "Cool"
        WARM = "warm", "Warm"

    class FoodType(models.TextChoices):
        VEG = "veg", "Veg"
        NON_VEG = "nonveg", "Non-Veg"
        SWEET = "sweet", "Sweet"

    category = models.ForeignKey(
        Category,
        on_delete=models.CASCADE,
        related_name="items"
    )

    name = models.CharField(max_length=150)

    description = models.TextField(blank=True)

    ingredients = models.TextField(
        blank=True,
        help_text="Comma-separated ingredients."
    )

    price = models.DecimalField(
        max_digits=8,
        decimal_places=2
    )

    image = models.ImageField(
        upload_to="menu_items/",
        blank=True,
        null=True
    )

    is_veg = models.BooleanField(default=True)

    food_type = models.CharField(
        max_length=10,
        choices=FoodType.choices,
        default=FoodType.VEG
    )

    spice_level = models.CharField(
        max_length=10,
        choices=SpiceLevel.choices,
        default=SpiceLevel.MEDIUM
    )

    available = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["category__order", "name"]

    def __str__(self):
        return f"{self.name} (₹{self.price})"