import { Navigate, createBrowserRouter } from "react-router-dom";

import Login from "../../features/Auth/Login/Login";
import RequireAuth from "../../features/Auth/RequireAuth";
import ForgotPassword from "../../features/Auth/forgotPassword/ForgotPassword";
import SignUp from "../../features/Auth/registration/SignUp";
import StartStream from "../../pages/StartStream";
import ActsPage from "../../pages/acts/ActsPage";

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
  {
    path: "/start-stream",
    element: <StartStream />,
  },
]);
