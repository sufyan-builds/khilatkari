import api from "./api";
import type { ApiResponse, Category } from "../types";

export const categoriesService = {
  // Public
  async getAll(): Promise<ApiResponse<Category[]>> {
    const res = await api.get("/categories");
    return res.data;
  },

  async getHomepage(): Promise<ApiResponse<Category[]>> {
    const res = await api.get("/categories/homepage");
    return res.data;
  },

  async getBySlugOrId(key: string): Promise<ApiResponse<Category>> {
    const res = await api.get(`/categories/${encodeURIComponent(key)}`);
    return res.data;
  },

  // Admin
  async adminGetAll(): Promise<ApiResponse<Category[]>> {
    const res = await api.get("/admin/categories");
    return res.data;
  },

  async adminCreate(data: Partial<Category>): Promise<ApiResponse<Category>> {
    const res = await api.post("/admin/categories", data);
    return res.data;
  },

  async adminUpdate(id: string, data: Partial<Category>): Promise<ApiResponse<Category>> {
    const res = await api.put(`/admin/categories/${id}`, data);
    return res.data;
  },

  async adminDelete(id: string): Promise<ApiResponse<null>> {
    const res = await api.delete(`/admin/categories/${id}`);
    return res.data;
  },

  async adminReassign(sourceCategoryName: string, targetCategoryName: string): Promise<ApiResponse<{ reassignedCount: number }>> {
    const res = await api.post("/admin/categories/reassign", {
      sourceCategoryName,
      targetCategoryName,
    });
    return res.data;
  },
};
