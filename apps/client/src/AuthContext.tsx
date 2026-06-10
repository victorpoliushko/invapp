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

  const login = (newUserId: string, newAccess: string, newRefresh: string) => {
    setUserId(newUserId);
    setAccessToken(newAccess);
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

  const logout = async () => {
    try {
      await fetch("http://localhost:5173/api/auth-v2/logout", {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
      });
    } catch (e) {
      console.error("Logout request failed", e);
    } finally {
      cleanup();
    }
  };

  // Always reads refreshToken from localStorage to avoid stale closure issues.
  const refreshAccessToken = async () => {
    const storedRefresh = localStorage.getItem("refreshToken");
    if (!storedRefresh) {
      cleanup();
      return;
    }
    try {
      const response = await fetch("http://localhost:5173/api/auth-v2/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: storedRefresh }),
      });

      if (!response.ok) throw new Error("Refresh failed");

      const data = await response.json();
      setAccessToken(data.accessToken);
      localStorage.setItem("accessToken", data.accessToken);
      if (data.refreshToken) {
        localStorage.setItem("refreshToken", data.refreshToken);
      }
      console.log("Token refreshed successfully");
    } catch (e) {
      console.error("Failed to refresh token", e);
      cleanup();
    }
  };

  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    const storedAccess = localStorage.getItem("accessToken");
    const storedRefresh = localStorage.getItem("refreshToken");

    if (!storedUserId || !storedAccess || !storedRefresh) return;

    try {
      const { exp } = jwtDecode<JwtPayload>(storedAccess);
      if (exp < Date.now() / 1000) {
        console.log("Access token expired on load, refreshing...");
        setUserId(storedUserId);
        refreshAccessToken();
      } else {
        setUserId(storedUserId);
        setAccessToken(storedAccess);
      }
    } catch {
      cleanup();
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      console.log(`[Auth] ${userId ? `Logged in as ${userId}` : "Not logged in"}`);
    }, 60_000);
    return () => clearInterval(interval);
  }, [userId]);

  // Schedule a proactive refresh 30s before expiry whenever accessToken changes.
  useEffect(() => {
    if (!accessToken) return;
    try {
      const { exp } = jwtDecode<JwtPayload>(accessToken);
      const expiresIn = exp * 1000 - Date.now() - 30_000;
      if (expiresIn <= 0) {
        refreshAccessToken();
        return;
      }
      const timeout = setTimeout(refreshAccessToken, expiresIn);
      return () => clearTimeout(timeout);
    } catch {
      cleanup();
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
