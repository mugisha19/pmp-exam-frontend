/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    screens: {
      'xs': '475px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
    extend: {
      colors: {
        // Primary Colors - Student Portal Orange Theme
        primary: {
          50: "#fff5f0",
          100: "#ffe6d9",
          200: "#ffccb3",
          300: "#ffad80",
          400: "#ff844d",
          500: "#FF5100", // Main orange
          600: "#E64800",
          700: "#CC4000",
          800: "#B33800",
          900: "#993000",
        },
        secondary: {
          50: "#f0f9fd",
          100: "#d9f0fa",
          200: "#b3e1f5",
          300: "#8dd2f0",
          400: "#67c3eb",
          500: "#6EC1E4", // Sky blue
          600: "#5AAFD0",
          700: "#4A95B3",
          800: "#3A7A99",
          900: "#2A5F80",
        },
        accent: {
          teal: "#0d9488",
          coral: "#fb7185",
          sky: "#0ea5e9",
          amber: "#fbbf24",
        },
        // Backgrounds
        bg: {
          primary: "#ffffff",
          secondary: "#f8fafc",
          tertiary: "#f1f5f9",
          cream: "#fffbeb",
          soft: "#fef3c7",
        },
        // Surfaces
        surface: {
          primary: "#ffffff",
          secondary: "#f8fafc",
          elevated: "#ffffff",
        },
        // Borders
        border: {
          light: "#e2e8f0",
          DEFAULT: "#cbd5e1",
          dark: "#94a3b8",
        },
        // Text
        text: {
          primary: "#0f172a",
          secondary: "#475569",
          tertiary: "#64748b",
          muted: "#94a3b8",
        },
        // Semantic colors
        error: "#ef4444",
        success: "#6EC1E4", // Blue for success
        warning: "#6EC1E4", // Blue for warning
        info: "#FF5100", // Orange for info
      },
      fontFamily: {
        sans: ["Inter", "Poppins", "sans-serif"],
        display: ["Poppins", "sans-serif"],
      },
      boxShadow: {
        soft: "0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)",
        glow: "0 0 20px rgba(110, 193, 228, 0.3)", // Blue glow
        "glow-orange": "0 0 20px rgba(255, 81, 0, 0.3)", // Orange glow
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-emerald": "linear-gradient(135deg, #6EC1E4 0%, #5AAFD0 100%)", // Blue gradient
        "gradient-orange": "linear-gradient(135deg, #FF5100 0%, #FF6B2C 100%)", // Orange gradient
        "gradient-mesh":
          "radial-gradient(at 0% 0%, #FF5100 0px, transparent 50%), radial-gradient(at 100% 100%, #6EC1E4 0px, transparent 50%)",
      },
    },
  },
  plugins: [],
};
