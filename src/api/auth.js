import axiosInstance from "./axiosInstance";

export const login = (data) => axiosInstance.post("/auth/login", data);
export const register = (data, userType = "parent") =>
  axiosInstance.post(`/auth/register/${userType}`, data);
export const logout = () => axiosInstance.post("/auth/logout");
