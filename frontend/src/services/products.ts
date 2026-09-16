import api from "./api";
import type { ApiResponse, Product, ProductsResponse, CollectionSummary } from "../types";

export const productsService = {
  async getAll(params?: {
    category?: string;
    search?: string;
    featured?: boolean;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<ProductsResponse>> {
    const res = await api.get("/products", { params });
    return res.data;
  },

  async getBySlug(slug: string): Promise<ApiResponse<Product>> {
    const res = await api.get(`/products/${slug}`);
    return res.data;
  },

  async getCollections(): Promise<ApiResponse<CollectionSummary[]>> {
    const res = await api.get("/products/collections");
    return res.data;
  },

  // Admin
  async adminGetAll(params?: { page?: number; limit?: number }): Promise<ApiResponse<ProductsResponse>> {
    const res = await api.get("/admin/products", { params });
    return res.data;
  },

  async adminCreate(data: Partial<Product>): Promise<ApiResponse<Product>> {
    const res = await api.post("/admin/products", data);
    return res.data;
  },

  async adminUpdate(id: string, data: Partial<Product>): Promise<ApiResponse<Product>> {
    const res = await api.put(`/admin/products/${id}`, data);
    return res.data;
  },

  async adminDelete(id: string): Promise<ApiResponse<null>> {
    const res = await api.delete(`/admin/products/${id}`);
    return res.data;
  },

  async adminUpload(files: File[]): Promise<string[]> {
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));
    const res = await api.post<ApiResponse<{ urls: string[] }>>("/admin/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data.data?.urls || [];
  },
};
