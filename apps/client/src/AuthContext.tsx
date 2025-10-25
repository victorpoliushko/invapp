import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { jwtDecode } from "jwt-decode";

type AuthContextType = {
  userId: string | null;
  accessToken: string | null;
  login: (userId: string, accessToken: string, refreshToken: string) => void;
  logout: () => void;
};

type JwtPayload = { exp: number };

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);

  const login = (newUserId: string, newAccess: string, newRefresh: string) => {
    setUserId(newUserId);
    setAccessToken(newAccess);
    setRefreshToken(newRefresh);
    localStorage.setItem("userId", newUserId);
    localStorage.setItem("accessToken", newAccess);
    localStorage.setItem("refreshToken", newRefresh);
  };

  const cleanup = () => {
    setUserId(null);
    setAccessToken(null);
    localStorage.removeItem("userId");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  };

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    const accessToken = localStorage.getItem("accessToken");

    if (userId && accessToken) {
      setUserId(userId);
      setAccessToken(accessToken);
    }
  }, []);

  const logout = async () => {
    try {
      await fetch("http://localhost:5173/api/auth-v2/logout", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
    } catch (e) {
      console.error("Logout request failed", e);
    } finally {
      cleanup();
    }
  };

  const refreshAccessToken = async () => {
    if (!refreshToken) cleanup();
    try {
      const response = await fetch("http://localhost:5173/auth-v2/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) throw new Error("Refresh failed");

      const data = await response.json();
      setAccessToken(data.accessToken);
      localStorage.setItem("accessToken", data.accessToken);
      console.log("Token refreshed successfully");
    } catch (e) {
      console.error("Failed to refresh token", e);
    }
  };

  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    const storedAccess = localStorage.getItem("accessToken");
    const storedRefresh = localStorage.getItem("refreshToken");

    if (storedUserId && storedAccess && storedRefresh) {
      try {
        const { exp } = jwtDecode<JwtPayload>(storedAccess);
        const now = Date.now() / 1000;

        if (exp < now) {
          console.log("Access token expired, attempting refresh...");
          setUserId(storedUserId);
          setRefreshToken(storedRefresh);
          refreshAccessToken();
        } else {
          setUserId(storedUserId);
          setAccessToken(storedAccess);
          setRefreshToken(storedRefresh);
        }
      } catch (e) {
        cleanup();
      }
    }
  }, []);

  useEffect(() => {
    if (!accessToken) return;
    const { exp } = jwtDecode<JwtPayload>(accessToken);
    const expiresIn = exp * 1000 - Date.now() - 30_000;
    if (expiresIn > 0) {
       const timeout = setTimeout(refreshAccessToken, expiresIn);
      return () => clearTimeout(timeout);
    }
  }, [accessToken]);

  return (
    <AuthContext.Provider value={{ userId, accessToken, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
