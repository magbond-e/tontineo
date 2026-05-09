import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#FAFAFA", // Very light gray for main background
        surface: "#FFFFFF",    // White for cards and sidebar
        border: "#E5E7EB",     // Light gray for borders
        primary: "#16A34A",    // Green 600
        primaryLight: "#DCFCE7", // Green 100 for active backgrounds
        textPrimary: "#111827", // Gray 900 for primary text
        textSecondary: "#6B7280", // Gray 500 for secondary text
        success: "#22C55E",
        warning: "#EAB308",
        danger: "#EF4444",
        gold: "#D4A843",
      },
      fontFamily: {
        sans: ["var(--font-jakarta)", "sans-serif"],
        mono: ["var(--font-jetbrains)", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
