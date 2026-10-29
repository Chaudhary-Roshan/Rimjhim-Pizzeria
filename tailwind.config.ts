import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        charcoal: {
          DEFAULT: "#393A3C",
          dark: "#2A2B2D",
          light: "#4E4F52",
        },
        amber: {
          DEFAULT: "#F8AC32",
          dark: "#D99020",
          light: "#FBC366",
        },
        rimjhimRed: {
          DEFAULT: "#DD2928",
          dark: "#B81F1E",
          light: "#E75352",
        },
        peach: {
          DEFAULT: "#FCC97A",
          light: "#FEDDB0",
        },
        cream: {
          DEFAULT: "#FDEBD5",
          light: "#FFF6ED",
          dark: "#F5DEC0",
        },
        cocoa: {
          DEFAULT: "#5D4342",
          light: "#7B5C5A",
        },
        dealOrange: {
          DEFAULT: "#F47729",
          hover: "#DC6318",
        },
        freshLime: {
          DEFAULT: "#BECF31",
          dark: "#9EAE24",
        },
      },
      fontFamily: {
        heading: ["Oswald", "Bebas Neue", "sans-serif"],
        body: ["Inter", "Poppins", "sans-serif"],
      },
      boxShadow: {
        card: "0 4px 20px -2px rgba(57, 58, 60, 0.08)",
        floating: "0 10px 30px -5px rgba(221, 41, 40, 0.25)",
      },
    },
  },
  plugins: [],
};

export default config;
