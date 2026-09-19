import api from "./api";


// =========================================================
// CREATE ORDER
// =========================================================

export async function placeOrder(payload) {
  if (!payload || typeof payload !== "object") {
    throw new Error("Order data is required.");
  }

  try {
    const { data } = await api.post("/orders/", payload);

    console.log("Created order:", data);

    if (!data || !data.id) {
      console.error("Invalid order response:", data);
      throw new Error("Order ID was not returned by the server.");
    }

    return data;
  } catch (error) {
    console.error(
      "Place order error:",
      error.response?.data || error.message
    );

    throw error;
  }
}


// =========================================================
// GET DATABASE ORDER ID
// =========================================================

function getOrderId(order) {
  // Example:
  // { id: 115, order_id: "SGE83CF936" }
  if (typeof order === "object" && order !== null) {
    return order.id ?? order.order_id;
  }

  // Example:
  // 115
  // OR
  // "115"
  // OR
  // "SGE83CF936"
  return order;
}


// =========================================================
// CREATE RAZORPAY ORDER
// =========================================================

export async function createRazorpayOrder(order) {
  const id = getOrderId(order);

  if (
    id === undefined ||
    id === null ||
    id === ""
  ) {
    console.error("Invalid order received:", order);

    throw new Error(
      "Order ID was not returned by the server."
    );
  }

  console.log(
    "Creating Razorpay order for:",
    id
  );

  try {
    const { data } = await api.post(
      `/orders/${encodeURIComponent(id)}/razorpay/`
    );

    console.log(
      "Razorpay order created:",
      data
    );

    return data;

  } catch (error) {
    console.error(
      "Razorpay order creation failed:",
      error.response?.data || error.message
    );

    throw error;
  }
}


// =========================================================
// VERIFY RAZORPAY PAYMENT
// =========================================================

export async function verifyRazorpayPayment(
  order,
  paymentData
) {
  const id = getOrderId(order);

  if (
    id === undefined ||
    id === null ||
    id === ""
  ) {
    console.error(
      "Invalid order received:",
      order
    );

    throw new Error(
      "Order ID was not returned by the server."
    );
  }

  if (
    !paymentData ||
    typeof paymentData !== "object"
  ) {
    throw new Error(
      "Razorpay payment data is required."
    );
  }

  console.log(
    "Verifying Razorpay payment for order:",
    id
  );

  try {
    const { data } = await api.post(
      `/orders/${encodeURIComponent(id)}/razorpay/verify/`,
      paymentData
    );

    console.log(
      "Razorpay payment verified:",
      data
    );

    return data;

  } catch (error) {
    console.error(
      "Razorpay verification failed:",
      error.response?.data || error.message
    );

    throw error;
  }
}


// =========================================================
// FETCH ALL ORDERS
// =========================================================

export async function fetchOrders() {
  try {
    const { data } = await api.get(
      "/orders/"
    );

    return data?.results ?? data ?? [];

  } catch (error) {
    console.error(
      "Fetch orders error:",
      error.response?.data || error.message
    );

    throw error;
  }
}


// =========================================================
// FETCH SINGLE ORDER
// =========================================================

export async function fetchOrder(id) {
  if (
    id === undefined ||
    id === null ||
    id === ""
  ) {
    throw new Error(
      "Order ID is required."
    );
  }

  try {
    const { data } = await api.get(
      `/orders/${encodeURIComponent(id)}/`
    );

    return data;

  } catch (error) {
    console.error(
      "Fetch order error:",
      error.response?.data || error.message
    );

    throw error;
  }
}


// =========================================================
// UPDATE ORDER STATUS
// =========================================================

export async function updateOrderStatus(
  id,
  status
) {
  if (
    id === undefined ||
    id === null ||
    id === ""
  ) {
    throw new Error(
      "Order ID is required."
    );
  }

  if (!status) {
    throw new Error(
      "Order status is required."
    );
  }

  try {
    const { data } = await api.patch(
      `/orders/${encodeURIComponent(id)}/status/`,
      {
        status,
      }
    );

    return data;

  } catch (error) {
    console.error(
      "Update order status error:",
      error.response?.data || error.message
    );

    throw error;
  }
}


// =========================================================
// DASHBOARD STATS
// =========================================================

export async function fetchDashboardStats() {
  try {
    const { data } = await api.get(
      "/orders/stats/"
    );

    return data;

  } catch (error) {
    console.error(
      "Dashboard stats error:",
      error.response?.data || error.message
    );

    throw error;
  }
}


// =========================================================
// ORDER ANALYTICS
// =========================================================

export async function fetchOrderAnalytics(
  period = 30
) {
  try {
    const { data } = await api.get(
      `/orders/analytics/?period=${encodeURIComponent(period)}`
    );

    return data;

  } catch (error) {
    console.error(
      "Order analytics error:",
      error.response?.data || error.message
    );

    throw error;
  }
}


// =========================================================
// EXPORT ORDERS - CSV
// =========================================================

export async function exportOrdersCSV() {
  try {
    const response = await api.get(
      "/orders/export/?format=csv",
      {
        responseType: "blob",
      }
    );

    return response;

  } catch (error) {
    console.error(
      "CSV export error:",
      error.response?.data || error.message
    );

    throw error;
  }
}


// =========================================================
// EXPORT ORDERS - EXCEL
// =========================================================

export async function exportOrdersExcel() {
  try {
    const response = await api.get(
      "/orders/export/?format=xlsx",
      {
        responseType: "blob",
      }
    );

    return response;

  } catch (error) {
    console.error(
      "Excel export error:",
      error.response?.data || error.message
    );

    throw error;
  }
}


// =========================================================
// DOWNLOAD FILE
// =========================================================

export function downloadFile(
  response,
  filename
) {
  const blob = new Blob(
    [response.data],
    {
      type:
        response.headers?.["content-type"] ||
        "application/octet-stream",
    }
  );

  const url = window.URL.createObjectURL(
    blob
  );

  const link = document.createElement("a");

  link.href = url;
  link.download = filename;

  document.body.appendChild(link);

  link.click();

  link.remove();

  window.URL.revokeObjectURL(url);
}


// =========================================================
// DOWNLOAD CSV
// =========================================================

export async function downloadOrdersCSV() {
  const response =
    await exportOrdersCSV();

  downloadFile(
    response,
    "spice_garden_orders.csv"
  );
}


// =========================================================
// DOWNLOAD EXCEL
// =========================================================

export async function downloadOrdersExcel() {
  const response =
    await exportOrdersExcel();

  downloadFile(
    response,
    "spice_garden_orders.xlsx"
  );
}