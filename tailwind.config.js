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
        background: '#F5F7F4',
        surface: '#FFFFFF',
        foreground: '#17231F',
        muted: '#66736D',
        border: '#E1E7E2',
        primary: {
          DEFAULT: '#174D3A',
          hover: '#123D2E',
          light: '#EAF3EF',
          foreground: '#FFFFFF',
        },
        accent: {
          DEFAULT: '#C8F169',
          hover: '#B5DF57',
          foreground: '#17231F',
        },
        success: {
          DEFAULT: '#237A4B',
          light: '#E8F5EE',
        },
        warning: {
          DEFAULT: '#A96712',
          light: '#FDF6EB',
        },
        danger: {
          DEFAULT: '#B93838',
          light: '#FDEEEE',
        },
        info: {
          DEFAULT: '#2867A5',
          light: '#EEF5FD',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'card': '16px',
        'control': '12px',
        'pill': '9999px',
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(23, 35, 31, 0.05), 0 1px 2px 0 rgba(23, 35, 31, 0.03)',
        'card': '0 4px 20px -2px rgba(23, 35, 31, 0.06), 0 2px 6px -1px rgba(23, 35, 31, 0.04)',
        'elevated': '0 12px 32px -4px rgba(23, 35, 31, 0.12), 0 4px 12px -2px rgba(23, 35, 31, 0.06)',
      },
    },
  },
  plugins: [],
}
