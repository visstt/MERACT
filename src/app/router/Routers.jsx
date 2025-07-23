import { createBrowserRouter } from "react-router-dom";

import Login from "../../features/Auth/Login/Login";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Login />,
  },
]);
