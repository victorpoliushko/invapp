import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../AuthContext";

export default function AuthCallback() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const accessToken = params.get("accessToken");
    const refreshToken = params.get("refreshToken");
    const userId = params.get("userId");

    if (accessToken && refreshToken && userId) {
      login(userId, accessToken, refreshToken);
      navigate("/main", { replace: true });
    } else {
      navigate("/", { replace: true });
    }
  }, [params, login, navigate]);

  return <p>Signing you in...</p>;
}
