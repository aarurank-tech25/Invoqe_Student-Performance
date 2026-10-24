/**
 * App.tsx
 * Master routing tree for AETHER Student Intelligence Platform.
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/layout/ProtectedRoute';

// Public Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { AdminLoginPage } from './pages/AdminLoginPage';

// Layouts
import { StudentLayout } from './components/layout/StudentLayout';
import { AdminLayout } from './components/layout/AdminLayout';

// Student Portal Pages
import { StudentOverview } from './pages/student/StudentOverview';
import { PredictPage } from './pages/student/PredictPage';
import { AcademicInsights } from './pages/student/AcademicInsights';
import { ReportsPage } from './pages/student/ReportsPage';
import { GoalsPage } from './pages/student/GoalsPage';
import { ProfilePage } from './pages/student/ProfilePage';

// Admin Portal Pages
import { AdminOverview } from './pages/admin/AdminOverview';
import { StudentManagement } from './pages/admin/StudentManagement';
import { AnalyticsReports } from './pages/admin/AnalyticsReports';
import { ModelLab } from './pages/admin/ModelLab';
import { AuditLogPage } from './pages/admin/AuditLogPage';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Landing & Auth Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/admin-login" element={<AdminLoginPage />} />

          {/* Student Portal Protected Shell */}
          <Route
            path="/portal"
            element={
              <ProtectedRoute allowedRoles={['student', 'admin']}>
                <StudentLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<StudentOverview />} />
            <Route path="predict" element={<PredictPage />} />
            <Route path="insights" element={<AcademicInsights />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="goals" element={<GoalsPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>

          {/* Admin Portal Protected Shell */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminOverview />} />
            <Route path="students" element={<StudentManagement />} />
            <Route path="analytics" element={<AnalyticsReports />} />
            <Route path="models" element={<ModelLab />} />
            <Route path="audit" element={<AuditLogPage />} />
          </Route>

          {/* 404 Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
