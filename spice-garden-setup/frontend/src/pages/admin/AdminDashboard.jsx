import { useEffect, useState } from "react";
import Loading from "../../components/Loading";
import * as orderService from "../../services/orderService";

const CARDS = [
  {
    key: "total_orders",
    label: "Total Orders",
    icon: "📦",
    description: "All orders received",
  },
  {
    key: "todays_orders",
    label: "Today's Orders",
    icon: "📅",
    description: "Orders received today",
  },
  {
    key: "total_customers",
    label: "Total Customers",
    icon: "👥",
    description: "Registered customers",
  },
  {
    key: "total_revenue",
    label: "Total Revenue",
    icon: "💰",
    prefix: "₹",
    description: "Total sales generated",
  },
];

function formatNumber(value, prefix = "") {
  return `${prefix}${Number(value ?? 0).toLocaleString("en-IN")}`;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderService
      .fetchDashboardStats()
      .then(setStats)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="admin-dashboard">

      {/* ================= HEADER ================= */}

      <div className="admin-dashboard-header">

        <div>
          <div className="admin-dashboard-eyebrow">
            SPICE GARDEN ADMIN
          </div>

          <h1>Dashboard</h1>

          <p>
            Welcome back. Here's what's happening
            with your restaurant today.
          </p>
        </div>

        <div className="admin-dashboard-date">
          <span>Today</span>

          <strong>
            {new Date().toLocaleDateString("en-IN", {
              weekday: "long",
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </strong>
        </div>

      </div>


      {/* ================= STAT CARDS ================= */}

      <div className="admin-stats-grid">

        {CARDS.map((card) => (

          <div
            key={card.key}
            className="admin-stat-card"
          >

            <div className="admin-stat-top">

              <div className="admin-stat-icon">
                {card.icon}
              </div>

              <div className="admin-stat-label">
                {card.label}
              </div>

            </div>

            <div className="admin-stat-value">
              {formatNumber(
                stats?.[card.key],
                card.prefix || ""
              )}
            </div>

            <div className="admin-stat-description">
              {card.description}
            </div>

          </div>

        ))}

      </div>


      {/* ================= QUICK OVERVIEW ================= */}

      <div className="admin-overview-grid">

        {/* Orders Overview */}

        <div className="admin-overview-card">

          <div className="admin-overview-header">

            <div>
              <div className="admin-overview-eyebrow">
                ORDERS
              </div>

              <h2>Order Overview</h2>
            </div>

            <div className="admin-overview-icon">
              📦
            </div>

          </div>

          <div className="admin-overview-content">

            <div className="admin-overview-number">
              {formatNumber(
                stats?.total_orders
              )}
            </div>

            <div className="admin-overview-text">
              Total orders received
            </div>

          </div>

          <div className="admin-overview-footer">

            <span>
              Today's orders
            </span>

            <strong>
              {formatNumber(
                stats?.todays_orders
              )}
            </strong>

          </div>

        </div>


        {/* Revenue Overview */}

        <div className="admin-overview-card admin-revenue-card">

          <div className="admin-overview-header">

            <div>
              <div className="admin-overview-eyebrow">
                REVENUE
              </div>

              <h2>Sales Overview</h2>
            </div>

            <div className="admin-overview-icon">
              💰
            </div>

          </div>

          <div className="admin-overview-content">

            <div className="admin-overview-number">
              ₹
              {Number(
                stats?.total_revenue ?? 0
              ).toLocaleString("en-IN")}
            </div>

            <div className="admin-overview-text">
              Total revenue generated
            </div>

          </div>

          <div className="admin-overview-footer">

            <span>
              Customers
            </span>

            <strong>
              {formatNumber(
                stats?.total_customers
              )}
            </strong>

          </div>

        </div>

      </div>


      {/* ================= QUICK ACTIONS ================= */}

      <div className="admin-quick-section">

        <div className="admin-section-heading">

          <div>
            <div className="admin-dashboard-eyebrow">
              MANAGEMENT
            </div>

            <h2>Quick Actions</h2>
          </div>

        </div>


        <div className="admin-quick-grid">

          <a
            href="/admin/orders"
            className="admin-quick-card"
          >

            <span className="admin-quick-icon">
              📦
            </span>

            <div>
              <strong>
                Manage Orders
              </strong>

              <span>
                View and update customer orders
              </span>
            </div>

            <span className="admin-quick-arrow">
              →
            </span>

          </a>


          <a
            href="/admin/menu"
            className="admin-quick-card"
          >

            <span className="admin-quick-icon">
              🍽️
            </span>

            <div>
              <strong>
                Manage Menu
              </strong>

              <span>
                Add and update menu items
              </span>
            </div>

            <span className="admin-quick-arrow">
              →
            </span>

          </a>


          <a
            href="/admin/customers"
            className="admin-quick-card"
          >

            <span className="admin-quick-icon">
              👥
            </span>

            <div>
              <strong>
                Customers
              </strong>

              <span>
                View registered customers
              </span>
            </div>

            <span className="admin-quick-arrow">
              →
            </span>

          </a>

        </div>

      </div>


      {/* ================= CSS ================= */}

      <style>{`
        /* =====================================================
           SPICE GARDEN ADMIN - SMALL COMPACT BOXES
           Clean, straight, stable UI
           ===================================================== */

        .admin-dashboard {
          width: 100%;
          max-width: 1100px;
          margin: 0 auto;
          padding: 20px 18px 38px;
          color: var(--brown);
          box-sizing: border-box;
        }

        .admin-dashboard,
        .admin-dashboard * {
          box-sizing: border-box;
          min-width: 0;
        }

        /* HEADER */
        .admin-dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 18px;
          margin-bottom: 16px;
        }

        .admin-dashboard-eyebrow {
          color: var(--orange);
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 0.12em;
          margin-bottom: 4px;
        }

        .admin-dashboard-header h1 {
          margin: 0 0 4px;
          font-size: 27px;
          line-height: 1.15;
        }

        .admin-dashboard-header p {
          margin: 0;
          color: var(--muted);
          max-width: 500px;
          font-size: 12px;
          line-height: 1.4;
        }

        .admin-dashboard-date {
          min-width: 145px;
          padding: 9px 12px;
          border: 1px solid rgba(43, 24, 16, 0.16);
          border-radius: 7px;
          background: var(--brown);
          color: white;
          text-align: right;
          box-shadow: none;
        }

        .admin-dashboard-date span {
          display: block;
          font-size: 8px;
          opacity: 0.7;
          margin-bottom: 2px;
        }

        .admin-dashboard-date strong {
          font-size: 10px;
        }

        /* SMALL STAT BOXES */
        .admin-stats-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 9px;
          margin-bottom: 12px;
        }

        .admin-stat-card {
          min-height: 112px;
          padding: 11px;
          border: 1px solid rgba(43, 24, 16, 0.14);
          border-radius: 7px;
          background: #fff;
          box-shadow: none;
          transition: box-shadow 0.15s ease, border-color 0.15s ease;
        }

        .admin-stat-card:hover {
          transform: none;
          border-color: rgba(226, 113, 29, 0.30);
          box-shadow: 0 3px 9px rgba(43, 24, 16, 0.05);
        }

        .admin-stat-top {
          display: flex;
          align-items: center;
          gap: 7px;
          margin-bottom: 9px;
        }

        .admin-stat-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 30px;
          height: 30px;
          flex: 0 0 30px;
          border: 1px solid rgba(43, 24, 16, 0.08);
          border-radius: 6px;
          background: rgba(226, 113, 29, 0.08);
          font-size: 13px;
        }

        .admin-stat-label {
          color: var(--muted);
          font-size: 10px;
          font-weight: 700;
        }

        .admin-stat-value {
          margin-bottom: 3px;
          color: var(--brown);
          font-size: 21px;
          line-height: 1.15;
          font-weight: 850;
        }

        .admin-stat-description {
          color: var(--muted);
          font-size: 9px;
        }

        /* SMALL OVERVIEW BOXES */
        .admin-overview-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 9px;
          margin-bottom: 17px;
        }

        .admin-overview-card {
          min-height: 145px;
          padding: 13px;
          border: 1px solid rgba(43, 24, 16, 0.14);
          border-radius: 7px;
          background: #fff;
          box-shadow: none;
        }

        .admin-overview-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 10px;
        }

        .admin-overview-eyebrow {
          color: var(--orange);
          font-size: 8px;
          font-weight: 800;
          letter-spacing: 0.11em;
          margin-bottom: 3px;
        }

        .admin-overview-header h2 {
          margin: 0;
          font-size: 15px;
          line-height: 1.2;
        }

        .admin-overview-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 31px;
          height: 31px;
          flex: 0 0 31px;
          border: 1px solid rgba(43, 24, 16, 0.08);
          border-radius: 6px;
          background: rgba(139, 30, 30, 0.06);
          font-size: 13px;
        }

        .admin-overview-content {
          margin-top: 13px;
        }

        .admin-overview-number {
          color: var(--brown);
          font-size: 24px;
          line-height: 1.15;
          font-weight: 850;
        }

        .admin-overview-text {
          margin-top: 3px;
          color: var(--muted);
          font-size: 9px;
        }

        .admin-overview-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 12px;
          padding-top: 8px;
          border-top: 1px solid rgba(43, 24, 16, 0.09);
          color: var(--muted);
          font-size: 9px;
        }

        .admin-overview-footer strong {
          color: var(--orange);
          font-size: 11px;
        }

        /* SMALL QUICK ACTION BOXES */
        .admin-quick-section {
          margin-top: 0;
        }

        .admin-section-heading {
          margin-bottom: 8px;
        }

        .admin-section-heading h2 {
          margin: 0;
          font-size: 16px;
          line-height: 1.2;
        }

        .admin-quick-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 9px;
        }

        .admin-quick-card {
          min-height: 62px;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 9px;
          border: 1px solid rgba(43, 24, 16, 0.14);
          border-radius: 7px;
          background: #fff;
          color: var(--brown);
          text-decoration: none;
          box-shadow: none;
          transition: box-shadow 0.15s ease, border-color 0.15s ease;
        }

        .admin-quick-card:hover {
          transform: none;
          border-color: rgba(226, 113, 29, 0.30);
          box-shadow: 0 3px 9px rgba(43, 24, 16, 0.05);
        }

        .admin-quick-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 30px;
          height: 30px;
          flex: 0 0 30px;
          border: 1px solid rgba(43, 24, 16, 0.08);
          border-radius: 6px;
          background: rgba(226, 113, 29, 0.08);
          font-size: 13px;
        }

        .admin-quick-card div {
          flex: 1;
          min-width: 0;
        }

        .admin-quick-card strong,
        .admin-quick-card div span {
          display: block;
        }

        .admin-quick-card strong {
          margin-bottom: 2px;
          font-size: 10px;
        }

        .admin-quick-card div span {
          color: var(--muted);
          font-size: 8px;
          line-height: 1.3;
        }

        .admin-quick-arrow {
          color: var(--orange);
          font-size: 14px;
          font-weight: 800;
        }

        /* STABILITY - NO BENDING / NO MOVEMENT */
        .admin-dashboard .admin-stat-card,
        .admin-dashboard .admin-overview-card,
        .admin-dashboard .admin-quick-card {
          transform: none !important;
        }

        /* TABLET */
        @media (max-width: 900px) {
          .admin-stats-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .admin-quick-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        /* MOBILE */
        @media (max-width: 600px) {
          .admin-dashboard {
            padding: 16px 10px 32px;
          }

          .admin-dashboard-header {
            flex-direction: column;
            gap: 10px;
          }

          .admin-dashboard-date {
            width: 100%;
            text-align: left;
          }

          .admin-stats-grid,
          .admin-overview-grid,
          .admin-quick-grid {
            grid-template-columns: 1fr;
          }

          .admin-stat-card {
            min-height: 100px;
          }

          .admin-overview-card {
            min-height: 130px;
          }
        }
`}</style>

    </div>
  );
}