import api, { clearTokens, setTokens } from "./api";

export async function register(payload) {
  const { data } = await api.post(
    "/auth/register/",
    payload
  );

  return data;
}

export async function login(email, password) {
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

export async function googleLogin(credential) {
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

export async function logout() {
  const refresh = localStorage.getItem(
    "sg_refresh"
  );

  try {
    if (refresh) {
      await api.post(
        "/auth/logout/",
        {
          refresh,
        }
      );
    }
  } finally {
    clearTokens();
  }
}

export async function fetchProfile() {
  const { data } = await api.get(
    "/auth/profile/"
  );

  return data;
}

export async function updateProfile(payload) {
  const { data } = await api.patch(
    "/auth/profile/",
    payload
  );

  return data;
}

export async function fetchCustomers() {
  const { data } = await api.get(
    "/auth/customers/"
  );

  return data;
}


// Forgot Password - Send OTP
export async function forgotPassword(email) {
  const { data } = await api.post(
    "/auth/forgot-password/",
    {
      email,
    }
  );

  return data;
}


// Reset Password - Verify OTP and change password
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