import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        alabaster: "#FBF9F5",
        obsidian: {
          DEFAULT: "#0B1528",
          dark: "#070E1B",
          light: "#16233B",
        },
        "court-bronze": {
          DEFAULT: "#A37E44",
          dark: "#8F6B34",
          light: "#C49B5B",
        },
        "court-tan": {
          DEFAULT: "#C5A880",
          light: "#E2CEB7",
          dark: "#A8885E",
        },
        "court-border": "#E5E0D8",
        "court-card": "#FFFFFF",
      },
      fontFamily: {
        serif: ["var(--font-playfair)", "Playfair Display", "Georgia", "serif"],
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
        arabic: ["var(--font-amiri)", "Amiri", "Noto Naskh Arabic", "serif"],
      },
      boxShadow: {
        court: "0 1px 3px 0 rgba(11, 21, 40, 0.05), 0 1px 2px 0 rgba(11, 21, 40, 0.03)",
        "court-lg": "0 10px 25px -5px rgba(11, 21, 40, 0.08), 0 8px 10px -6px rgba(11, 21, 40, 0.05)",
      },
    },
  },
  plugins: [],
};

export default config;
