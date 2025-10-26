/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Teal primary colors (matching mobile app)
        primary: {
          DEFAULT: '#0F766E', // Teal 700
          50: '#F0FDFA',
          100: '#CCFBF1',
          200: '#99F6E4',
          300: '#5EEAD4',
          400: '#2DD4BF',
          500: '#14B8A6',
          600: '#0D9488',
          700: '#0F766E', // Main brand color
          800: '#115E59',
          900: '#134E4A',
        },
        // Dark mode backgrounds
        dark: {
          bg: '#0A0A0A',
          elevated: '#1A1A1A',
          secondary: '#2A2A2A',
          tertiary: '#3A3A3A',
        },
        // Membership colors (matching mobile)
        membership: {
          tapasvi: '#F59E0B',
          karyakarta: '#8B5CF6',
          shraman: '#10B981',
          shravak: '#3B82F6',
          general: '#6B7280',
        },
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
      },
    },
  },
  plugins: [],
}
