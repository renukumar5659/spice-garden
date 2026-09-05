import { useEffect, useState } from "react";
import Loading from "../../components/Loading";
import * as authService from "../../services/authService";

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

        // Supports either:
        // 1. [customer, customer, ...]
        // 2. { results: [...] }
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
    <div>
      <div className="admin-header">
        <h1>Customers</h1>
      </div>

      {error && (
        <div className="form-error-banner">
          {error}
        </div>
      )}

      <div className="admin-table-wrap card">
        {customers.length === 0 ? (
          <div style={{ padding: "24px" }}>
            <p>No customers found.</p>
          </div>
        ) : (
          <table className="admin-table">
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
                  ? new Date(customer.created_at).toLocaleDateString()
                  : "—";

                return (
                  <tr key={customer.id}>
                    <td>{displayName}</td>

                    <td>
                      {customer.email || "—"}
                    </td>

                    <td>
                      {customer.phone || "—"}
                    </td>

                    <td>{joinedDate}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}