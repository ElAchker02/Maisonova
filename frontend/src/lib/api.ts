import type {
  ApiOrder,
  ApiPack,
  ApiProduct,
  ApiUser,
  OrderStatus,
  PaginatedResponse,
} from "@/types/ecommerce";

const resolveApiBase = () => {
  const envBase = import.meta.env.VITE_API_URL as string | undefined;
  if (envBase && envBase.trim().length > 0) {
    return envBase.replace(/\/$/, "");
  }
  const origin = `${window.location.protocol}//${window.location.host}`;
  return `${origin}/api`;
};

const API_BASE_URL = resolveApiBase();

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface ApiRequestOptions {
  method?: HttpMethod;
  data?: Record<string, unknown> | FormData;
  token?: string | null;
  signal?: AbortSignal;
  headers?: HeadersInit;
}

interface ApiSingleResponse<T> {
  data: T;
  message?: string;
}

const buildQueryString = (params?: Record<string, string | number | undefined>) => {
  if (!params) return "";
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  });
  const query = searchParams.toString();
  return query ? `?${query}` : "";
};

async function apiFetch<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const { method = "GET", data, token, signal, headers = {} } = options;

  const requestHeaders: HeadersInit = {
    Accept: "application/json",
    ...headers,
  };

  const config: RequestInit = {
    method,
    signal,
    headers: requestHeaders,
  };

  if (data instanceof FormData) {
    config.body = data;
    // Allow browser to set Content-Type with boundary
    delete (requestHeaders as Record<string, string>)["Content-Type"];
  } else if (data) {
    requestHeaders["Content-Type"] = "application/json";
    config.body = JSON.stringify(data);
  }

  if (token) {
    requestHeaders.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, config);
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload?.message ?? "Une erreur est survenue");
  }

  return payload as T;
}

export const api = {
  getProducts: (params?: Record<string, string | number | undefined>) =>
    apiFetch<PaginatedResponse<ApiProduct>>(`/products${buildQueryString(params)}`),

  getProduct: (id: string | number) =>
    apiFetch<ApiSingleResponse<ApiProduct>>(`/products/${id}`).then((res) => res.data),

  createProduct: (data: FormData, token: string) =>
    apiFetch<ApiSingleResponse<ApiProduct>>("/products", {
      method: "POST",
      data,
      token,
    }),

  updateProduct: (id: number, data: FormData, token: string) =>
    apiFetch<ApiSingleResponse<ApiProduct>>(`/products/${id}`, {
      method: "POST",
      data,
      token,
      headers: { "X-HTTP-Method-Override": "PUT" },
    }),

  deleteProduct: (id: number, token: string) =>
    apiFetch<{ message: string }>(`/products/${id}`, {
      method: "DELETE",
      token,
    }),

  getCategories: () => apiFetch<{ data: string[] }>("/categories"),

  getPacks: (params?: Record<string, string | number | undefined>) =>
    apiFetch<PaginatedResponse<ApiPack>>(`/packs${buildQueryString(params)}`),

  getPack: (id: string | number) =>
    apiFetch<ApiSingleResponse<ApiPack>>(`/packs/${id}`).then((res) => res.data),

  createPack: (data: FormData, token: string) =>
    apiFetch<ApiSingleResponse<ApiPack>>("/packs", {
      method: "POST",
      data,
      token,
    }),

  updatePack: (id: number, data: FormData, token: string) =>
    apiFetch<ApiSingleResponse<ApiPack>>(`/packs/${id}`, {
      method: "POST",
      data,
      token,
      headers: { "X-HTTP-Method-Override": "PUT" },
    }),

  deletePack: (id: number, token: string) =>
    apiFetch<{ message: string }>(`/packs/${id}`, {
      method: "DELETE",
      token,
    }),

  getOrders: (token: string, params?: Record<string, string | number | undefined>) =>
    apiFetch<PaginatedResponse<ApiOrder>>(`/orders${buildQueryString(params)}`, { token }),

  getOrder: (id: number, token: string) =>
    apiFetch<ApiSingleResponse<ApiOrder>>(`/orders/${id}`, { token }).then((res) => res.data),

  updateOrder: (id: number, data: Partial<ApiOrder>, token: string) =>
    apiFetch<ApiSingleResponse<ApiOrder>>(`/orders/${id}`, {
      method: "PUT",
      data,
      token,
    }),

  updateOrderStatus: (id: number, status: OrderStatus, token: string) =>
    apiFetch<ApiSingleResponse<ApiOrder>>(`/orders/${id}/status`, {
      method: "PUT",
      data: { status },
      token,
    }),

  deleteOrder: (id: number, token: string) =>
    apiFetch<{ message: string }>(`/orders/${id}`, {
      method: "DELETE",
      token,
    }),

  getDashboardStats: () => apiFetch<{ data: any }>("/admin/stats"),

  createOrder: (data: {
    full_name: string;
    address: string;
    phone: string;
    email?: string;
    products: Array<{
      product_id: number;
      quantity: number;
      size?: string;
      color?: string;
      sheet_measure?: string;
      pack_items?: Array<{
        product_id: number;
        quantity: number;
        color?: string;
        sheet_measure?: string;
      }>;
      is_pack?: boolean;
    }>;
    total: number;
  }) => apiFetch<ApiSingleResponse<ApiOrder>>("/orders", { method: "POST", data }),

  getTopSales: () => apiFetch<{ data: ApiProduct[]; meta?: Record<string, unknown> }>("/products/top-sales"),

  getRelatedProducts: (id: number) =>
    apiFetch<{ data: ApiProduct[] }>(`/products/${id}/related`).then((res) => res.data),

  login: (credentials: { email: string; password: string }) =>
    apiFetch<{ data: ApiUser; token: string; message?: string }>("/auth/login", {
      method: "POST",
      data: credentials,
    }),

  me: (token: string) =>
    apiFetch<{ data: ApiUser }>("/auth/me", {
      token,
    }).then((res) => res.data),

  logout: (token: string) =>
    apiFetch<{ message: string }>("/auth/logout", {
      method: "POST",
      token,
    }),

  getUsers: (token: string, params?: Record<string, string | number | undefined>) =>
    apiFetch<PaginatedResponse<ApiUser>>(`/users${buildQueryString(params)}`, { token }),

  createUser: (
    payload: { name: string; email: string; password: string; password_confirmation: string; role: "admin" | "superadmin" },
    token: string
  ) =>
    apiFetch<ApiSingleResponse<ApiUser>>("/users", {
      method: "POST",
      data: payload,
      token,
    }),

  updateUser: (
    id: number,
    payload: { name?: string; email?: string; password?: string; password_confirmation?: string; role?: "admin" | "superadmin" },
    token: string
  ) =>
    apiFetch<ApiSingleResponse<ApiUser>>(`/users/${id}`, {
      method: "PUT",
      data: payload,
      token,
    }),

  deleteUser: (id: number, token: string) =>
    apiFetch<{ message: string }>(`/users/${id}`, {
      method: "DELETE",
      token,
    }),

  getSettings: (token?: string) =>
    apiFetch<{ data: any }>("/settings", token ? { token } : undefined).then((res) => res.data),

  updateSettings: (data: FormData, token: string) =>
    apiFetch<{ message: string; data: any }>("/settings", {
      method: "POST",
      data,
      token,
    }),
};
