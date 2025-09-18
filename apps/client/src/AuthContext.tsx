import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

type AuthContextType = {
  userId: string | null;
  accessToken: string | null;
  login: (userId: string, token: string) => void;
  logout: () => void;
};

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

  return (<AuthContext.Provider value={{ userId, accessToken, login, logout }}>
    {children}
  </AuthContext.Provider>)
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
