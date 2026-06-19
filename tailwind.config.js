/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        forest: {
          50: '#E8F5E9',
          100: '#C8E6C9',
          200: '#A5D6A7',
          300: '#81C784',
          400: '#66BB6A',
          500: '#4CAF50',
          600: '#2E7D32',
          700: '#1B5E20',
          800: '#144317',
          900: '#0D2E10',
        },
        amber: {
          50: '#FFF8E1',
          100: '#FFECB3',
          500: '#FFB300',
          600: '#FF8F00',
          700: '#FF6F00',
        },
        slate: {
          850: '#1A2332',
        }
      },
      fontFamily: {
        sans: ['"Source Han Sans CN"', '"Noto Sans SC"', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-soft': 'bounce 2s infinite',
      }
    },
  },
  plugins: [],
};
