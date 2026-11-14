import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { secureFetch, UnauthorizedError } from "../api/secureFetch";

export const useFetchWithRedirect = () => {
  const navigate = useNavigate();

  return useCallback(
    async function fetchWithRedirect(input: string, init?: RequestInit) {
      try {
        return await secureFetch(input, init);
      } catch (err) {
        if (err instanceof UnauthorizedError) navigate("/", { replace: true });
        throw err;
      }
    },
    [navigate],
  );
};
