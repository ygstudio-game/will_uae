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
        paper: "#FFFEFA",
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
        "court-gold": {
          DEFAULT: "#D7B48B",
          text: "#8A6233",
          dark: "#B88E5E",
        },
        "brand-purple": {
          DEFAULT: "#6243AD",
          dark: "#443074",
          light: "#7B5EC6",
        },
        "brand-plum": {
          DEFAULT: "#382852",
          dark: "#281B40",
        },
        lavender: {
          DEFAULT: "#F0EBF9",
          soft: "#F0EBF9",
          subtle: "#F7F4FC",
        },
        "court-border": "#E5E0D8",
        "court-line": "#E4DFEE",
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
        "card-soft": "0 8px 25px rgba(51, 35, 76, 0.05)",
      },
    },
  },
  plugins: [],
};

export default config;
