import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "#FFFFFF",
        surface: {
          raised: "#FFFFFF",
          subtle: "#F8FAFC",
          muted: "#F1F5F9",
        },
        border: {
          subtle: "#E2E8F0",
          strong: "#CBD5E1",
        },
        brand: {
          amber: "#D97706",
          emerald: "#059669",
          rose: "#DC2626",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      transitionTimingFunction: {
        spring: "cubic-bezier(0.25, 1, 0.5, 1)",
        "apple-sheet": "cubic-bezier(0.32, 0.72, 0, 1)",
        "apple-snap": "cubic-bezier(0.16, 1, 0.3, 1)",
      },
      boxShadow: {
        "apple-card": "0 2px 14px -2px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.03), inset 0 1px 0 0 rgba(255, 255, 255, 0.9)",
        "apple-glass": "0 12px 32px -4px rgba(0, 0, 0, 0.08), 0 2px 6px rgba(0, 0, 0, 0.04), inset 0 1px 0 0 rgba(255, 255, 255, 1)",
        "apple-button": "0 2px 8px rgba(217, 119, 6, 0.25), inset 0 1px 0 0 rgba(255, 255, 255, 0.35)",
      },
    },
  },
  plugins: [],
};

export default config;
