/**
 * Color constants for the application
 * Theme: Dark Mode with Teal Primary Color
 * Aesthetic: Apple-like premium design
 */

export const colors = {
  // Primary colors (Teal)
  primary: '#0F766E',         // Teal 700 - main brand color
  primaryLight: '#14B8A6',    // Teal 500 - hover/active states
  primaryDark: '#115E59',     // Teal 800 - pressed states
  primaryVeryLight: '#5EEAD4', // Teal 300 - badges, highlights

  // Dark Mode Background
  background: '#0A0A0A',           // Pure dark - main background
  backgroundElevated: '#1A1A1A',   // Cards/elevated surfaces
  backgroundSecondary: '#2A2A2A',  // Secondary sections
  backgroundTertiary: '#1F1F1F',   // Tertiary sections

  // Surface colors
  surface: '#1A1A1A',
  surfaceElevated: '#2A2A2A',
  surfaceHighlight: '#1F2937',

  // Text Colors
  textPrimary: '#FFFFFF',     // Primary text
  textSecondary: '#A0A0A0',   // Secondary text
  textTertiary: '#707070',    // Disabled/placeholder text
  textInverse: '#0A0A0A',     // Text on light backgrounds

  // Semantic colors
  success: '#10B981',         // Green - confirmations, success states
  successDark: '#059669',
  successLight: '#34D399',

  error: '#EF4444',           // Red - errors, destructive actions
  errorDark: '#DC2626',
  errorLight: '#F87171',

  warning: '#F59E0B',         // Amber - warnings
  warningDark: '#D97706',
  warningLight: '#FBBF24',

  info: '#3B82F6',            // Blue - information
  infoDark: '#2563EB',
  infoLight: '#60A5FA',

  // Borders & Dividers
  border: '#2A2A2A',          // Default borders
  borderLight: '#3A3A3A',     // Subtle dividers
  borderDark: '#1A1A1A',      // Strong dividers

  // UI elements
  disabled: '#2A2A2A',
  disabledText: '#707070',

  // Overlay
  overlay: 'rgba(0, 0, 0, 0.7)',
  overlayLight: 'rgba(0, 0, 0, 0.5)',
  overlayHeavy: 'rgba(0, 0, 0, 0.9)',

  // Shadows (for dark mode)
  shadow: '#000000',
  shadowLight: 'rgba(0, 0, 0, 0.3)',
  shadowMedium: 'rgba(0, 0, 0, 0.5)',
  shadowHeavy: 'rgba(0, 0, 0, 0.8)',

  // Status badge colors
  online: '#10B981',
  offline: '#6B7280',
  away: '#F59E0B',
  busy: '#EF4444',

  // Membership type colors (for badges)
  membership: {
    Tapasvi: '#F59E0B',      // Amber
    Karyakarta: '#8B5CF6',   // Purple
    Shraman: '#3B82F6',      // Blue
    Shravak: '#10B981',      // Green
    'General Member': '#6B7280', // Gray
    Trustee: '#0F766E',      // Teal
    Labharti: '#EC4899',     // Pink
  },

  // Transparent
  transparent: 'transparent',
};

// Helper function to get membership color
export const getMembershipColor = (membershipType) => {
  return colors.membership[membershipType] || colors.membership['General Member'];
};

export default colors;
