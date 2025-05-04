// routes/settings.routes.js
import express from 'express';
import Setting from '../models/setting.model.js';
import { verifyToken } from '../middleware/verifyToken.js';
import { isAdmin } from '../middleware/adminCheck.js';

const router = express.Router();

// Get settings
router.get('/', verifyToken, isAdmin, async (req, res) => {
    try {
        const settings = await Setting.getSettings();

        res.status(200).json({
            success: true,
            settings
        });
    } catch (error) {
        console.error('Error getting settings:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching settings'
        });
    }
});

// Update settings
router.put('/', verifyToken, isAdmin, async (req, res) => {
    try {
        const settingsData = req.body;

        const settings = await Setting.getSettings();

        // Update settings fields
        if (settingsData.maintenanceMode !== undefined) {
            settings.maintenanceMode = settingsData.maintenanceMode;
        }

        if (settingsData.siteTitle !== undefined) {
            settings.siteTitle = settingsData.siteTitle;
        }

        if (settingsData.siteDescription !== undefined) {
            settings.siteDescription = settingsData.siteDescription;
        }

        await settings.save();

        res.status(200).json({
            success: true,
            settings,
            message: 'Settings updated successfully'
        });
    } catch (error) {
        console.error('Error updating settings:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while updating settings'
        });
    }
});

export default router;