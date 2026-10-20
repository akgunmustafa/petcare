import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        cream: "#F4EEE4",
        ink: "#1B1510",
        muted: "#5A5148",
        paper: "#FFFBF5",
        line: "#E2D6C6",
        emergency: "#B42318",
        trust: "#0E5C4B",
        clay: "#C45C26",
      },
      fontFamily: {
        display: ["Fraunces", "Georgia", "serif"],
        sans: ["Figtree", "system-ui", "sans-serif"],
      },
      minHeight: { tap: "48px" },
      minWidth: { tap: "48px" },
    },
  },
  plugins: [],
};

export default config;
