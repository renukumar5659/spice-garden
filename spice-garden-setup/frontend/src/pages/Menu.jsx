import { useEffect, useState } from "react";

import MenuItemCard from "../components/MenuItemCard";
import Loading from "../components/Loading";
import EmptyState from "../components/EmptyState";
import * as menuService from "../services/menuService";

export default function Menu() {
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);

  const [activeCategory, setActiveCategory] = useState("all");
  const [foodType, setFoodType] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // =========================
  // LOAD CATEGORIES
  // =========================
  useEffect(() => {
    menuService
      .fetchCategories()
      .then((data) => {
        setCategories(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        setCategories([]);
      });
  }, []);

  // =========================
  // LOAD MENU ITEMS
  // =========================
  useEffect(() => {
    let cancelled = false;

    setLoading(true);

    const params = {};

    if (activeCategory !== "all") {
      params.category = activeCategory;
    }

    if (search.trim()) {
      params.search = search.trim();
    }

    menuService
      .fetchMenuItems(params)
      .then((data) => {
        if (cancelled) return;

        let menuItems = Array.isArray(data) ? data : [];

        // =========================
        // FOOD TYPE FILTER
        // =========================
        if (foodType !== "all") {
          menuItems = menuItems.filter((item) => {
            const type = String(item.food_type || "")
              .trim()
              .toLowerCase()
              .replace(/[\s_-]/g, "");

            // VEG
            if (foodType === "veg") {
              return (
                type === "veg" ||
                (!type && item.is_veg === true)
              );
            }

            // NON-VEG
            if (foodType === "nonveg") {
              return (
                type === "nonveg" ||
                (!type && item.is_veg === false)
              );
            }

            // SWEET
            if (foodType === "sweet") {
              return type === "sweet";
            }

            return true;
          });
        }

        setItems(menuItems);
      })
      .catch(() => {
        if (!cancelled) {
          setItems([]);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [activeCategory, foodType, search]);

  // =========================
  // FOOD TYPE BUTTON
  // =========================
  function handleFoodType(type) {
    setFoodType(type);
  }

  // =========================
  // CATEGORY BUTTON
  // =========================
  function handleCategory(categoryId) {
    setActiveCategory(categoryId);
  }

  return (
    <div className="container section-tight">

      {/* =========================
          PAGE HEADING
      ========================= */}
      <div className="section-heading">
        <span className="eyebrow">
          Our menu
        </span>

        <h1>
          Starters to coolers, all made fresh
        </h1>
      </div>

      {/* =========================
          SEARCH
      ========================= */}
      <div className="menu-toolbar">
        <input
          type="search"
          placeholder="Search dishes…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="menu-search"
        />
      </div>

      {/* =========================
          FOOD TYPE FILTERS
      ========================= */}
      <div className="category-tabs">

        <button
          type="button"
          className={`category-tab ${
            foodType === "all" ? "active" : ""
          }`}
          onClick={() => handleFoodType("all")}
        >
          All
        </button>

        <button
          type="button"
          className={`category-tab ${
            foodType === "veg" ? "active" : ""
          }`}
          onClick={() => handleFoodType("veg")}
        >
          Veg
        </button>

        <button
          type="button"
          className={`category-tab ${
            foodType === "nonveg" ? "active" : ""
          }`}
          onClick={() => handleFoodType("nonveg")}
        >
          Non-Veg
        </button>

        <button
          type="button"
          className={`category-tab ${
            foodType === "sweet" ? "active" : ""
          }`}
          onClick={() => handleFoodType("sweet")}
        >
          Sweet
        </button>

      </div>

      {/* =========================
          CATEGORY FILTERS
      ========================= */}
      <div className="category-tabs">

        <button
          type="button"
          className={`category-tab ${
            activeCategory === "all" ? "active" : ""
          }`}
          onClick={() => handleCategory("all")}
        >
          All Categories
        </button>

        {categories.map((category) => (
          <button
            type="button"
            key={category.id}
            className={`category-tab ${
              activeCategory === category.id
                ? "active"
                : ""
            }`}
            onClick={() => handleCategory(category.id)}
          >
            {category.name}
          </button>
        ))}

      </div>

      {/* =========================
          MENU RESULTS
      ========================= */}
      {loading ? (
        <Loading />
      ) : items.length === 0 ? (
        <EmptyState
          icon="🔍"
          title="No dishes found"
          message="Try a different search or filter."
        />
      ) : (
        <div className="menu-grid">
          {items.map((item) => (
            <MenuItemCard
              key={item.id}
              item={item}
            />
          ))}
        </div>
      )}

    </div>
  );
}