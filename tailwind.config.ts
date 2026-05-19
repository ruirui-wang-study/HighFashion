import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class"],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./data/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        graphite: "#0B0F14",
        warm: "#F7F7F2",
        cool: "#D8DEE3",
        muted: "#6B7280",
        lime: "#B7FF2A",
        signal: "#2F80ED",
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
      },
      fontFamily: {
        display: ["var(--font-display)", "Arial Narrow", "sans-serif"],
        body: ["var(--font-body)", "Arial", "sans-serif"],
      },
      boxShadow: {
        utility: "0 18px 60px rgba(11, 15, 20, 0.12)",
      },
      backgroundImage: {
        grid: "linear-gradient(rgba(11,15,20,.06) 1px, transparent 1px), linear-gradient(90deg, rgba(11,15,20,.06) 1px, transparent 1px)",
      },
    },
  },
  plugins: [animate],
};

export default config;
