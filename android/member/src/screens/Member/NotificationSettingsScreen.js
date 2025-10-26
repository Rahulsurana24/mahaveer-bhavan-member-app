import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../context/ThemeContext';

export default function NotificationSettingsScreen() {
  const { colors } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <Icon name="construct-outline" size={64} color={colors.primary} />
        <Text style={[styles.title, { color: colors.textPrimary }]}>NotificationSettingsScreen</Text>
        <Text style={[styles.note, { color: colors.textTertiary }]}>To be implemented - See IMPLEMENTATION_GUIDE.md</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  title: { fontSize: 24, fontWeight: '700', marginTop: 16 },
  note: { fontSize: 14, marginTop: 24, fontStyle: 'italic' },
});
