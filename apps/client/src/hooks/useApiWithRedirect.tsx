import { useCallback } from "react";
import { useNavigate } from "react-router-dom";

async function tryRefresh(): Promise<boolean> {
  const storedRefresh = localStorage.getItem("refreshToken");
  if (!storedRefresh) return false;
  try {
    const res = await fetch("http://localhost:5173/api/auth-v2/refresh", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: storedRefresh }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    localStorage.setItem("accessToken", data.accessToken);
    if (data.refreshToken) localStorage.setItem("refreshToken", data.refreshToken);
    return true;
  } catch {
    return false;
  }
}

export const useFetchWithRedirect = () => {
  const navigate = useNavigate();

  return useCallback(async function fetchWithRedirect(input: RequestInfo, init?: RequestInit) {
    const doFetch = () => {
      const token = localStorage.getItem("accessToken");
      return fetch(input, {
        ...init,
        headers: {
          ...(init?.headers || {}),
          Authorization: token ? `Bearer ${token}` : "",
          "Content-Type": "application/json",
        },
      });
    };

    let response = await doFetch();

    if (response.status === 401) {
      const refreshed = await tryRefresh();
      if (refreshed) {
        response = await doFetch();
      } else {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("userId");
        navigate("/", { replace: true });
        return Promise.reject(new Error("Unauthorized"));
      }
    }

    return response;
  }, [navigate]);
};
