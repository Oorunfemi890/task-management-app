// src/context/ThemeContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '@services/authService';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');
  const [isLoading, setIsLoading] = useState(true);

  // Function to apply theme to the DOM
  const applyTheme = (newTheme) => {
    const root = document.documentElement;
    
    // Remove existing theme classes
    root.classList.remove('light', 'dark');
    
    if (newTheme === 'auto') {
      // Use system preference
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.add(systemPrefersDark ? 'dark' : 'light');
      
      // Store the actual applied theme for reference
      setTheme('auto');
    } else {
      // Apply specific theme
      root.classList.add(newTheme);
      setTheme(newTheme);
    }
  };

  // Load theme from user settings or localStorage
  const loadTheme = async () => {
    try {
      // First check if user is authenticated and has saved settings
      const token = authService.getToken();
      if (token && !authService.isTokenExpired()) {
        try {
          const settings = await authService.getUserSettings();
          if (settings.settings?.preferences?.theme) {
            const savedTheme = settings.settings.preferences.theme;
            applyTheme(savedTheme);
            return;
          }
        } catch (error) {
          console.log('Could not load theme from user settings:', error);
        }
      }

      // Fallback to localStorage
      const localTheme = localStorage.getItem('taskflow_theme');
      if (localTheme) {
        applyTheme(localTheme);
        return;
      }

      // Default to system preference
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      applyTheme(systemPrefersDark ? 'dark' : 'light');
    } catch (error) {
      console.error('Error loading theme:', error);
      applyTheme('light'); // Fallback to light theme
    } finally {
      setIsLoading(false);
    }
  };

  // Save theme to user settings and localStorage
  const saveTheme = async (newTheme) => {
    try {
      // Save to localStorage immediately for quick access
      localStorage.setItem('taskflow_theme', newTheme);
      
      // Apply theme immediately
      applyTheme(newTheme);

      // Save to user settings if authenticated
      const token = authService.getToken();
      if (token && !authService.isTokenExpired()) {
        try {
          // Get current preferences
          const settings = await authService.getUserSettings();
          const currentPreferences = settings.settings?.preferences || {};
          
          // Update theme preference
          const updatedPreferences = {
            ...currentPreferences,
            theme: newTheme
          };

          // Save updated preferences
          await authService.updateAppearanceSettings(updatedPreferences);
        } catch (error) {
          console.error('Failed to save theme to user settings:', error);
          // Don't throw error - theme is still applied locally
        }
      }
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  // Initialize theme on mount
  useEffect(() => {
    loadTheme();
  }, []);

  // Listen for system theme changes when theme is set to 'auto'
  useEffect(() => {
    if (theme === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      const handleChange = (e) => {
        const root = document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(e.matches ? 'dark' : 'light');
      };

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme]);

  // Get the actual applied theme (useful when theme is 'auto')
  const getAppliedTheme = () => {
    if (theme === 'auto') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return theme;
  };

  // Check if dark mode is currently active
  const isDarkMode = () => {
    return getAppliedTheme() === 'dark';
  };

  const value = {
    theme,
    setTheme: saveTheme,
    applyTheme,
    getAppliedTheme,
    isDarkMode,
    isLoading
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};