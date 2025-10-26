/**
 * Mahaveer Bhavan Member App
 * Main App Component
 */

import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-url-polyfill/auto';
// gesture-handler removed for build compatibility

import { ThemeProvider, useTheme } from './context/ThemeContext';
import RootNavigator from './navigation';

// Wrapper component to access theme inside provider
function AppContent() {
  const { isDark, colors } = useTheme();

  return (
    <SafeAreaProvider>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
        translucent={false}
      />
      <RootNavigator />
    </SafeAreaProvider>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
