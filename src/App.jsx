import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { ToastContainerComponent } from "./components/Toast";
import Header from "./components/Header";
import HomePage from "./Home/HomePage";
import Login from "./Login/login";
import AdminLogin from "./Admin/AdminLogin";
import AdminDashboard from "./Admin/AdminDashboard";
import CoachDashboard from "./Coach/CoachDashboard";
import ParentDashboard from "./Parent/ParentDashboard";
import RegisterCoach from "./Login/RegisterCoach";
import RegisterParent from "./Login/RegisterParent";
import ProtectedRoute from "./components/ProtectedRoute";
import EmailVerifyLink from "./components/EmailVerifyLink";
import ResetPassword from "./components/ResetPassword";
import SessionBlockOverlay from "./components/SessionBlockOverlay";
import ProfileOverview from "./components/ProfileOverview";
import ReapplyCoach from "./Login/ReapplyCoach";
import ReapplySuccess from "./Login/ReapplySuccess";

function App() {
  const location = useLocation();
  const hideHeader = /^\/reset-password\//.test(location.pathname) || /^\/reapply\//.test(location.pathname) || location.pathname === '/reapply-success';
  return (
    <>
      {!hideHeader && <Header />}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/loginParent" element={<Login />} />
        <Route path="/loginCoach" element={<Login />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/register/coach"
          element={<RegisterCoach onBack={() => window.history.back()} />}
        />
        <Route
          path="/register/parent"
          element={<RegisterParent onBack={() => window.history.back()} />}
        />
        <Route path="/verify-email/:token" element={<EmailVerifyLink />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/reapply/:token" element={<ReapplyCoach />} />
        <Route path="/reapply-success" element={<ReapplySuccess />} />
        <Route path="/profile" element={<ProfileOverview />} />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute requiredRole="ADMIN">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/coach/dashboard"
          element={
            <ProtectedRoute requiredRole="COACH">
              <CoachDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/parent/dashboard"
          element={
            <ProtectedRoute requiredRole="PARENT">
              <ParentDashboard />
            </ProtectedRoute>
          }
        />
        {/* Add more routes as needed */}
      </Routes>

      {/* Reusable Toast Container */}
      <ToastContainerComponent />
      {/* Global session block modal (suspension/deactivation) */}
      <SessionBlockOverlay />
    </>
  );
}

export default App;
