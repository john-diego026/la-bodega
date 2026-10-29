import axios from "axios";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_FASTAPI_URL || "http://localhost:8000/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

export const api = {
  ...axiosInstance,
  auth: {
    login: async (email: string, password: string) => {
      // Petición al backend o login con Supabase
      const response = await axiosInstance.post("/auth/login", { email, password });
      return response.data;
    },
    getCurrentUser: () => {
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("bodega_token");
        if (!token) return null;
        return {
          email: localStorage.getItem("bodega_user_email") || "bartender@labodega.com",
          user_metadata: { role: "Staff VIP" }
        };
      }
      return null;
    }
  }
};