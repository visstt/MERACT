import { useEffect } from "react";

import { useNavigate } from "react-router-dom";

function getCookie(name) {
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? match[2] : null;
}

export default function RequireAuth({ children }) {
  const navigate = useNavigate();
  useEffect(() => {
    const token = getCookie("access_token");
    if (!token) {
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  const token = getCookie("access_token");
  if (!token) return null;
  return children;
}
