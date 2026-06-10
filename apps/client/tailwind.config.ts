import type { Config } from "tailwindcss";

export default {
  content: [
    "./components/**/*.{vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./app.vue",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#eef8ff",
          100: "#d9eeff",
          200: "#bce0ff",
          300: "#8eccff",
          400: "#59b0ff",
          500: "#338dff",
          600: "#1a6df5",
          700: "#1457e1",
          800: "#1747b6",
          900: "#193f8f",
          950: "#142857",
        },
        surface: {
          50: "#f6f6f9",
          100: "#ededf1",
          200: "#d7d7e0",
          300: "#b4b4c5",
          400: "#8b8ca5",
          500: "#6d6d8a",
          600: "#585872",
          700: "#48475d",
          800: "#3d3d4f",
          900: "#282836",
          950: "#1a1a24",
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
