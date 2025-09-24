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
  login: (userId: string, token: string) => void;
  logout: () => void;
};

type JwtPayload = { exp: number };

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    const accessToken = localStorage.getItem("accessToken");

    if (userId && accessToken) {
      setUserId(userId);
      setAccessToken(accessToken);
    }
  }, []);

  const login = (newUserId: string, newToken: string) => {
    setUserId(newUserId);
    setAccessToken(newToken);
    localStorage.setItem("userId", newUserId);
    localStorage.setItem("accessToken", newToken);
  };

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
      setUserId(null);
      setAccessToken(null);
      localStorage.removeItem("userId");
      localStorage.removeItem("accessToken");
    }
  };

  const cleanup = () => {
    setUserId(null);
    setAccessToken(null);
    localStorage.removeItem("userId");
    localStorage.removeItem("accessToken");
  };

  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    const storedToken = localStorage.getItem("accessToken");

    if (storedUserId && storedToken) {
      try {
        const { exp } = jwtDecode<JwtPayload>(storedToken);
        const now = Date.now() / 1000;

        if (exp < now) {
          cleanup();
        } else {
          setUserId(storedUserId);
          setAccessToken(storedToken);
        }
      } catch (e) {
        cleanup();
      }
    }
  }, []);

  return (<AuthContext.Provider value={{ userId, accessToken, login, logout }}>
    {children}
  </AuthContext.Provider>)
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
