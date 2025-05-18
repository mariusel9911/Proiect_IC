import { Navigate, Route, Routes } from 'react-router-dom';
import SignUpPage from './pages/SignUpPage';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import EmailVerificationPage from './pages/EmailVerificationPage';
import CleaningServicePage from './pages/CleaningServicePage';
import CheckoutPage from './pages/CheckoutPage';
import ServicePage from './pages/ServicePage';
import RequestPage from './pages/RequestPage';
import OrdersPage from './pages/OrdersPage';
import OrderDetailsPage from './components/OrderDetailsPage';
import MaintenancePage from './components/MaintenancePage';
import AllServicesPage from './pages/AllServicesPage';
import ProfilePage from './pages/ProfilePage';

import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';
import { useEffect } from 'react';
import LoadingSpinner from './components/LoadingSpinner';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

// Initialize stores
import { useServiceStore } from './store/serviceStore';
import { useProviderStore } from './store/providerStore';
import { MaintenanceModeProvider } from './contexts/MaintenanceModeContext';
import { useMaintenanceMode } from './contexts/MaintenanceModeContext';
import MaintenanceRouteGuard from './components/MaintenanceRouteGuard';
import AdminDashboard from './pages/Admin/AdminDashboard.jsx';
import { DarkModeProvider } from './contexts/DarkModeContext.jsx';

// Protect routes that require authentication
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();
  const { isMaintenanceMode } = useMaintenanceMode();

  // Check for authentication first
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Then check for email verification
  if (!user.isVerified) {
    return <Navigate to="/verify-email" replace />;
  }

  // Finally, check for maintenance mode
  if (isMaintenanceMode && !user.isAdmin) {
    return <Navigate to="/maintenance" replace />;
  }

  return children;
};

// Admin-only route guard
const AdminRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!user.isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Redirect authenticated user to the home page
const RedirectAuthenticatedUser = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();
  const { isMaintenanceMode } = useMaintenanceMode();

  if (isAuthenticated) {
    // If maintenance mode is active and user is not admin, redirect to maintenance page
    if (isMaintenanceMode && !user.isAdmin) {
      return <Navigate to="/maintenance" replace />;
    }

    // Otherwise, if user is verified, redirect to home
    if (user.isVerified) {
      return <Navigate to="/" replace />;
    }
  }

  return children;
};

function App() {
  const {
    isLoading: isCheckingAuth,
    checkAuth,
    isAuthenticated,
    user,
  } = useAuthStore();
  const { fetchServices } = useServiceStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Pre-fetch services data when the app loads
  useEffect(() => {
    if (isAuthenticated && user?.isVerified) {
      fetchServices();
    }
  }, [isAuthenticated, user, fetchServices]);

  if (isCheckingAuth) return <LoadingSpinner />;

  return (
    <DarkModeProvider>
      <MaintenanceModeProvider>
        <div className="min-h-screen bg-gradient-to-tr from-gray-200 via-zinc-300 to-slate-50 dark:bg-gradient-to-tr dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center relative overflow-hidden">
          <Routes>
            {/* Auth routes - always accessible */}
            <Route
              path="/login"
              element={
                <RedirectAuthenticatedUser>
                  <LoginPage />
                </RedirectAuthenticatedUser>
              }
            />
            <Route
              path="/signup"
              element={
                <RedirectAuthenticatedUser>
                  <SignUpPage />
                </RedirectAuthenticatedUser>
              }
            />
            <Route path="/verify-email" element={<EmailVerificationPage />} />
            <Route
              path="/forgot-password"
              element={
                <RedirectAuthenticatedUser>
                  <ForgotPasswordPage />
                </RedirectAuthenticatedUser>
              }
            />
            <Route
              path="/reset-password/:token"
              element={
                <RedirectAuthenticatedUser>
                  <ResetPasswordPage />
                </RedirectAuthenticatedUser>
              }
            />

            {/* Dedicated maintenance page route */}
            <Route path="/maintenance" element={<MaintenancePage />} />

            {/* Admin routes - always accessible to admins */}
            <Route
              path="/admin/dashboard/*"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />

            {/* Profile Page - Add this new route */}
              <Route
                  path="/profile"
                  element={
                      <ProtectedRoute>
                          <ProfilePage />
                      </ProtectedRoute>
                  }
              />

            {/* Protected routes with maintenance check */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <HomePage />
                </ProtectedRoute>
              }
            />

            {/* New AllServicesPage route */}
            <Route
              path="/all-services"
              element={
                <ProtectedRoute>
                  <AllServicesPage />
                </ProtectedRoute>
              }
            />

            {/* Service Routes */}
            <Route
              path="/service/:serviceId"
              element={
                <ProtectedRoute>
                  <ServicePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/cleaning/:serviceId"
              element={
                <ProtectedRoute>
                  <CleaningServicePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/checkout"
              element={
                <ProtectedRoute>
                  <CheckoutPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/request"
              element={
                <ProtectedRoute>
                  <RequestPage />
                </ProtectedRoute>
              }
            />

            {/* Order Management Routes */}
            <Route
              path="/orders"
              element={
                <ProtectedRoute>
                  <OrdersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/orders/:orderId"
              element={
                <ProtectedRoute>
                  <OrderDetailsPage />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Toaster />
        </div>
      </MaintenanceModeProvider>
    </DarkModeProvider>
  );
}

export default App;
