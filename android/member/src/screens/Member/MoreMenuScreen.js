/**
 * MoreMenuScreen
 * Settings and menu screen with theme toggle, profile access, and app options
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../hooks/useAuth';
import ThemeToggle from '../../components/ThemeToggle';
import Avatar from '../../components/common/Avatar';

export default function MoreMenuScreen({ navigation }) {
  const { colors } = useTheme();
  const { profile, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            const { error } = await logout();
            if (error) {
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          },
        },
      ]
    );
  };

  const menuSections = [
    {
      title: 'Account',
      items: [
        {
          icon: 'person-outline',
          label: 'My Profile',
          onPress: () => navigation.navigate('Profile'),
        },
        {
          icon: 'card-outline',
          label: 'Digital ID Card',
          onPress: () => navigation.navigate('IDCard'),
        },
        {
          icon: 'notifications-outline',
          label: 'Notifications',
          onPress: () => navigation.navigate('NotificationSettings'),
        },
      ],
    },
    {
      title: 'App',
      items: [
        {
          icon: 'sparkles-outline',
          label: 'AI Assistant',
          subtitle: 'Dharma AI Helper',
          onPress: () => navigation.navigate('AIAssistant'),
        },
        {
          icon: 'information-circle-outline',
          label: 'About',
          onPress: () => Alert.alert('About', 'Mahaveer Bhavan Member App\nVersion 1.0.0'),
        },
        {
          icon: 'help-circle-outline',
          label: 'Help & Support',
          onPress: () => Alert.alert('Help', 'For support, contact: support@mahaverbhavan.org'),
        },
      ],
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with Profile Summary */}
        <TouchableOpacity
          style={[styles.profileCard, { backgroundColor: colors.backgroundElevated }]}
          onPress={() => navigation.navigate('Profile')}
          activeOpacity={0.7}
        >
          <Avatar
            uri={profile?.photo_url}
            name={profile?.full_name || profile?.email}
            size={60}
          />
          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, { color: colors.textPrimary }]}>
              {profile?.full_name || 'Member'}
            </Text>
            <Text style={[styles.profileEmail, { color: colors.textSecondary }]}>
              {profile?.email}
            </Text>
            {profile?.membership_type && (
              <View style={[styles.membershipBadge, { backgroundColor: colors.primaryLight + '20' }]}>
                <Text style={[styles.membershipText, { color: colors.primary }]}>
                  {profile.membership_type}
                </Text>
              </View>
            )}
          </View>
          <Icon name="chevron-forward" size={24} color={colors.textTertiary} />
        </TouchableOpacity>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Menu Sections */}
        {menuSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
              {section.title}
            </Text>
            <View style={[styles.menuCard, { backgroundColor: colors.backgroundElevated }]}>
              {section.items.map((item, itemIndex) => (
                <React.Fragment key={itemIndex}>
                  <TouchableOpacity
                    style={styles.menuItem}
                    onPress={item.onPress}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.menuIconContainer, { backgroundColor: colors.surface }]}>
                      <Icon name={item.icon} size={24} color={colors.primary} />
                    </View>
                    <View style={styles.menuTextContainer}>
                      <Text style={[styles.menuLabel, { color: colors.textPrimary }]}>
                        {item.label}
                      </Text>
                      {item.subtitle && (
                        <Text style={[styles.menuSubtitle, { color: colors.textSecondary }]}>
                          {item.subtitle}
                        </Text>
                      )}
                    </View>
                    <Icon name="chevron-forward" size={20} color={colors.textTertiary} />
                  </TouchableOpacity>
                  {itemIndex < section.items.length - 1 && (
                    <View style={[styles.divider, { backgroundColor: colors.border }]} />
                  )}
                </React.Fragment>
              ))}
            </View>
          </View>
        ))}

        {/* Logout Button */}
        <TouchableOpacity
          style={[styles.logoutButton, { backgroundColor: colors.backgroundElevated }]}
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <Icon name="log-out-outline" size={24} color={colors.error} />
          <Text style={[styles.logoutText, { color: colors.error }]}>
            Logout
          </Text>
        </TouchableOpacity>

        {/* App Version */}
        <Text style={[styles.versionText, { color: colors.textTertiary }]}>
          Version 1.0.0
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    marginBottom: 8,
  },
  membershipBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  membershipText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 12,
    marginLeft: 4,
  },
  menuCard: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  menuLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  menuSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  divider: {
    height: 1,
    marginLeft: 68,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 16,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  versionText: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 16,
  },
});
