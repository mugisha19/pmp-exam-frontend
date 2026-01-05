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
        // Primary Colors - Unique Educational Theme
        primary: {
          50: "#ecfdf5",
          100: "#d1fae5",
          200: "#a7f3d0",
          300: "#6ee7b7",
          400: "#34d399",
          500: "#10b981", // Main emerald
          600: "#059669",
          700: "#047857",
          800: "#065f46",
          900: "#064e3b",
        },
        secondary: {
          50: "#fff7ed",
          100: "#ffedd5",
          200: "#fed7aa",
          300: "#fdba74",
          400: "#fb923c",
          500: "#f97316", // Warm orange
          600: "#ea580c",
          700: "#c2410c",
          800: "#9a3412",
          900: "#7c2d12",
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
        success: "#10b981",
        warning: "#f59e0b",
        info: "#0ea5e9",
      },
      fontFamily: {
        sans: ["Inter", "Poppins", "sans-serif"],
        display: ["Poppins", "sans-serif"],
      },
      boxShadow: {
        soft: "0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)",
        glow: "0 0 20px rgba(16, 185, 129, 0.3)",
        "glow-orange": "0 0 20px rgba(249, 115, 22, 0.3)",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-emerald": "linear-gradient(135deg, #10b981 0%, #0d9488 100%)",
        "gradient-orange": "linear-gradient(135deg, #f97316 0%, #fb7185 100%)",
        "gradient-mesh":
          "radial-gradient(at 0% 0%, #10b981 0px, transparent 50%), radial-gradient(at 100% 100%, #f97316 0px, transparent 50%)",
      },
    },
  },
  plugins: [],
};
