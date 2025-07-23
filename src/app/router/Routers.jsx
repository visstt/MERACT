import { createBrowserRouter } from "react-router-dom";

import Login from "../../features/Auth/Login/Login";
import RequireAuth from "../../features/Auth/RequireAuth";
import ForgotPassword from "../../features/Auth/forgotPassword/ForgotPassword";
import SignUp from "../../features/Auth/registration/SignUp";
import HomePage from "../../pages/homePage/HomePage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <RequireAuth>
        <HomePage />
      </RequireAuth>
    ),
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/registration",
    element: <SignUp />,
  },
  {
    path: "/forgot-password",
    element: <ForgotPassword />,
  },
]);
