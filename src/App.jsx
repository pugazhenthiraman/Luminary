import React from "react";
import { Routes, Route } from "react-router-dom";
import { ToastContainerComponent } from "./components/Toast";
import Header from "./components/Header";
import HomePage from "./Home/HomePage";
import Login from "./Login/login";
import AdminLogin from "./Admin/AdminLogin";
import AdminDashboard from "./Admin/AdminDashboard";
import CoachDashboard from "./Coach/CoachDashboard";
import ParentDashboard from "./Parent/ParentDashboard";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/loginParent" element={<Login />} />
        <Route path="/loginCoach" element={<Login />} />
        <Route path="/admin/login" element={<AdminLogin />} />
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
    </>
  );
}

export default App;
