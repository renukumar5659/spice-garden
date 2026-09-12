import { useEffect, useState } from "react";
import Loading from "../../components/Loading";
import * as authService from "../../services/authService";

const styles = `
  .admin-customers-modern {
    max-width: 1120px;
    margin: 0 auto;
    padding: 12px 16px 32px;
  }

  .admin-customers-modern .customers-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
    margin-bottom: 12px;
  }

  .admin-customers-modern .eyebrow {
    margin: 0 0 3px;
    color: #9b4d18;
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 1.2px;
  }

  .admin-customers-modern h1 {
    margin: 0;
    font-size: 28px;
    line-height: 1.15;
    letter-spacing: -.3px;
  }

  .admin-customers-modern .customers-subtitle {
    margin: 4px 0 0;
    color: #777;
    font-size: 13px;
  }

  .admin-customers-modern .customer-count {
    min-width: 88px;
    padding: 8px 12px;
    border: 1px solid #ded8d2;
    border-radius: 9px;
    background: #fff;
    text-align: center;
    box-shadow: 0 1px 6px rgba(0,0,0,.035);
  }

  .admin-customers-modern .customer-count strong {
    display: block;
    font-size: 22px;
    line-height: 1;
  }

  .admin-customers-modern .customer-count span {
    display: block;
    margin-top: 4px;
    color: #777;
    font-size: 9px;
  }

  .admin-customers-modern .customer-table-card {
    overflow: hidden;
    border: 1px solid #dcd6d0;
    border-radius: 10px;
    background: #fff;
    box-shadow: 0 1px 7px rgba(0,0,0,.035);
  }

  .admin-customers-modern .table-topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    padding: 10px 12px;
    border-bottom: 1px solid #e9e4df;
  }

  .admin-customers-modern .table-title {
    font-size: 13px;
    font-weight: 800;
  }

  .admin-customers-modern .table-hint {
    color: #888;
    font-size: 10px;
  }

  .admin-customers-modern .table-scroll {
    width: 100%;
    overflow-x: auto;
  }

  .admin-customers-modern table {
    width: 100%;
    border-collapse: collapse;
    min-width: 650px;
  }

  .admin-customers-modern th {
    padding: 9px 12px;
    background: #faf9f8;
    border-bottom: 1px solid #ded8d2;
    color: #666;
    text-align: left;
    font-size: 10px;
    font-weight: 800;
    letter-spacing: .25px;
  }

  .admin-customers-modern td {
    padding: 10px 12px;
    border-bottom: 1px solid #eee9e5;
    color: #444;
    font-size: 12px;
    vertical-align: middle;
  }

  .admin-customers-modern tbody tr:last-child td {
    border-bottom: 0;
  }

  .admin-customers-modern tbody tr:hover {
    background: #fcfbfa;
  }

  .admin-customers-modern .customer-name {
    display: flex;
    align-items: center;
    gap: 9px;
    min-width: 170px;
  }

  .admin-customers-modern .customer-avatar {
    width: 30px;
    height: 30px;
    flex: 0 0 30px;
    display: grid;
    place-items: center;
    border: 1px solid #e2d9d1;
    border-radius: 50%;
    background: #f7f1ec;
    color: #9b4d18;
    font-size: 12px;
    font-weight: 800;
  }

  .admin-customers-modern .customer-name strong {
    display: block;
    color: #222;
    font-size: 12px;
  }

  .admin-customers-modern .customer-name small {
    display: block;
    margin-top: 2px;
    color: #999;
    font-size: 9px;
  }

  .admin-customers-modern .customer-email {
    max-width: 270px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .admin-customers-modern .customer-phone {
    white-space: nowrap;
  }

  .admin-customers-modern .joined-badge {
    display: inline-block;
    padding: 4px 7px;
    border: 1px solid #e4ddd7;
    border-radius: 6px;
    background: #faf9f8;
    color: #666;
    font-size: 10px;
    white-space: nowrap;
  }

  .admin-customers-modern .form-error-banner {
    margin-bottom: 10px;
    padding: 9px 11px;
    border: 1px solid #efcaca;
    border-radius: 8px;
    background: #fff4f4;
    color: #a33;
    font-size: 12px;
  }

  .admin-customers-modern .empty-customers {
    padding: 30px 18px;
    text-align: center;
  }

  .admin-customers-modern .empty-customers-icon {
    font-size: 26px;
  }

  .admin-customers-modern .empty-customers h2 {
    margin: 7px 0 3px;
    font-size: 16px;
  }

  .admin-customers-modern .empty-customers p {
    margin: 0;
    color: #888;
    font-size: 11px;
  }

  .admin-customers-modern * {
    transition: none !important;
    transform: none !important;
  }

  @media (max-width: 650px) {
    .admin-customers-modern {
      padding: 10px 8px 24px;
    }

    .admin-customers-modern .customers-header {
      align-items: flex-start;
    }

    .admin-customers-modern h1 {
      font-size: 24px;
    }

    .admin-customers-modern .customer-count {
      min-width: 72px;
    }
  }
`;

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadCustomers() {
      try {
        setLoading(true);
        setError("");

        const data = await authService.fetchCustomers();

        if (!mounted) return;

        const customerList = Array.isArray(data)
          ? data
          : Array.isArray(data?.results)
          ? data.results
          : [];

        setCustomers(customerList);
      } catch (err) {
        console.error("Failed to load customers:", err);

        if (mounted) {
          const message =
            err?.response?.data?.detail ||
            err?.response?.data?.message ||
            "Could not load customers.";

          setError(message);
          setCustomers([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadCustomers();

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return <Loading />;
  }

  return (
    <>
      <style>{styles}</style>

      <div className="admin-customers-modern">
        <div className="customers-header">
          <div>
            <p className="eyebrow">SPICE GARDEN ADMIN</p>
            <h1>Customers</h1>
            <p className="customers-subtitle">
              View registered customers and their account details.
            </p>
          </div>

          <div className="customer-count">
            <strong>{customers.length}</strong>
            <span>Total Customers</span>
          </div>
        </div>

        {error && <div className="form-error-banner">{error}</div>}

        <div className="customer-table-card">
          <div className="table-topbar">
            <span className="table-title">Customer List</span>
            <span className="table-hint">
              {customers.length} registered customer
              {customers.length === 1 ? "" : "s"}
            </span>
          </div>

          {customers.length === 0 ? (
            <div className="empty-customers">
              <div className="empty-customers-icon">👥</div>
              <h2>No customers found</h2>
              <p>Registered customers will appear here.</p>
            </div>
          ) : (
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Joined</th>
                  </tr>
                </thead>

                <tbody>
                  {customers.map((customer) => {
                    const fullName = [
                      customer.first_name,
                      customer.last_name,
                    ]
                      .filter(Boolean)
                      .join(" ")
                      .trim();

                    const displayName =
                      fullName ||
                      customer.username ||
                      "Unknown Customer";

                    const joinedDate = customer.created_at
                      ? new Date(customer.created_at).toLocaleDateString(
                          "en-IN",
                          {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          }
                        )
                      : "—";

                    const initials = displayName
                      .split(" ")
                      .filter(Boolean)
                      .slice(0, 2)
                      .map((part) => part[0])
                      .join("")
                      .toUpperCase();

                    return (
                      <tr key={customer.id}>
                        <td>
                          <div className="customer-name">
                            <div className="customer-avatar">
                              {initials || "?"}
                            </div>

                            <div>
                              <strong>{displayName}</strong>
                              {customer.username &&
                                fullName &&
                                customer.username !== displayName && (
                                  <small>@{customer.username}</small>
                                )}
                            </div>
                          </div>
                        </td>

                        <td>
                          <div className="customer-email">
                            {customer.email || "—"}
                          </div>
                        </td>

                        <td>
                          <span className="customer-phone">
                            {customer.phone || "—"}
                          </span>
                        </td>

                        <td>
                          <span className="joined-badge">{joinedDate}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
