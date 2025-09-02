import { Navigate, createBrowserRouter } from "react-router-dom";

import Login from "../../features/Auth/Login/Login";
import RequireAuth from "../../features/Auth/RequireAuth";
import ForgotPassword from "../../features/Auth/forgotPassword/ForgotPassword";
import SignUp from "../../features/Auth/registration/SignUp";
import ActsPage from "../../pages/acts/ActsPage";
import GuildsPage from "../../pages/guilds/GuildsPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/acts" replace />,
  },
  {
    path: "/acts",
    element: (
      // <RequireAuth>
      <ActsPage />
      // </RequireAuth>
    ),
  },
  {
    path: "/guilds",
    element: <GuildsPage />,
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
