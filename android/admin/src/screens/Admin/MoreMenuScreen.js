import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import colors from '../../constants/colors';

export default function MoreMenuScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Icon name="shield-checkmark-outline" size={64} color={colors.primary} />
        <Text style={styles.title}>MoreMenuScreen</Text>
        <Text style={styles.note}>Admin screen - To be implemented</Text>
        <Text style={styles.guide}>See IMPLEMENTATION_GUIDE.md Phase 4</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  title: { fontSize: 24, fontWeight: '700', color: colors.textPrimary, marginTop: 16 },
  note: { fontSize: 16, color: colors.textSecondary, marginTop: 8 },
  guide: { fontSize: 14, color: colors.textTertiary, marginTop: 16, fontStyle: 'italic' },
});
