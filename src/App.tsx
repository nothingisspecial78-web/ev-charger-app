import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { AppShell } from '@/components/layout/AppShell';

// Pages
import { LandingPage } from '@/pages/LandingPage';
import { DiscoveryPage } from '@/pages/DiscoveryPage';
import { ChargerDetailPage } from '@/pages/ChargerDetailPage';
import { DriverRequestsPage } from '@/pages/DriverRequestsPage';
import { OwnerDashboardPage } from '@/pages/owner/OwnerDashboardPage';
import { OwnerChargersPage } from '@/pages/owner/OwnerChargersPage';
import { OwnerChargerFormPage } from '@/pages/owner/OwnerChargerFormPage';
import { OwnerRequestsPage } from '@/pages/owner/OwnerRequestsPage';
import { SuperadminOverviewPage } from '@/pages/superadmin/SuperadminOverviewPage';
import { SuperadminUsersPage } from '@/pages/superadmin/SuperadminUsersPage';
import { SuperadminChargersPage } from '@/pages/superadmin/SuperadminChargersPage';
import { SuperadminRequestsPage } from '@/pages/superadmin/SuperadminRequestsPage';
import { LoginPage } from '@/pages/auth/LoginPage';
import { SignupPage } from '@/pages/auth/SignupPage';

// Route Guards
const ProtectedRoute: React.FC<{
  children: React.ReactNode;
  allowedRoles?: ('driver' | 'admin' | 'superadmin')[];
}> = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="py-20 text-center text-sm font-semibold text-muted">Verifying session...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // If unauthorized, redirect based on their real role
    if (user.role === 'admin') return <Navigate to="/owner" replace />;
    if (user.role === 'superadmin') return <Navigate to="/superadmin" replace />;
    return <Navigate to="/chargers" replace />;
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppShell>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />

            {/* Discovery & Driver Routes */}
            <Route path="/chargers" element={<DiscoveryPage />} />
            <Route path="/chargers/:id" element={<ChargerDetailPage />} />
            <Route
              path="/my-requests"
              element={
                <ProtectedRoute allowedRoles={['driver', 'admin', 'superadmin']}>
                  <DriverRequestsPage />
                </ProtectedRoute>
              }
            />

            {/* Host / Charger Owner Routes */}
            <Route
              path="/owner"
              element={
                <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
                  <OwnerDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/owner/chargers"
              element={
                <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
                  <OwnerChargersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/owner/chargers/new"
              element={
                <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
                  <OwnerChargerFormPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/owner/chargers/:id/edit"
              element={
                <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
                  <OwnerChargerFormPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/owner/requests"
              element={
                <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
                  <OwnerRequestsPage />
                </ProtectedRoute>
              }
            />

            {/* Platform Superadmin Routes */}
            <Route
              path="/superadmin"
              element={
                <ProtectedRoute allowedRoles={['superadmin']}>
                  <SuperadminOverviewPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/superadmin/users"
              element={
                <ProtectedRoute allowedRoles={['superadmin']}>
                  <SuperadminUsersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/superadmin/chargers"
              element={
                <ProtectedRoute allowedRoles={['superadmin']}>
                  <SuperadminChargersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/superadmin/requests"
              element={
                <ProtectedRoute allowedRoles={['superadmin']}>
                  <SuperadminRequestsPage />
                </ProtectedRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AppShell>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
