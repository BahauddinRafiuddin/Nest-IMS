/* eslint-disable no-unused-vars */
/* eslint-disable react-refresh/only-export-components */
import { createContext, useState } from "react";
import { toastSuccess } from "../utils/toast";
import { getMe } from "../api/user.api";

export const AuthContext = createContext(null);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (token && userData) {
      return JSON.parse(userData);
    }
    return null;
  });

  const [loading, setLoading] = useState(false);

  const login = (data) => {
    localStorage.setItem("token", data.access_token);
    localStorage.setItem("user", JSON.stringify(data.user));
    setUser(data.user);
  };

  const logout = () => {
    localStorage.clear();
    toastSuccess("Logout Successful");
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const res = await getMe();

      setUser(res.user);
      localStorage.setItem("user", JSON.stringify(res.user));
    } catch (error) {
      console.log("Refresh failed", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
