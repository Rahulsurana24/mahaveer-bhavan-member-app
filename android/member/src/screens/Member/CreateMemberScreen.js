import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import colors from '../../constants/colors';

export default function CreateMemberScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Icon name="construct-outline" size={64} color={colors.primary} />
        <Text style={styles.title}>CreateMemberScreen</Text>
        <Text style={styles.note}>To be implemented - See IMPLEMENTATION_GUIDE.md Phase 4</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  title: { fontSize: 24, fontWeight: '700', color: colors.textPrimary, marginTop: 16 },
  note: { fontSize: 14, color: colors.textTertiary, marginTop: 24, fontStyle: 'italic', textAlign: 'center' },
});
