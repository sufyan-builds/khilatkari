import api from "./api";
import type { ApiResponse, Appointment, AppointmentCreate, AppointmentsResponse } from "../types";

export const appointmentsService = {
  async submit(data: AppointmentCreate): Promise<ApiResponse<Appointment>> {
    const res = await api.post("/appointments", data);
    return res.data;
  },

  // Admin
  async adminGetAll(params?: {
    status?: string;
    city?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<AppointmentsResponse>> {
    const res = await api.get("/admin/appointments", { params });
    return res.data;
  },

  async adminGetOne(id: string): Promise<ApiResponse<Appointment>> {
    const res = await api.get(`/admin/appointments/${id}`);
    return res.data;
  },

  async adminUpdateStatus(
    id: string,
    status: string,
    adminNotes?: string
  ): Promise<ApiResponse<Appointment>> {
    const res = await api.patch(`/admin/appointments/${id}/status`, { status, adminNotes });
    return res.data;
  },
};
