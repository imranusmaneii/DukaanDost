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
        royal: {
          50: "#f5f1ff",
          100: "#ede4ff",
          200: "#dccdff",
          300: "#c3a6ff",
          400: "#a675ff",
          500: "#8b45ff",
          600: "#7c22ff",
          700: "#6b11eb",
          800: "#590ec5",
          900: "#4a0da1",
          950: "#2c046e",
        },
        gold: {
          50: "#fffaeb",
          100: "#fff0c6",
          200: "#ffe088",
          300: "#ffc93c",
          400: "#ffb514",
          500: "#f5b301",
          600: "#d98c00",
          700: "#b46602",
          800: "#924f08",
          900: "#78410b",
          950: "#452100",
        },
        ink: {
          DEFAULT: "#1b1230",
          soft: "#4a3f63",
          muted: "#7a7091",
        },
      },
      fontFamily: {
        sans: [
          "Plus Jakarta Sans",
          "Segoe UI",
          "system-ui",
          "-apple-system",
          "sans-serif",
        ],
        urdu: ["Noto Nastaliq Urdu", "Jameel Noori Nastaleeq", "serif"],
      },
      boxShadow: {
        glow: "0 18px 60px -18px rgba(107, 17, 235, 0.45)",
        gold: "0 14px 40px -14px rgba(245, 179, 1, 0.55)",
        card: "0 1px 2px rgba(27, 18, 48, 0.04), 0 12px 32px -20px rgba(27, 18, 48, 0.25)",
      },
      backgroundImage: {
        "royal-radial":
          "radial-gradient(120% 120% at 10% 0%, #7c22ff 0%, #590ec5 42%, #2c046e 100%)",
        "gold-shine":
          "linear-gradient(120deg, #ffc93c 0%, #f5b301 45%, #ffe088 100%)",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        "fade-up": "fade-up 0.6s ease-out both",
        shimmer: "shimmer 3s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
