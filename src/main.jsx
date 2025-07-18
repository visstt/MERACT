import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "./shared/styles/globals.css";
import { App } from "./app/App.jsx";
import { BrowserRouter } from "react-router-dom";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <StrictMode>
      <App />
    </StrictMode>
  </BrowserRouter>
);
