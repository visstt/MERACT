import { BrowserRouter, RouterProvider } from "react-router-dom";

import PasswordProtection from "../features/Auth/PasswordProtection/PasswordProtection";
import "./App.css";
import { router } from "./router/Routers";

function App() {
  return (
    <PasswordProtection>
      <RouterProvider router={router} />
    </PasswordProtection>
  );
}

export default App;
