/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Backgrounds
        bg: {
          primary: "#050505",
          secondary: "#0a0a0a",
          tertiary: "#0f0f0f",
          quaternary: "#141414",
        },
        // Surfaces
        surface: {
          primary: "#1a1a1a",
          secondary: "#1f1f1f",
          tertiary: "#252525",
        },
        // Borders
        border: {
          primary: "#2a2a2a",
          secondary: "#303030",
          tertiary: "#383838",
        },
        // Text
        text: {
          primary: "#ffffff",
          secondary: "#f0f0f0",
          tertiary: "#a0a0a0",
          quaternary: "#707070",
        },
        // Accent
        accent: {
          primary: "#7c7cff",
          secondary: "#5a5aff",
        },
        // Semantic colors
        error: "#ff6b6b",
        success: "#4ecdc4",
        warning: "#ffc107",
      },
      fontFamily: {
        sans: ["Poppins", "sans-serif"],
      },
    },
  },
  plugins: [],
};
