/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        engine: {
          bg: "#0b0b0d",
          surface: "#121216",
          surfaceHover: "#18181f",
          border: "#1f1f26",
          borderActive: "#2dd4e8",
          text: "#e1e1e6",
          muted: "#858591",
          subtle: "#52525d",
          cyan: "#2dd4e8",
          amber: "#f5a623",
          green: "#10b981",
          red: "#ef4444",
        }
      },
      fontFamily: {
        sans: ['"Inter"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Cascadia Code"', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '2px',
        'sm': '2px',
        'md': '4px',
        'lg': '4px',
      }
    },
  },
  plugins: [],
};
