import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: "#FBF2E7",
        "cream-2": "#F3E6D3",
        ink: "#3A2418",
        "ink-2": "#5B3A28",
        caramel: {
          DEFAULT: "#C77A2E",
          dark: "#9C5A1C",
          light: "#E4A05C",
        },
        berry: {
          DEFAULT: "#A23E48",
          dark: "#7C2E36",
        },
        blush: "#F5DED0",
        line: "#E7D3BC",
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        card: "1.25rem 1.25rem 0.5rem 0.5rem",
      },
      boxShadow: {
        soft: "0 6px 20px -8px rgba(58, 36, 24, 0.25)",
      },
    },
  },
  plugins: [],
};

export default config;
