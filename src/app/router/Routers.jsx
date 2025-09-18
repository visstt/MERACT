import { Navigate, createBrowserRouter } from "react-router-dom";

import Login from "../../features/Auth/Login/Login";
import RequireAuth from "../../features/Auth/RequireAuth";
import ForgotPassword from "../../features/Auth/forgotPassword/ForgotPassword";
import SignUp from "../../features/Auth/registration/SignUp";
import ActsPage from "../../pages/acts/ActsPage";
import CreateAct from "../../pages/createAct/CreateAct";
import GuildsPage from "../../pages/guilds/GuildsPage";
import SceneControlIntro from "../../pages/sceneControl/intro/SceneControlIntro";
import SelectSequel from "../../pages/sceneControl/intro/SelectSequel/SelectSequel";
import SceneControlMusic from "../../pages/sceneControl/music/SceneControlMusic";
import SelectMusic from "../../pages/sceneControl/music/selectMusic/SelectMusic";
import StreamPage from "../../pages/stream/StreamPage";
import StreamHostPage from "../../pages/streamHost/StreamHostPage";
import { useAuthStore } from "../../shared/stores/authStore";

// Компонент для умного редиректа
const HomeRedirect = () => {
  const { isAuthenticated } = useAuthStore();
  return <Navigate to={isAuthenticated ? "/acts" : "/login"} replace />;
};

export const router = createBrowserRouter([
  {
    path: "/",
    element: <HomeRedirect />,
  },
  {
    path: "/acts",
    element: (
      <RequireAuth>
        <ActsPage />
      </RequireAuth>
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
    path: "/scene-control-music-select",
    element: <SelectMusic />,
  },
  {
    path: "/scene-control-sequel-select",
    element: <SelectSequel />,
  },
  {
    path: "/create-act",
    element: <CreateAct />,
  },
  {
    path: "/stream-host/:id",
    element: (
      <RequireAuth>
        <StreamHostPage />
      </RequireAuth>
    ),
  },
  {
    path: "/stream/:id",
    element: <StreamPage />,
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
