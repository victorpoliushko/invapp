import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "./api";

export const useApiWithRedirect = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const interceptor = api.interceptors.response.use(
      (res) => res,
      (err) => {
        if (err.response?.status === 401) {
          localStorage.removeItem("access_token");
          navigate("/", { replace: true });
        }
        return Promise.reject(err);
      }
    );

    return () => {
      api.interceptors.response.eject(interceptor);
    };
  }, [navigate]);

  return api;
};
