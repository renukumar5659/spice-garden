import { useEffect, useState } from "react";
import Loading from "../../components/Loading";
import * as orderService from "../../services/orderService";

const CARDS = [
  { key: "total_orders", label: "Total Orders", icon: "📦" },
  { key: "todays_orders", label: "Today's Orders", icon: "📅" },
  { key: "total_customers", label: "Total Customers", icon: "👥" },
  { key: "total_revenue", label: "Total Revenue", icon: "💰", prefix: "₹" },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderService.fetchDashboardStats().then(setStats).finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading />;

  return (
    <div>
      <h1>Dashboard</h1>
      <div className="stats-grid">
        {CARDS.map((c) => (
          <div key={c.key} className="card stat-card">
            <span className="stat-icon">{c.icon}</span>
            <div>
              <span className="stat-value">{c.prefix || ""}{Number(stats?.[c.key] ?? 0).toLocaleString()}</span>
              <span className="stat-label">{c.label}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
