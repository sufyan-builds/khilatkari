import api from "./api";
import type { ApiResponse, AdminStats } from "../types";

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<ApiResponse<LoginResponse>> {
    const res = await api.post("/admin/auth/login", credentials);
    if (res.data.success && res.data.data?.access_token) {
      localStorage.setItem("ms_admin_token", res.data.data.access_token);
      localStorage.setItem("ms_admin_username", credentials.username);
    }
    return res.data;
  },

  logout(): void {
    localStorage.removeItem("ms_admin_token");
    localStorage.removeItem("ms_admin_username");
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem("ms_admin_token");
  },

  getUsername(): string {
    return localStorage.getItem("ms_admin_username") || "Admin";
  },

  async getStats(): Promise<ApiResponse<AdminStats>> {
    const res = await api.get("/admin/stats");
    return res.data;
  },
};
