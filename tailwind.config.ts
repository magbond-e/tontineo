import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: 'class',
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "rgb(var(--color-background) / <alpha-value>)",
        surface: "rgb(var(--color-surface) / <alpha-value>)",
        border: "rgb(var(--color-border) / <alpha-value>)",
        primary: "rgb(var(--color-primary) / <alpha-value>)",
        primaryLight: "rgb(var(--color-primaryLight) / <alpha-value>)",
        textPrimary: "rgb(var(--color-textPrimary) / <alpha-value>)",
        textSecondary: "rgb(var(--color-textSecondary) / <alpha-value>)",
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
