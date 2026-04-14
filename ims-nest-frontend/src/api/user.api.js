import api from "./axios";

export const getMyProfile = async () => {
  const res = await api.get("/user/profile");
  return res.data;
};

export const changePassword = async (data) => {
  const res = await api.patch("/auth/change-password", data);
  return res.data;
};

export const getMe=async () => {
  const res=await api.get("/auth/me")
  return res.data
}