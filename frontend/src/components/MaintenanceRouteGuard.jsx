// src/components/MaintenanceRouteGuard.jsx
import { Navigate, Outlet } from 'react-router-dom';
import { useMaintenanceMode } from '../contexts/MaintenanceModeContext';
import { useAuthStore } from '../store/authStore';
import MaintenancePage from './MaintenancePage';

const MaintenanceRouteGuard = () => {
    const { isMaintenanceMode } = useMaintenanceMode();
    const { user } = useAuthStore();
    const isAdmin = user && user.isAdmin;

    // If maintenance mode is active and user is not an admin, show maintenance page
    // This applies to both unauthenticated users and authenticated non-admin users
    if (isMaintenanceMode && !isAdmin) {
        return <MaintenancePage />;
    }

    // Otherwise, render the child routes
    return <Outlet />;
};

export default MaintenanceRouteGuard;