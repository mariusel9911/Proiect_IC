// src/contexts/MaintenanceModeContext.jsx
import { createContext, useState, useEffect, useContext } from 'react';

const MaintenanceModeContext = createContext();

export const MaintenanceModeProvider = ({ children }) => {
    const [isMaintenanceMode, setIsMaintenanceMode] = useState(() => {
        // Check localStorage for maintenance mode setting
        const savedSettings = localStorage.getItem('adminSettings');
        if (savedSettings) {
            try {
                const parsedSettings = JSON.parse(savedSettings);
                return parsedSettings.maintenanceMode || false;
            } catch (error) {
                console.error('Error parsing saved settings:', error);
                return false;
            }
        }
        return false;
    });

    // This effect updates the maintenance mode when the admin changes it
    useEffect(() => {
        const savedSettings = localStorage.getItem('adminSettings');
        if (savedSettings) {
            try {
                const parsedSettings = JSON.parse(savedSettings);
                setIsMaintenanceMode(parsedSettings.maintenanceMode || false);
            } catch (error) {
                console.error('Error parsing saved settings:', error);
            }
        }
    }, []);

    return (
        <MaintenanceModeContext.Provider value={{ isMaintenanceMode, setIsMaintenanceMode }}>
            {children}
        </MaintenanceModeContext.Provider>
    );
};

export const useMaintenanceMode = () => {
    return useContext(MaintenanceModeContext);
};