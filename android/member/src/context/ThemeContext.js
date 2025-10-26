/**
 * ThemeContext
 * Manages light/dark theme state across the app
 */

import React, { createContext, useState, useEffect, useContext } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightColors, darkColors } from '../constants/colors';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState('system'); // 'light', 'dark', or 'system'
  const [isDark, setIsDark] = useState(systemColorScheme === 'dark');

  // Load saved theme preference on mount
  useEffect(() => {
    loadThemePreference();
  }, []);

  // Update theme when system preference changes (if using system theme)
  useEffect(() => {
    if (themeMode === 'system') {
      setIsDark(systemColorScheme === 'dark');
    }
  }, [systemColorScheme, themeMode]);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('theme_preference');
      if (savedTheme) {
        const preference = savedTheme;
        setThemeMode(preference);

        if (preference === 'system') {
          setIsDark(systemColorScheme === 'dark');
        } else {
          setIsDark(preference === 'dark');
        }
      }
    } catch (error) {
      console.error('Error loading theme preference:', error);
    }
  };

  const saveThemePreference = async (preference) => {
    try {
      await AsyncStorage.setItem('theme_preference', preference);
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  const setTheme = (newTheme) => {
    setThemeMode(newTheme);
    saveThemePreference(newTheme);

    if (newTheme === 'system') {
      setIsDark(systemColorScheme === 'dark');
    } else {
      setIsDark(newTheme === 'dark');
    }
  };

  const toggleTheme = () => {
    const newTheme = isDark ? 'light' : 'dark';
    setTheme(newTheme);
  };

  const colors = isDark ? darkColors : lightColors;

  const value = {
    isDark,
    themeMode,
    setTheme,
    toggleTheme,
    colors,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use theme
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext;
