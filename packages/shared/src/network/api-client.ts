/**
 * API Client — 统一请求封装
 * 支持 mock/real 双模式，自动注入 Authorization header
 */

const API_BASE = "/api";

function getAuthHeaders(): Record<string, string> {
  const token = typeof localStorage !== "undefined" ? localStorage.getItem("auth_token") : null;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (res.status === 401) {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    if (typeof window !== "undefined" && !window.location.pathname.includes("/login")) {
      window.location.href = "/login";
    }
    throw new Error("未登录或登录已过期");
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: "请求失败" }));
    throw new Error(err.message || `请求失败 (${res.status})`);
  }
  return res.json();
}

export async function apiGet<T>(path: string, params?: Record<string, any>): Promise<T> {
  const url = new URL(`${API_BASE}${path}`, window.location.origin);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") url.searchParams.set(k, String(v));
    });
  }
  const res = await fetch(url.toString(), { headers: getAuthHeaders() });
  return handleResponse<T>(res);
}

export async function apiPost<T>(path: string, body?: any): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: body ? JSON.stringify(body) : undefined,
  });
  return handleResponse<T>(res);
}

export async function apiPatch<T>(path: string, body?: any): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: body ? JSON.stringify(body) : undefined,
  });
  return handleResponse<T>(res);
}

export async function apiDelete<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  return handleResponse<T>(res);
}

export function isMockMode(): boolean {
  return ((import.meta as any).env?.VITE_API_MODE || "mock") === "mock";
}
