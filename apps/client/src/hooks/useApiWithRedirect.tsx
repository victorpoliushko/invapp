import { useNavigate } from "react-router-dom";

export const useFetchWithRedirect = () => {
  const navigate = useNavigate();

  async function fetchWithRedirect(input: RequestInfo, init?: RequestInit) {
    const token = localStorage.getItem("access_token");

    const response = await fetch(input, {
      ...init,
      headers: {
        ...(init?.headers || {}),
        Authorization: token ? `Bearer ${token}` : "",
        "Content-Type": "application/json",
      },
    });

    if (response.status === 401) {
      localStorage.removeItem("access_token");
      navigate("/", { replace: true });
      return Promise.reject(new Error("Unauthorized"));
    }

    return response;
  }

  return fetchWithRedirect;
};
