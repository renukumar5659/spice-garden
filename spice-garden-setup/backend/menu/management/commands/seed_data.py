from django.core.management.base import BaseCommand
from menu.models import Category, MenuItem


CATEGORIES = ["Starters", "Main Course", "Rice & Noodles", "Coolers"]


ITEMS = [
    (
        "Starters",
        "Paneer Tikka",
        "Chargrilled cottage cheese cubes marinated in smoky spiced yogurt.",
        "Paneer, yogurt, ginger-garlic paste, tikka masala, bell peppers",
        180,
        True,
        "medium",
        "menu_items/images.webp",
    ),
    (
        "Starters",
        "Chicken Tikka",
        "Tender chicken pieces marinated overnight and roasted in the tandoor.",
        "Chicken, yogurt, ginger-garlic paste, tikka masala",
        220,
        False,
        "medium",
        "menu_items/images_5.jfif",
    ),
    (
        "Starters",
        "Veg Manchurian",
        "Crispy vegetable dumplings tossed in a tangy Indo-Chinese sauce.",
        "Mixed vegetables, cornflour, soy sauce, garlic, spring onion",
        160,
        True,
        "hot",
        "menu_items/images_15.jfif",
    ),
    (
        "Main Course",
        "Paneer Butter Masala",
        "Cottage cheese simmered in a velvety tomato-butter gravy.",
        "Paneer, tomato, butter, cream, kasuri methi",
        210,
        True,
        "mild",
        "menu_items/images_12.jfif",
    ),
    (
        "Main Course",
        "Chicken Curry",
        "Home-style chicken curry slow-cooked in onion-tomato masala.",
        "Chicken, onion, tomato, curry spices",
        240,
        False,
        "hot",
        "menu_items/images_4.jfif",
    ),
    (
        "Main Course",
        "Dal Tadka",
        "Yellow lentils tempered with cumin, garlic and dried red chilies.",
        "Toor dal, cumin, garlic, ghee, dried chilies",
        150,
        True,
        "mild",
        "menu_items/images_8.jfif",
    ),
    (
        "Rice & Noodles",
        "Veg Fried Rice",
        "Wok-tossed rice with fresh vegetables and soy sauce.",
        "Rice, mixed vegetables, soy sauce, spring onion",
        160,
        True,
        "medium",
        "menu_items/images_19.jfif",
    ),
    (
        "Rice & Noodles",
        "Chicken Fried Rice",
        "Wok-tossed rice with tender chicken and soy sauce.",
        "Rice, chicken, soy sauce, spring onion",
        200,
        False,
        "medium",
        "menu_items/images_17.jfif",
    ),
    (
        "Rice & Noodles",
        "Hakka Noodles",
        "Stir-fried noodles with crunchy vegetables, Indo-Chinese style.",
        "Noodles, cabbage, carrot, soy sauce",
        170,
        True,
        "medium",
        "menu_items/images_18.jfif",
    ),
    (
        "Coolers",
        "Fresh Lime Soda",
        "Chilled soda with fresh lime, a classic thirst-quencher.",
        "Lime, soda, sugar, mint",
        80,
        True,
        "mild",
        None,
    ),
    (
        "Coolers",
        "Mango Lassi",
        "Creamy yogurt shake blended with sweet Alphonso mango pulp.",
        "Mango pulp, yogurt, sugar",
        100,
        True,
        "mild",
        None,
    ),
    (
        "Coolers",
        "Cold Coffee",
        "Frothy chilled coffee blended with milk and ice cream.",
        "Coffee, milk, sugar, ice cream",
        120,
        True,
        "mild",
        None,
    ),
]


class Command(BaseCommand):
    help = "Seed the database with sample Spice Garden Restaurant categories and menu items."

    def handle(self, *args, **options):

        # Seed categories.
        category_map = {}

        for index, name in enumerate(CATEGORIES):
            category, created = Category.objects.get_or_create(
                name=name,
                defaults={"order": index},
            )

            category_map[name] = category

            if created:
                self.stdout.write(
                    self.style.SUCCESS(f"Created category: {name}")
                )
            else:
                self.stdout.write(
                    f"Exists category: {name}"
                )

        # Seed menu items.
        for (
            category_name,
            name,
            description,
            ingredients,
            price,
            is_veg,
            spice_level,
            image,
        ) in ITEMS:

            item, created = MenuItem.objects.get_or_create(
                name=name,
                defaults={
                    "category": category_map[category_name],
                    "description": description,
                    "ingredients": ingredients,
                    "price": price,
                    "is_veg": is_veg,
                    "spice_level": spice_level,
                    "image": image,
                },
            )

            if created:
                self.stdout.write(
                    self.style.SUCCESS(f"Created item: {name}")
                )
            else:
                # Keep existing item information but update its image
                # when an image is provided.
                if image:
                    item.image = image
                    item.save(update_fields=["image"])

                self.stdout.write(
                    f"Exists item: {name}"
                )

        self.stdout.write(
            self.style.SUCCESS("Sample data seeding complete.")
        )