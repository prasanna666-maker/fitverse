import { createContext, useState, useEffect } from "react";
import axios from "axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const userInfo = localStorage.getItem("fitverse_userInfo");
      if (userInfo) {
        const parsedUser = JSON.parse(userInfo);
        try {
          // Verify token is still valid (optional but good practice)
          const config = {
            headers: { Authorization: `Bearer ${parsedUser.token}` },
          };
          const { data } = await axios.get("/api/auth/profile", config);
          // If valid, keep user. If invalid, the catch block will clear it.
          setUser({ ...data, token: parsedUser.token });
        } catch (error) {
          localStorage.removeItem("fitverse_userInfo");
          setUser(null);
        }
      }
      setLoading(false);
    };

    checkUser();
  }, []);

  const login = async (email, password) => {
    try {
      const { data } = await axios.post("/api/auth/login", { email, password });
      setUser(data);
      localStorage.setItem("fitverse_userInfo", JSON.stringify(data));
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.error || "Login failed" };
    }
  };

  const register = async (name, email, password) => {
    try {
      const { data } = await axios.post("/api/auth/register", { name, email, password });
      setUser(data);
      localStorage.setItem("fitverse_userInfo", JSON.stringify(data));
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.error || "Registration failed" };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("fitverse_userInfo");
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
