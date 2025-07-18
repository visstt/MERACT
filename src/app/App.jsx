import { useState, useEffect } from "react";
import { Sidebar } from "../widgets/Sidebar";
import { Header } from "../widgets/Header";
import styles from "./App.module.css";
import { AppRoutes } from "./routes";
import { useLocation, useNavigate } from "react-router-dom";

const pageTitles = {
  "/": "Dashboard",
  "/users": "User Management",
  "/streams": "Streams",
  "/guilds": "Guilds",
  "/content": "Content & Media",
  "/moderation": "Moderation",
  "/analytics": "Analytics",
  "/settings": "System Settings",
};

export const App = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handlePageChange = (pagePath) => {
    navigate(pagePath);
    if (window.innerWidth <= 768) {
      setSidebarOpen(false);
    }
  };

  const toggleSidebar = () => {
    if (window.innerWidth <= 768) {
      setSidebarOpen(!sidebarOpen);
    } else {
      setSidebarCollapsed(!sidebarCollapsed);
    }
  };

  // Find the best matching title for the current route
  const currentTitle =
    pageTitles[
      Object.keys(pageTitles).find((key) => location.pathname.startsWith(key))
    ] || "Dashboard";

  return <AppRoutes />;
};
