import { useEffect } from "react";

import { useNavigate } from "react-router-dom";

import { useAuthStore } from "../../shared/stores/authStore";

function getCookie(name) {
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? match[2] : null;
}

export default function RequireAuth({ children }) {
  const navigate = useNavigate();
  const { isAuthenticated, login } = useAuthStore();

  useEffect(() => {
    // Проверяем аутентификацию из стора
    if (!isAuthenticated) {
      // Дополнительно проверяем cookie (для совместимости)
      const token = getCookie("access_token");
      if (token) {
        // Если токен есть в cookie, но не в сторе, обновляем стор
        login({ token });
      } else {
        // Если токена нет нигде, перенаправляем на логин
        navigate("/login", { replace: true });
      }
    }
  }, [isAuthenticated, navigate, login]);

  // Если пользователь не аутентифицирован, ничего не рендерим
  if (!isAuthenticated && !getCookie("access_token")) {
    return null;
  }

  return children;
}
