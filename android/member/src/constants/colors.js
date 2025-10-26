/**
 * Color constants for the application
 * Supports Light and Dark themes with Teal Primary Color
 * Aesthetic: Apple-like premium design
 */

// Light Theme Colors
export const lightColors = {
  // Primary colors (Teal)
  primary: '#0F766E',         // Teal 700 - main brand color
  primaryLight: '#14B8A6',    // Teal 500 - hover/active states
  primaryDark: '#115E59',     // Teal 800 - pressed states
  primaryVeryLight: '#5EEAD4', // Teal 300 - badges, highlights

  // Light Mode Background
  background: '#FFFFFF',           // Pure white - main background
  backgroundElevated: '#F9FAFB',   // Cards/elevated surfaces
  backgroundSecondary: '#F3F4F6',  // Secondary sections
  backgroundTertiary: '#E5E7EB',   // Tertiary sections

  // Surface colors
  surface: '#FFFFFF',
  surfaceElevated: '#F9FAFB',
  surfaceHighlight: '#F0FDFA',     // Teal tint

  // Text Colors
  textPrimary: '#111827',     // Primary text
  textSecondary: '#6B7280',   // Secondary text
  textTertiary: '#9CA3AF',    // Disabled/placeholder text
  textInverse: '#FFFFFF',     // Text on dark backgrounds

  // Semantic colors
  success: '#10B981',
  successDark: '#059669',
  successLight: '#34D399',

  error: '#EF4444',
  errorDark: '#DC2626',
  errorLight: '#F87171',

  warning: '#F59E0B',
  warningDark: '#D97706',
  warningLight: '#FBBF24',

  info: '#3B82F6',
  infoDark: '#2563EB',
  infoLight: '#60A5FA',

  // Borders & Dividers
  border: '#E5E7EB',
  borderLight: '#F3F4F6',
  borderDark: '#D1D5DB',

  // UI elements
  disabled: '#F3F4F6',
  disabledText: '#9CA3AF',

  // Overlay
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',
  overlayHeavy: 'rgba(0, 0, 0, 0.7)',

  // Shadows
  shadow: '#000000',
  shadowLight: 'rgba(0, 0, 0, 0.1)',
  shadowMedium: 'rgba(0, 0, 0, 0.15)',
  shadowHeavy: 'rgba(0, 0, 0, 0.25)',

  // Status badge colors
  online: '#10B981',
  offline: '#6B7280',
  away: '#F59E0B',
  busy: '#EF4444',

  // Transparent
  transparent: 'transparent',
};

// Dark Theme Colors
export const darkColors = {
  // Primary colors (Teal - lighter for dark mode)
  primary: '#14B8A6',         // Teal 500 - main brand color
  primaryLight: '#5EEAD4',    // Teal 300 - hover/active states
  primaryDark: '#0F766E',     // Teal 700 - pressed states
  primaryVeryLight: '#99F6E4', // Teal 200 - badges, highlights

  // Dark Mode Background
  background: '#0F172A',           // Slate 900 - main background
  backgroundElevated: '#1E293B',   // Slate 800 - cards/elevated surfaces
  backgroundSecondary: '#334155',  // Slate 700 - secondary sections
  backgroundTertiary: '#475569',   // Slate 600 - tertiary sections

  // Surface colors
  surface: '#1E293B',
  surfaceElevated: '#334155',
  surfaceHighlight: '#164E63',     // Cyan 900 for teal tint

  // Text Colors
  textPrimary: '#F8FAFC',     // Slate 50 - Primary text
  textSecondary: '#CBD5E1',   // Slate 300 - Secondary text
  textTertiary: '#64748B',    // Slate 500 - Disabled/placeholder text
  textInverse: '#0F172A',     // Text on light backgrounds

  // Semantic colors (brighter for dark mode)
  success: '#34D399',
  successDark: '#10B981',
  successLight: '#6EE7B7',

  error: '#F87171',
  errorDark: '#EF4444',
  errorLight: '#FCA5A5',

  warning: '#FBBF24',
  warningDark: '#F59E0B',
  warningLight: '#FCD34D',

  info: '#60A5FA',
  infoDark: '#3B82F6',
  infoLight: '#93C5FD',

  // Borders & Dividers
  border: '#334155',
  borderLight: '#475569',
  borderDark: '#1E293B',

  // UI elements
  disabled: '#334155',
  disabledText: '#64748B',

  // Overlay
  overlay: 'rgba(0, 0, 0, 0.7)',
  overlayLight: 'rgba(0, 0, 0, 0.5)',
  overlayHeavy: 'rgba(0, 0, 0, 0.9)',

  // Shadows
  shadow: '#000000',
  shadowLight: 'rgba(0, 0, 0, 0.4)',
  shadowMedium: 'rgba(0, 0, 0, 0.6)',
  shadowHeavy: 'rgba(0, 0, 0, 0.8)',

  // Status badge colors
  online: '#34D399',
  offline: '#94A3B8',
  away: '#FBBF24',
  busy: '#F87171',

  // Transparent
  transparent: 'transparent',
};

// Membership type colors (same for both themes, but with good contrast)
export const membershipColors = {
  Tapasvi: '#F59E0B',      // Amber
  Karyakarta: '#8B5CF6',   // Purple
  Shraman: '#3B82F6',      // Blue
  Shravak: '#10B981',      // Green
  'General Member': '#6B7280', // Gray
  Trustee: '#0F766E',      // Teal
  Labharti: '#EC4899',     // Pink
};

// Helper function to get membership color
export const getMembershipColor = (membershipType) => {
  return membershipColors[membershipType] || membershipColors['General Member'];
};

// Default export (dark theme for backward compatibility)
const colors = darkColors;
export default colors;
