/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Backgrounds - Light Theme
        bg: {
          primary: "#f8fafc",
          secondary: "#f1f5f9",
          tertiary: "#e2e8f0",
          quaternary: "#cbd5e1",
        },
        // Surfaces - Light Theme
        surface: {
          primary: "#ffffff",
          secondary: "#f8fafc",
          tertiary: "#f1f5f9",
        },
        // Borders - Light Theme
        border: {
          primary: "#e2e8f0",
          secondary: "#cbd5e1",
          tertiary: "#94a3b8",
        },
        // Text - Light Theme
        text: {
          primary: "#0f172a",
          secondary: "#1e293b",
          tertiary: "#64748b",
          quaternary: "#94a3b8",
        },
        // Accent - Teal/Emerald theme (avoiding AI-popular purple/blue)
        accent: {
          primary: "#14b8a6",
          secondary: "#0d9488",
        },
        // Semantic colors
        error: "#ef4444",
        success: "#476072",
        warning: "#f59e0b",
      },
      fontFamily: {
        sans: ["Poppins", "sans-serif"],
      },
    },
  },
  plugins: [],
};
