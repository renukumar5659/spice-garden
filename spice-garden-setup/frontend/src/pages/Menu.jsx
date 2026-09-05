import { useEffect, useState } from "react";
import MenuItemCard from "../components/MenuItemCard";
import Loading from "../components/Loading";
import EmptyState from "../components/EmptyState";
import * as menuService from "../services/menuService";

export default function Menu() {
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [vegOnly, setVegOnly] = useState(false);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    menuService.fetchCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (activeCategory !== "all") params.category = activeCategory;
    if (vegOnly) params.veg = true;
    if (search) params.search = search;
    menuService
      .fetchMenuItems(params)
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [activeCategory, vegOnly, search]);

  return (
    <div className="container section-tight">
      <div className="section-heading">
        <span className="eyebrow">Our menu</span>
        <h1>Starters to coolers, all made fresh</h1>
      </div>

      <div className="menu-toolbar">
        <input
          type="search"
          placeholder="Search dishes…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="menu-search"
        />
        <label className="veg-toggle">
          <input type="checkbox" checked={vegOnly} onChange={(e) => setVegOnly(e.target.checked)} />
          Veg only
        </label>
      </div>

      <div className="category-tabs">
        <button
          className={`category-tab ${activeCategory === "all" ? "active" : ""}`}
          onClick={() => setActiveCategory("all")}
        >
          All
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            className={`category-tab ${activeCategory === c.id ? "active" : ""}`}
            onClick={() => setActiveCategory(c.id)}
          >
            {c.name}
          </button>
        ))}
      </div>

      {loading ? (
        <Loading />
      ) : items.length === 0 ? (
        <EmptyState icon="🔍" title="No dishes found" message="Try a different search or filter." />
      ) : (
        <div className="menu-grid">
          {items.map((item) => (
            <MenuItemCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
