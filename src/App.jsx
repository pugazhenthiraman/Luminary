import React from "react";
import { Routes, Route } from "react-router-dom";
import { ToastContainerComponent } from "./components/Toast";
import Header from "./components/Header";
import HomePage from "./Home/HomePage";
import Login from "./Login/login";
import AdminLogin from "./Admin/AdminLogin";
import AdminDashboard from "./Admin/AdminDashboard";
import CoachDashboard from "./Coach/CoachDashboard";

function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/loginParent" element={<Login />} />
        <Route path="/loginCoach" element={<Login />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/coach/login" element={<Login />} />
        <Route path="/coach/dashboard" element={<CoachDashboard />} />
        {/* Add more routes as needed */}
      </Routes>

      {/* Reusable Toast Container */}
      <ToastContainerComponent />
    </>
  );
}

export default App;
