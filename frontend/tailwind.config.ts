import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "var(--ink)",
          muted: "var(--ink-muted)",
          subtle: "var(--ink-subtle)",
        },
        paper: "var(--paper)",
        surface: "var(--surface)",
        accent: {
          DEFAULT: "var(--accent)",
          hover: "var(--accent-hover)",
          ink: "var(--accent-ink)",
        },
        border: "var(--border)",
        danger: {
          DEFAULT: "var(--danger)",
          soft: "var(--danger-soft)",
        },
        success: {
          DEFAULT: "var(--success)",
          soft: "var(--success-soft)",
        },
        warn: {
          DEFAULT: "var(--warn)",
          soft: "var(--warn-soft)",
        },
        info: {
          soft: "var(--info-soft)",
        },
        ring: "var(--ring)",
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        surface: "var(--shadow-surface)",
      },
      transitionTimingFunction: {
        out: "var(--ease-out)",
      },
    },
  },
  plugins: [],
} satisfies Config;
