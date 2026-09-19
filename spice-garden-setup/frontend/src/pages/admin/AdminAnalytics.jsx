import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import api from "../../services/api";

/* =========================================================
   HELPERS
========================================================= */

const toNumber = (value, fallback = 0) => {
  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : fallback;
};

const formatMoney = (value) => {
  return `₹${toNumber(value).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const formatNumber = (value) => {
  return toNumber(value).toLocaleString("en-IN");
};

const formatDate = (value) => {
  if (!value) {
    return "";
  }

  const text = String(value);

  if (text.includes("T")) {
    return text.split("T")[0];
  }

  return text;
};

const formatShortDate = (value) => {
  const date = formatDate(value);

  if (!date) {
    return "";
  }

  const parts = date.split("-");

  if (parts.length !== 3) {
    return date;
  }

  return `${parts[2]}/${parts[1]}`;
};

const safeArray = (value) => {
  return Array.isArray(value)
    ? value
    : [];
};

const safeObject = (value) => {
  if (
    value &&
    typeof value === "object" &&
    !Array.isArray(value)
  ) {
    return value;
  }

  return {};
};

/* =========================================================
   MONTH NAME
========================================================= */

const getMonthName = (dateString) => {
  if (!dateString) {
    return "";
  }

  const date = new Date(`${dateString}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return dateString;
  }

  return date.toLocaleDateString("en-IN", {
    month: "short",
    year: "numeric",
  });
};

/* =========================================================
   COMPONENT
========================================================= */

export default function AdminAnalytics() {
  /* =======================================================
     STATE
  ======================================================= */

  const [period, setPeriod] = useState(30);

  const [analytics, setAnalytics] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [exporting, setExporting] = useState(false);

  /* =======================================================
     LOAD ANALYTICS
  ======================================================= */

  const loadAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        `/orders/analytics/?period=${period}`
      );

      console.log(
        "ANALYTICS RESPONSE:",
        response.data
      );

      setAnalytics(response.data);
    } catch (err) {
      console.error(
        "ANALYTICS ERROR:",
        err
      );

      const message =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Unable to load analytics.";

      setError(message);
    } finally {
      setLoading(false);
    }
  }, [period]);

  /* =======================================================
     LOAD WHEN PERIOD CHANGES
  ======================================================= */

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  /* =======================================================
     SAFE API DATA
  ======================================================= */

  const data = useMemo(() => {
    return safeObject(analytics);
  }, [analytics]);

  const summary = useMemo(() => {
    return safeObject(data.summary);
  }, [data]);

  const sales = useMemo(() => {
    return safeArray(data.sales);
  }, [data]);

  /* =======================================================
     SUMMARY VALUES
  ======================================================= */

  const totalOrders = toNumber(
    summary.total_orders
  );

  const totalRevenue = toNumber(
    summary.total_revenue ??
      summary.gross_revenue
  );

  const averageOrderValue = toNumber(
    summary.average_order_value
  );

  const customers = toNumber(
    summary.customers
  );

  /* =======================================================
     DAILY SALES DATA
  ======================================================= */

  const salesChartData = useMemo(() => {
    return sales
      .map((item) => ({
        date: formatShortDate(
          item.date ??
            item.day ??
            item.created_at
        ),

        fullDate: formatDate(
          item.date ??
            item.day ??
            item.created_at
        ),

        orders: toNumber(
          item.orders ??
            item.total_orders ??
            item.order_count
        ),

        revenue: toNumber(
          item.revenue ??
            item.total_revenue ??
            item.amount ??
            item.gross_revenue
        ),
      }))
      .sort((a, b) =>
        String(a.fullDate).localeCompare(
          String(b.fullDate)
        )
      );
  }, [sales]);

  /* =======================================================
     MONTHLY SALES DATA

     Creates monthly graph from the daily
     sales response so we don't need another API.
  ======================================================= */

  const monthlySalesData = useMemo(() => {
    const grouped = {};

    salesChartData.forEach((item) => {
      if (!item.fullDate) {
        return;
      }

      const monthKey =
        item.fullDate.substring(0, 7);

      if (!grouped[monthKey]) {
        grouped[monthKey] = {
          month: monthKey,
          monthLabel: getMonthName(
            `${monthKey}-01`
          ),
          orders: 0,
          revenue: 0,
        };
      }

      grouped[monthKey].orders +=
        item.orders;

      grouped[monthKey].revenue +=
        item.revenue;
    });

    return Object.values(grouped)
      .sort((a, b) =>
        a.month.localeCompare(b.month)
      );
  }, [salesChartData]);

  /* =======================================================
     ORDER STATUS DATA
  ======================================================= */

  const statusData = useMemo(() => {
    const possibleStatus =
      data.order_status ??
      data.order_statuses ??
      data.status_breakdown ??
      data.orders_by_status ??
      data.statuses ??
      {};

    if (Array.isArray(possibleStatus)) {
      return possibleStatus
        .map((item) => ({
          name:
            item.name ??
            item.status ??
            item.label ??
            "Unknown",

          value: toNumber(
            item.value ??
              item.count ??
              item.orders ??
              item.total
          ),
        }))
        .filter(
          (item) => item.value > 0
        );
    }

    const objectData =
      safeObject(possibleStatus);

    return Object.entries(objectData)
      .map(([name, value]) => ({
        name,
        value: toNumber(
          value?.value ??
            value?.count ??
            value?.orders ??
            value
        ),
      }))
      .filter(
        (item) => item.value > 0
      );
  }, [data]);

  /* =======================================================
     TOP PRODUCTS DATA
  ======================================================= */

  const topProducts = useMemo(() => {
    const products =
      data.top_products ??
      data.topProducts ??
      data.products ??
      data.best_selling_products ??
      [];

    return safeArray(products)
      .map((item) => ({
        name:
          item.name ??
          item.product_name ??
          item.menu_item ??
          item.menu_item_name ??
          item.title ??
          "Unknown",

        quantity: toNumber(
          item.quantity ??
            item.total_quantity ??
            item.orders ??
            item.count ??
            item.units_sold
        ),

        revenue: toNumber(
          item.revenue ??
            item.total_revenue ??
            item.amount ??
            item.sales
        ),
      }))
      .filter(
        (item) =>
          item.quantity > 0 ||
          item.revenue > 0
      )
      .sort((a, b) => {
        if (b.revenue !== a.revenue) {
          return b.revenue - a.revenue;
        }

        return b.quantity - a.quantity;
      })
      .slice(0, 10);
  }, [data]);

  /* =======================================================
     DAILY ORDERS GRAPH
  ======================================================= */

  const dailyOrdersData = useMemo(() => {
    return salesChartData.map((item) => ({
      date: item.date,
      fullDate: item.fullDate,
      orders: item.orders,
    }));
  }, [salesChartData]);

  /* =======================================================
     PIE COLORS
  ======================================================= */

  const pieColors = [
    "#8B1E1E",
    "#D97706",
    "#2563EB",
    "#16A34A",
    "#7C3AED",
    "#0891B2",
    "#DB2777",
    "#65A30D",
  ];

  /* =======================================================
     CSV CREATOR
  ======================================================= */

  const createCSV = (rows) => {
    return rows
      .map((row) =>
        row
          .map((value) => {
            const text =
              value === null ||
              value === undefined
                ? ""
                : String(value);

            return `"${text.replace(
              /"/g,
              '""'
            )}"`;
          })
          .join(",")
      )
      .join("\n");
  };

  /* =======================================================
     CSV EXPORT
  ======================================================= */

  const downloadCSV = useCallback(() => {
    try {
      setExporting(true);

      const rows = [];

      rows.push([
        "Date",
        "Orders",
        "Revenue",
      ]);

      salesChartData.forEach((item) => {
        rows.push([
          item.fullDate,
          item.orders,
          item.revenue,
        ]);
      });

      rows.push([]);

      rows.push([
        "Summary",
        "",
        "",
      ]);

      rows.push([
        "Total Orders",
        totalOrders,
        "",
      ]);

      rows.push([
        "Total Revenue",
        totalRevenue,
        "",
      ]);

      rows.push([
        "Average Order Value",
        averageOrderValue,
        "",
      ]);

      rows.push([
        "Customers",
        customers,
        "",
      ]);

      rows.push([]);

      rows.push([
        "Top Products",
        "Quantity",
        "Revenue",
      ]);

      topProducts.forEach((item) => {
        rows.push([
          item.name,
          item.quantity,
          item.revenue,
        ]);
      });

      const csv = createCSV(rows);

      const blob = new Blob(
        [csv],
        {
          type:
            "text/csv;charset=utf-8;",
        }
      );

      const url =
        window.URL.createObjectURL(blob);

      const link =
        document.createElement("a");

      link.href = url;

      link.download =
        `spice-garden-analytics-${period}-days.csv`;

      document.body.appendChild(link);

      link.click();

      document.body.removeChild(link);

      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(
        "CSV EXPORT ERROR:",
        err
      );

      setError(
        "Unable to export CSV."
      );
    } finally {
      setExporting(false);
    }
  }, [
    salesChartData,
    totalOrders,
    totalRevenue,
    averageOrderValue,
    customers,
    topProducts,
    period,
  ]);

  /* =======================================================
     EXCEL EXPORT
  ======================================================= */

  const downloadExcel = useCallback(() => {
    try {
      setExporting(true);

      const rows = [];

      rows.push([
        "Spice Garden Sales Analytics",
      ]);

      rows.push([]);

      rows.push([
        "Period",
        `${period} Days`,
      ]);

      rows.push([]);

      rows.push([
        "Total Orders",
        totalOrders,
      ]);

      rows.push([
        "Total Revenue",
        totalRevenue,
      ]);

      rows.push([
        "Average Order Value",
        averageOrderValue,
      ]);

      rows.push([
        "Customers",
        customers,
      ]);

      rows.push([]);

      rows.push([
        "Date",
        "Orders",
        "Revenue",
      ]);

      salesChartData.forEach((item) => {
        rows.push([
          item.fullDate,
          item.orders,
          item.revenue,
        ]);
      });

      rows.push([]);

      rows.push([
        "Top Products",
        "Quantity",
        "Revenue",
      ]);

      topProducts.forEach((item) => {
        rows.push([
          item.name,
          item.quantity,
          item.revenue,
        ]);
      });

      const csv = createCSV(rows);

      const blob = new Blob(
        [csv],
        {
          type:
            "application/vnd.ms-excel;charset=utf-8;",
        }
      );

      const url =
        window.URL.createObjectURL(blob);

      const link =
        document.createElement("a");

      link.href = url;

      link.download =
        `spice-garden-sales-${period}-days.xls`;

      document.body.appendChild(link);

      link.click();

      document.body.removeChild(link);

      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(
        "EXCEL EXPORT ERROR:",
        err
      );

      setError(
        "Unable to export Excel."
      );
    } finally {
      setExporting(false);
    }
  }, [
    period,
    totalOrders,
    totalRevenue,
    averageOrderValue,
    customers,
    salesChartData,
    topProducts,
  ]);

  /* =======================================================
     SALES TOOLTIP
  ======================================================= */

  const SalesTooltip = ({
    active,
    payload,
    label,
  }) => {
    if (
      !active ||
      !payload ||
      !payload.length
    ) {
      return null;
    }

    return (
      <div
        style={{
          background: "#ffffff",
          border:
            "1px solid #e5e7eb",
          borderRadius: "10px",
          padding: "12px",
          boxShadow:
            "0 4px 14px rgba(0,0,0,0.08)",
        }}
      >
        <strong>{label}</strong>

        {payload.map((item) => (
          <div
            key={item.dataKey}
            style={{
              marginTop: "6px",
            }}
          >
            {item.dataKey ===
            "revenue"
              ? formatMoney(
                  item.value
                )
              : `${formatNumber(
                  item.value
                )} orders`}
          </div>
        ))}
      </div>
    );
  };

  /* =======================================================
     CARD STYLE
  ======================================================= */

  const cardStyle = {
    background: "#ffffff",
    border:
      "1px solid #eadfd3",
    borderRadius: "18px",
    padding: "24px",
    boxShadow:
      "0 5px 20px rgba(80,50,20,0.06)",
  };

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading && !analytics) {
    return (
      <div
        style={{
          padding: "50px",
          textAlign: "center",
        }}
      >
        <h2>
          Loading Analytics...
        </h2>

        <p>
          Please wait while sales
          data is loading.
        </p>
      </div>
    );
  }

  /* =======================================================
     MAIN
  ======================================================= */

  return (
    <div
      style={{
        padding: "30px",
        maxWidth: "1400px",
        margin: "0 auto",
      }}
    >
      {/* ===================================================
          HEADER
      =================================================== */}

      <div
        style={{
          display: "flex",
          justifyContent:
            "space-between",
          alignItems: "flex-end",
          gap: "20px",
          flexWrap: "wrap",
          marginBottom: "25px",
        }}
      >
        <div>
          <div
            style={{
              fontSize: "12px",
              letterSpacing: "2px",
              fontWeight: "700",
              color: "#9a8b80",
              marginBottom: "8px",
            }}
          >
            SPICE GARDEN ADMIN
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: "42px",
              fontWeight: "800",
              color: "#2b1710",
            }}
          >
            Sales Analytics
          </h1>

          <p
            style={{
              marginTop: "8px",
              color: "#806f65",
              fontSize: "16px",
            }}
          >
            Restaurant performance for
            the selected period.
          </p>
        </div>

        {/* =================================================
            CONTROLS
        ================================================= */}

        <div
          style={{
            display: "flex",
            gap: "10px",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <select
            value={period}
            onChange={(event) =>
              setPeriod(
                Number(
                  event.target.value
                )
              )
            }
            style={{
              padding:
                "12px 16px",
              borderRadius: "10px",
              border:
                "1px solid #dbcfc4",
              background:
                "#ffffff",
              fontSize: "15px",
              cursor: "pointer",
            }}
          >
            <option value={7}>
              Last 7 Days
            </option>

            <option value={30}>
              Last 30 Days
            </option>

            <option value={90}>
              Last 90 Days
            </option>

            <option value={365}>
              Last 365 Days
            </option>
          </select>

          <button
            type="button"
            onClick={downloadExcel}
            disabled={exporting}
            style={{
              padding:
                "12px 18px",
              borderRadius: "10px",
              border: "none",
              background:
                "#a51f1f",
              color:
                "#ffffff",
              fontWeight:
                "700",
              cursor:
                exporting
                  ? "not-allowed"
                  : "pointer",
              opacity:
                exporting
                  ? 0.7
                  : 1,
            }}
          >
            ↓ Export Excel
          </button>

          <button
            type="button"
            onClick={downloadCSV}
            disabled={exporting}
            style={{
              padding:
                "12px 18px",
              borderRadius: "10px",
              border:
                "1px solid #a51f1f",
              background:
                "#ffffff",
              color:
                "#a51f1f",
              fontWeight:
                "700",
              cursor:
                exporting
                  ? "not-allowed"
                  : "pointer",
            }}
          >
            ↓ CSV
          </button>
        </div>
      </div>

      {/* ===================================================
          ERROR
      =================================================== */}

      {error && (
        <div
          style={{
            background:
              "#fff1f1",
            border:
              "1px solid #f3a6a6",
            borderRadius: "10px",
            padding:
              "14px 18px",
            marginBottom:
              "25px",
            color:
              "#991b1b",
            display: "flex",
            alignItems:
              "center",
            justifyContent:
              "space-between",
            gap: "15px",
            flexWrap:
              "wrap",
          }}
        >
          <div>
            <strong>
              Analytics message:
            </strong>{" "}
            {error}
          </div>

          <button
            type="button"
            onClick={
              loadAnalytics
            }
            style={{
              border: "none",
              borderRadius:
                "8px",
              padding:
                "8px 16px",
              background:
                "#a51f1f",
              color:
                "#ffffff",
              fontWeight:
                "700",
              cursor:
                "pointer",
            }}
          >
            Retry
          </button>
        </div>
      )}

      {/* ===================================================
          SUMMARY CARDS
      =================================================== */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "18px",
          marginBottom: "25px",
        }}
      >
        {/* TOTAL ORDERS */}

        <div style={cardStyle}>
          <div
            style={{
              display: "flex",
              justifyContent:
                "space-between",
              alignItems:
                "center",
            }}
          >
            <span
              style={{
                color:
                  "#806f65",
              }}
            >
              Total Orders
            </span>

            <span
              style={{
                fontSize:
                  "25px",
              }}
            >
              🧾
            </span>
          </div>

          <h2
            style={{
              margin:
                "15px 0 5px",
              fontSize:
                "30px",
              color:
                "#170f0b",
            }}
          >
            {formatNumber(
              totalOrders
            )}
          </h2>

          <small
            style={{
              color:
                "#a09187",
            }}
          >
            Last {period} days
          </small>
        </div>

        {/* TOTAL REVENUE */}

        <div style={cardStyle}>
          <div
            style={{
              display: "flex",
              justifyContent:
                "space-between",
              alignItems:
                "center",
            }}
          >
            <span
              style={{
                color:
                  "#806f65",
              }}
            >
              Total Revenue
            </span>

            <span
              style={{
                fontSize:
                  "25px",
              }}
            >
              💰
            </span>
          </div>

          <h2
            style={{
              margin:
                "15px 0 5px",
              fontSize:
                "30px",
              color:
                "#170f0b",
            }}
          >
            {formatMoney(
              totalRevenue
            )}
          </h2>

          <small
            style={{
              color:
                "#a09187",
            }}
          >
            Last {period} days
          </small>
        </div>

        {/* AVERAGE ORDER */}

        <div style={cardStyle}>
          <div
            style={{
              display: "flex",
              justifyContent:
                "space-between",
              alignItems:
                "center",
            }}
          >
            <span
              style={{
                color:
                  "#806f65",
              }}
            >
              Average Order Value
            </span>

            <span
              style={{
                fontSize:
                  "25px",
              }}
            >
              📦
            </span>
          </div>

          <h2
            style={{
              margin:
                "15px 0 5px",
              fontSize:
                "30px",
              color:
                "#170f0b",
            }}
          >
            {formatMoney(
              averageOrderValue
            )}
          </h2>

          <small
            style={{
              color:
                "#a09187",
            }}
          >
            Average per order
          </small>
        </div>

        {/* CUSTOMERS */}

        <div style={cardStyle}>
          <div
            style={{
              display: "flex",
              justifyContent:
                "space-between",
              alignItems:
                "center",
            }}
          >
            <span
              style={{
                color:
                  "#806f65",
              }}
            >
              Customers
            </span>

            <span
              style={{
                fontSize:
                  "25px",
              }}
            >
              👥
            </span>
          </div>

          <h2
            style={{
              margin:
                "15px 0 5px",
              fontSize:
                "30px",
              color:
                "#170f0b",
            }}
          >
            {formatNumber(
              customers
            )}
          </h2>

          <small
            style={{
              color:
                "#a09187",
            }}
          >
            Unique customers
          </small>
        </div>
      </div>

      {/* ===================================================
          SALES OVERVIEW
      =================================================== */}

      <div
        style={{
          ...cardStyle,
          marginBottom:
            "25px",
        }}
      >
        <div
          style={{
            marginBottom:
              "20px",
          }}
        >
          <h2
            style={{
              margin: 0,
              color:
                "#2b1710",
            }}
          >
            Sales Overview
          </h2>

          <p
            style={{
              marginTop:
                "6px",
              color:
                "#806f65",
            }}
          >
            Orders and revenue during
            the selected period.
          </p>
        </div>

        {salesChartData.length ===
        0 ? (
          <div
            style={{
              height:
                "350px",
              display:
                "flex",
              alignItems:
                "center",
              justifyContent:
                "center",
              color:
                "#8c7b70",
            }}
          >
            No sales data available
            for this period.
          </div>
        ) : (
          <div
            style={{
              width:
                "100%",
              height:
                "360px",
            }}
          >
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <AreaChart
                data={
                  salesChartData
                }
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                />

                <XAxis
                  dataKey="date"
                />

                <YAxis
                  yAxisId="left"
                />

                <YAxis
                  yAxisId="right"
                  orientation="right"
                />

                <Tooltip
                  content={
                    <SalesTooltip />
                  }
                />

                <Legend />

                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="orders"
                  name="Orders"
                  stroke="#8B1E1E"
                  fill="#8B1E1E"
                  fillOpacity={0.15}
                />

                <Area
                  yAxisId="right"
                  type="monotone"
                  dataKey="revenue"
                  name="Revenue"
                  stroke="#D97706"
                  fill="#D97706"
                  fillOpacity={0.12}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* ===================================================
          EXTRA GRAPHS ROW
      =================================================== */}

      <div
        style={{
          display:
            "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(350px, 1fr))",
          gap:
            "25px",
          marginBottom:
            "25px",
        }}
      >
        {/* =================================================
            MONTHLY SALES
        ================================================= */}

        <div style={cardStyle}>
          <h2
            style={{
              marginTop:
                0,
              color:
                "#2b1710",
            }}
          >
            Monthly Sales
          </h2>

          <p
            style={{
              marginTop:
                "6px",
              color:
                "#806f65",
            }}
          >
            Revenue and orders grouped
            by month.
          </p>

          {monthlySalesData.length ===
          0 ? (
            <div
              style={{
                height:
                  "300px",
                display:
                  "flex",
                alignItems:
                  "center",
                justifyContent:
                  "center",
                color:
                  "#8c7b70",
              }}
            >
              No monthly data
              available.
            </div>
          ) : (
            <div
              style={{
                width:
                  "100%",
                height:
                  "300px",
              }}
            >
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <LineChart
                  data={
                    monthlySalesData
                  }
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                  />

                  <XAxis
                    dataKey="monthLabel"
                  />

                  <YAxis />

                  <Tooltip
                    formatter={(
                      value,
                      name
                    ) => {
                      if (
                        name ===
                        "Revenue"
                      ) {
                        return [
                          formatMoney(
                            value
                          ),
                          name,
                        ];
                      }

                      return [
                        formatNumber(
                          value
                        ),
                        name,
                      ];
                    }}
                  />

                  <Legend />

                  <Line
                    type="monotone"
                    dataKey="revenue"
                    name="Revenue"
                    stroke="#8B1E1E"
                    strokeWidth={3}
                    dot={{
                      r: 4,
                    }}
                  />

                  <Line
                    type="monotone"
                    dataKey="orders"
                    name="Orders"
                    stroke="#D97706"
                    strokeWidth={3}
                    dot={{
                      r: 4,
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* =================================================
            DAILY ORDERS
        ================================================= */}

        <div style={cardStyle}>
          <h2
            style={{
              marginTop:
                0,
              color:
                "#2b1710",
            }}
          >
            Daily Orders
          </h2>

          <p
            style={{
              marginTop:
                "6px",
              color:
                "#806f65",
            }}
          >
            Number of orders received
            each day.
          </p>

          {dailyOrdersData.length ===
          0 ? (
            <div
              style={{
                height:
                  "300px",
                display:
                  "flex",
                alignItems:
                  "center",
                justifyContent:
                  "center",
                color:
                  "#8c7b70",
              }}
            >
              No daily order data
              available.
            </div>
          ) : (
            <div
              style={{
                width:
                  "100%",
                height:
                  "300px",
              }}
            >
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <BarChart
                  data={
                    dailyOrdersData
                  }
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                  />

                  <XAxis
                    dataKey="date"
                  />

                  <YAxis />

                  <Tooltip
                    formatter={(
                      value
                    ) => [
                      formatNumber(
                        value
                      ),
                      "Orders",
                    ]}
                  />

                  <Bar
                    dataKey="orders"
                    name="Orders"
                    fill="#8B1E1E"
                    radius={[
                      6,
                      6,
                      0,
                      0,
                    ]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* ===================================================
          ORDER STATUS + TOP PRODUCTS
      =================================================== */}

      <div
        style={{
          display:
            "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(350px, 1fr))",
          gap:
            "25px",
          marginBottom:
            "25px",
        }}
      >
        {/* =================================================
            ORDER STATUS
        ================================================= */}

        <div style={cardStyle}>
          <h2
            style={{
              marginTop:
                0,
              color:
                "#2b1710",
            }}
          >
            Order Status
          </h2>

          <p
            style={{
              marginTop:
                "6px",
              color:
                "#806f65",
            }}
          >
            Distribution of orders by
            current status.
          </p>

          {statusData.length ===
          0 ? (
            <div
              style={{
                height:
                  "320px",
                display:
                  "flex",
                alignItems:
                  "center",
                justifyContent:
                  "center",
                color:
                  "#8c7b70",
              }}
            >
              No order status data
              available.
            </div>
          ) : (
            <div
              style={{
                width:
                  "100%",
                height:
                  "320px",
              }}
            >
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <PieChart>
                  <Pie
                    data={
                      statusData
                    }
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {statusData.map(
                      (
                        entry,
                        index
                      ) => (
                        <Cell
                          key={`status-${index}`}
                          fill={
                            pieColors[
                              index %
                                pieColors.length
                            ]
                          }
                        />
                      )
                    )}
                  </Pie>

                  <Tooltip />

                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* =================================================
            TOP PRODUCTS
        ================================================= */}

        <div style={cardStyle}>
          <h2
            style={{
              marginTop:
                0,
              color:
                "#2b1710",
            }}
          >
            Top Products
          </h2>

          <p
            style={{
              marginTop:
                "6px",
              color:
                "#806f65",
            }}
          >
            Best performing menu items by
            revenue.
          </p>

          {topProducts.length ===
          0 ? (
            <div
              style={{
                height:
                  "320px",
                display:
                  "flex",
                alignItems:
                  "center",
                justifyContent:
                  "center",
                color:
                  "#8c7b70",
              }}
            >
              No product data
              available.
            </div>
          ) : (
            <div
              style={{
                width:
                  "100%",
                height:
                  "320px",
              }}
            >
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <BarChart
                  data={
                    topProducts
                  }
                  layout="vertical"
                  margin={{
                    left: 20,
                    right: 20,
                    top: 5,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                  />

                  <XAxis
                    type="number"
                  />

                  <YAxis
                    type="category"
                    dataKey="name"
                    width={130}
                    tick={{
                      fontSize: 11,
                    }}
                  />

                  <Tooltip
                    formatter={(
                      value,
                      name
                    ) => {
                      if (
                        name ===
                        "Revenue"
                      ) {
                        return [
                          formatMoney(
                            value
                          ),
                          name,
                        ];
                      }

                      return [
                        formatNumber(
                          value
                        ),
                        name,
                      ];
                    }}
                  />

                  <Bar
                    dataKey="revenue"
                    name="Revenue"
                    fill="#8B1E1E"
                    radius={[
                      0,
                      6,
                      6,
                      0,
                    ]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* ===================================================
          DAILY SALES TABLE
      =================================================== */}

      <div style={cardStyle}>
        <h2
          style={{
            marginTop:
              0,
            color:
              "#2b1710",
          }}
        >
          Daily Sales
        </h2>

        <p
          style={{
            marginTop:
              "6px",
            color:
              "#806f65",
          }}
        >
          Detailed daily order and revenue
          information.
        </p>

        {salesChartData.length ===
        0 ? (
          <p
            style={{
              color:
                "#8c7b70",
            }}
          >
            No daily sales available.
          </p>
        ) : (
          <div
            style={{
              overflowX:
                "auto",
            }}
          >
            <table
              style={{
                width:
                  "100%",
                borderCollapse:
                  "collapse",
              }}
            >
              <thead>
                <tr>
                  <th
                    style={{
                      textAlign:
                        "left",
                      padding:
                        "12px",
                      borderBottom:
                        "1px solid #eadfd3",
                    }}
                  >
                    Date
                  </th>

                  <th
                    style={{
                      textAlign:
                        "right",
                      padding:
                        "12px",
                      borderBottom:
                        "1px solid #eadfd3",
                    }}
                  >
                    Orders
                  </th>

                  <th
                    style={{
                      textAlign:
                        "right",
                      padding:
                        "12px",
                      borderBottom:
                        "1px solid #eadfd3",
                    }}
                  >
                    Revenue
                  </th>
                </tr>
              </thead>

              <tbody>
                {salesChartData
                  .slice()
                  .reverse()
                  .map(
                    (
                      item,
                      index
                    ) => (
                      <tr
                        key={`${item.fullDate}-${index}`}
                      >
                        <td
                          style={{
                            padding:
                              "12px",
                            borderBottom:
                              "1px solid #f1e9e2",
                          }}
                        >
                          {
                            item.fullDate
                          }
                        </td>

                        <td
                          style={{
                            padding:
                              "12px",
                            textAlign:
                              "right",
                            borderBottom:
                              "1px solid #f1e9e2",
                          }}
                        >
                          {formatNumber(
                            item.orders
                          )}
                        </td>

                        <td
                          style={{
                            padding:
                              "12px",
                            textAlign:
                              "right",
                            fontWeight:
                              "700",
                            borderBottom:
                              "1px solid #f1e9e2",
                          }}
                        >
                          {formatMoney(
                            item.revenue
                          )}
                        </td>
                      </tr>
                    )
                  )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ===================================================
          FOOTER
      =================================================== */}

      <div
        style={{
          textAlign:
            "center",
          marginTop:
            "25px",
          padding:
            "15px",
          color:
            "#9a8b80",
          fontSize:
            "13px",
        }}
      >
        Spice Garden Analytics •
        Last {period} days
      </div>
    </div>
  );
}