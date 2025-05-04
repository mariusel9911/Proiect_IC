// middleware/maintenanceMode.js
import Setting from '../models/setting.model.js';
import { User } from '../models/user.model.js';

export const maintenanceMode = async (req, res, next) => {
    try {
        // Always allow these routes regardless of maintenance mode
        const bypassRoutes = [
            '/api/auth/login',
            '/api/auth/logout',
            '/api/auth/check-auth',
            '/api/auth/verify-email',
            '/api/auth/forgot-password',
            '/api/auth/reset-password',
            '/api/settings'
        ];

        // Allow these routes to bypass maintenance mode check
        const normalizedUrl = req.originalUrl.split('?')[0].replace(/\/$/, '');
        if (bypassRoutes.some(route => normalizedUrl === route)) {
            return next();
        }

        // Check if maintenance mode is active
        const settings = await Setting.getSettings();

        if (!settings || !settings.maintenanceMode) {
            return next();
        }

        // If maintenance mode is active, check if user is an admin
        if (req.userId) {
            const user = await User.findById(req.userId);

            if (user && user.isAdmin) {
                return next();
            }
        }

        // If not admin, return 503 maintenance mode response
        return res.status(503).json({
            success: false,
            message: 'The site is currently under maintenance. Please try again later.'
        });
    } catch (error) {
        console.error('Maintenance mode middleware error:', error);
        return next(error);
    }
};