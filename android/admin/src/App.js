/**
 * Mahaveer Bhavan Admin App
 * Main App Component
 */

import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-url-polyfill/auto';
import 'react-native-gesture-handler';

import RootNavigator from './navigation';
import colors from './constants/colors';

function App() {
  return (
    <SafeAreaProvider>
      <StatusBar
        barStyle="light-content"
        backgroundColor={colors.background}
        translucent={false}
      />
      <RootNavigator />
    </SafeAreaProvider>
  );
}

export default App;
