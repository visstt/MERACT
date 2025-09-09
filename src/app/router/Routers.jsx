import { Navigate, createBrowserRouter } from "react-router-dom";

import Login from "../../features/Auth/Login/Login";
import RequireAuth from "../../features/Auth/RequireAuth";
import ForgotPassword from "../../features/Auth/forgotPassword/ForgotPassword";
import SignUp from "../../features/Auth/registration/SignUp";
import ActsPage from "../../pages/acts/ActsPage";
import CreateAct from "../../pages/createAct/CreateAct";
import GuildsPage from "../../pages/guilds/GuildsPage";
import SceneControlIntro from "../../pages/sceneControl/intro/SceneControlIntro";
import SceneControlMusic from "../../pages/sceneControl/music/SceneControlMusic";

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
    path: "/scene-control-intro",
    element: <SceneControlIntro />,
  },
  {
    path: "/scene-control-music",
    element: <SceneControlMusic />,
  },
  {
    path: "/create-act",
    element: <CreateAct />,
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
