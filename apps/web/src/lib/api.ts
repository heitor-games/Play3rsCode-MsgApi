const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

interface ApiResponse<T = any> {
  ok: boolean;
  status: number;
  data?: T;
  error?: string;
  message?: string;
}

async function request<T = any>(
  path: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(`${API_URL}${path}`, {
      ...options,
      headers,
    });

    const data = await res.json();

    if (!res.ok) {
      return {
        ok: false,
        status: res.status,
        error: data.error,
        message: data.message,
      };
    }

    return { ok: true, status: res.status, data };
  } catch (err: any) {
    return {
      ok: false,
      status: 0,
      error: "NETWORK_ERROR",
      message: err.message || "Network error",
    };
  }
}

export const api = {
  // Auth
  register: (body: { email: string; username: string; password: string }) =>
    request("/auth/register", { method: "POST", body: JSON.stringify(body) }),

  login: (body: { email: string; password: string }) =>
    request("/auth/login", { method: "POST", body: JSON.stringify(body) }),

  me: () => request("/auth/me"),

  // Billing
  plans: () => request("/billing/plans"),

  subscription: () => request("/billing/subscription"),

  usage: () => request("/billing/usage"),

  checkout: (plan: string) =>
    request("/billing/checkout", {
      method: "POST",
      body: JSON.stringify({ plan }),
    }),

  portal: () => request("/billing/portal", { method: "POST" }),

  // API Keys
  listApiKeys: () => request("/billing/api-keys"),

  createApiKey: (name: string) =>
    request("/billing/api-keys", {
      method: "POST",
      body: JSON.stringify({ name }),
    }),

  deleteApiKey: (id: string) =>
    request(`/billing/api-keys/${id}`, { method: "DELETE" }),
};

export function setToken(token: string) {
  localStorage.setItem("token", token);
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

export function removeToken() {
  localStorage.removeItem("token");
}

export function isAuthenticated(): boolean {
  return !!getToken();
}
