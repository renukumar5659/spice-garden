import api, {
  clearTokens,
  setTokens,
} from "./api";

// ============================================================
// REGISTER
// ============================================================

export async function register(payload) {
  const { data } = await api.post(
    "/auth/register/",
    payload
  );

  return data;
}

// ============================================================
// LOGIN
// ============================================================

export async function login(
  email,
  password
) {
  const { data } = await api.post(
    "/auth/login/",
    {
      email,
      password,
    }
  );

  setTokens({
    access: data.access,
    refresh: data.refresh,
  });

  return data.user;
}

// ============================================================
// GOOGLE LOGIN
// ============================================================

export async function googleLogin(
  credential
) {
  const { data } = await api.post(
    "/auth/google/",
    {
      credential,
    }
  );

  setTokens({
    access: data.access,
    refresh: data.refresh,
  });

  return data.user;
}

// ============================================================
// LOGOUT
// ============================================================

export async function logout() {
  const refresh =
    localStorage.getItem("sg_refresh");

  try {
    if (refresh) {
      await api.post(
        "/auth/logout/",
        {
          refresh,
        }
      );
    }
  } catch (error) {
    console.warn(
      "Logout API failed. Clearing tokens.",
      error
    );
  } finally {
    clearTokens();
  }
}

// ============================================================
// FETCH PROFILE
// ============================================================

export async function fetchProfile() {
  const { data } = await api.get(
    "/auth/profile/"
  );

  return data;
}

// ============================================================
// UPDATE PROFILE
// ============================================================

export async function updateProfile(
  payload
) {
  const { data } = await api.patch(
    "/auth/profile/",
    payload
  );

  return data;
}

// ============================================================
// FETCH CUSTOMERS
// ============================================================

export async function fetchCustomers(
  params = {}
) {
  const endpoints = [
    "/auth/customers/",
    "/users/customers/",
    "/customers/",
  ];

  let lastError = null;

  for (const endpoint of endpoints) {
    try {
      const { data } = await api.get(
        endpoint,
        {
          params,
        }
      );

      if (Array.isArray(data)) {
        return data;
      }

      if (
        Array.isArray(data?.results)
      ) {
        return data.results;
      }

      if (
        Array.isArray(data?.customers)
      ) {
        return data.customers;
      }

      if (
        Array.isArray(data?.users)
      ) {
        return data.users;
      }

      return [];
    } catch (error) {
      lastError = error;

      const status =
        error?.response?.status;

      /*
       * Try the next endpoint only when
       * the endpoint itself does not exist.
       */

      if (
        status !== 404 &&
        status !== 405
      ) {
        throw error;
      }
    }
  }

  throw lastError;
}

// ============================================================
// FORGOT PASSWORD
// ============================================================

export async function forgotPassword(
  email
) {
  const { data } = await api.post(
    "/auth/forgot-password/",
    {
      email,
    }
  );

  return data;
}

// ============================================================
// RESET PASSWORD
// ============================================================

export async function resetPassword(
  email,
  otp,
  password
) {
  const { data } = await api.post(
    "/auth/reset-password/",
    {
      email,
      otp,
      password,
    }
  );

  return data;
}