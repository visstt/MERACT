import { createBrowserRouter } from "react-router-dom";

import ForgotPassword from "../../features/Auth/ForgotPassword";
import Login from "../../features/Auth/Login/Login";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Login />,
  },
  {
    path: "/forgot-password",
    element: <ForgotPassword />,
  },
]);
