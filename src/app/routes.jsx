import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { StreamsPage } from "../pages/StreamsPage";
import { GuildsPage } from "../pages/GuildsPage/GuildsPage";
import { DashboardPage } from "../pages/DashboardPage/DashboardPage";
import { UsersPage } from "../pages/UsersPage/UsersPage";
import { SignInPage } from '../pages/SignInPage/SignInPage';
import { Header } from '../widgets/Header/Header';
import { Sidebar } from '../widgets/Sidebar/Sidebar';
import styles from './App.module.css';

function getAccessToken() {
  return document.cookie.split('; ').find(row => row.startsWith('access_token='));
}

function ProtectedRoute({ children }) {
  if (!getAccessToken()) {
    return <Navigate to="/sign-in" replace />;
  }
  return children;
}

function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const handlePageChange = (pagePath) => {
    navigate(pagePath);
  };
  return (
    <div className={styles.app}>
      <Sidebar activeItem={location.pathname} onItemClick={handlePageChange} />
      <div className={styles.mainContent}>
        <Header />
        <main className={styles.pageContent}>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/streams" element={<StreamsPage />} />
            <Route path="/guilds" element={<GuildsPage />} />
            <Route path="/users" element={<UsersPage />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export const AppRoutes = () => (
  <Routes>
    <Route path="/sign-in" element={<SignInPage />} />
    <Route
      path="/*"
      element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }
    />
  </Routes>
);
