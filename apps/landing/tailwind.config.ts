import type { Config } from "tailwindcss";

export default {
  content: [
    "./components/**/*.{vue,js,ts}",
    "./pages/**/*.{vue,js,ts}",
    "./app.vue",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: "#000000",
          secondary: "#080808",
          elevated: "#0f0f0f",
          card: "#141414",
        },
        text: {
          DEFAULT: "#fafafa",
          secondary: "#a3a3a3",
          muted: "#737373",
          dim: "#525252",
        },
        border: {
          DEFAULT: "#262626",
          subtle: "#1a1a1a",
          hover: "#404040",
        },
        accent: "#fafafa",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
    },
  },
  plugins: [],
} satisfies Config;
