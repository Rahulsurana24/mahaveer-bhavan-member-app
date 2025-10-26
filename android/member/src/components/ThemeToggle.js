/**
 * ThemeToggle Component
 * Allows users to switch between light, dark, and system theme modes
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle() {
  const { themeMode, setTheme, colors } = useTheme();

  const themes = [
    { value: 'light', label: 'Light', icon: 'sunny-outline' },
    { value: 'dark', label: 'Dark', icon: 'moon-outline' },
    { value: 'system', label: 'System', icon: 'phone-portrait-outline' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundElevated }]}>
      <View style={styles.header}>
        <Icon name="color-palette-outline" size={20} color={colors.primary} />
        <Text style={[styles.title, { color: colors.textPrimary }]}>
          Theme
        </Text>
      </View>

      <View style={styles.optionsContainer}>
        {themes.map((theme) => (
          <TouchableOpacity
            key={theme.value}
            style={[
              styles.option,
              {
                backgroundColor: themeMode === theme.value ? colors.primary : colors.surface,
                borderColor: colors.border,
              },
            ]}
            onPress={() => setTheme(theme.value)}
            activeOpacity={0.7}
          >
            <Icon
              name={theme.icon}
              size={24}
              color={themeMode === theme.value ? '#FFFFFF' : colors.textSecondary}
            />
            <Text
              style={[
                styles.optionLabel,
                {
                  color: themeMode === theme.value ? '#FFFFFF' : colors.textPrimary,
                },
              ]}
            >
              {theme.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={[styles.description, { color: colors.textSecondary }]}>
        {themeMode === 'system'
          ? 'App theme will match your device settings'
          : `App is using ${themeMode} theme`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  option: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 10,
    borderWidth: 1,
  },
  optionLabel: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '600',
  },
  description: {
    fontSize: 12,
    marginTop: 12,
    textAlign: 'center',
  },
});
