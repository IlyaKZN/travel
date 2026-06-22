/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // солнце — основной акцент
        brand: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#ea9a08',
          700: '#c27803',
          800: '#92400e',
          900: '#78350f',
        },
        // ясное небо
        sky: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        // тёплый фон «солнечный день»
        warm: {
          50: '#fffdf7',
          100: '#fff8ed',
          200: '#fef0d6',
          300: '#fde4b8',
        },
      },
    },
  },
  plugins: [],
}
