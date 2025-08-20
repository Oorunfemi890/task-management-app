import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@context/AuthContext";
import { TaskProvider } from "@context/TaskContext";
import { ThemeProvider } from "@context/ThemeContext"; // Add ThemeProvider
import Layout from "@components/layout/Layout";
import ProtectedRoute from "@components/auth/ProtectedRoute";

// Pages
import Login from "@pages/auth/Login";
import Register from "@pages/auth/Register";
import ForgotPassword from "@pages/auth/ForgotPassword";
import ResetPassword from "@pages/auth/ResetPassword";
import Dashboard from "@pages/Dashboard";
import TaskBoard from "@pages/TaskBoard";
import Projects from "@pages/Projects";
import ProjectDetails from "@pages/ProjectDetails";
import Team from "@pages/Team";
import Profile from "@pages/Profile";
import Settings from "@pages/Settings";
import Analytics from "@pages/Analytics";
import Calendar from "@pages/Calendar";
import NotFound from "@pages/NotFound";

import "@/index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <TaskProvider>
            <Router>
              <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
                <Toaster
                  position="top-right"
                  toastOptions={{
                    duration: 4000,
                    style: {
                      background: "var(--toast-bg)",
                      color: "var(--toast-text)",
                    },
                    success: {
                      style: {
                        background: "#10b981",
                      },
                    },
                    error: {
                      style: {
                        background: "#ef4444",
                      },
                    },
                  }}
                />

                <Routes>
                  {/* Auth Routes */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password" element={<ResetPassword />} />

                  {/* Protected Routes */}
                  <Route
                    path="/"
                    element={
                      <ProtectedRoute>
                        <Layout />
                      </ProtectedRoute>
                    }
                  >
                    <Route index element={<Dashboard />} />
                    <Route path="board" element={<TaskBoard />} />
                    <Route path="projects" element={<Projects />} />
                    <Route path="projects/:id" element={<ProjectDetails />} />
                    <Route path="team" element={<Team />} />
                    <Route path="calendar" element={<Calendar />} />
                    <Route path="analytics" element={<Analytics />} />
                    <Route path="profile" element={<Profile />} />
                    <Route path="settings" element={<Settings />} />
                  </Route>

                  {/* 404 Route */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </div>
            </Router>
          </TaskProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;