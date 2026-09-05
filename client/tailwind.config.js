/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Space Grotesk'", "system-ui", "sans-serif"],
        sans: ["'Inter'", "system-ui", "sans-serif"],
      },
      colors: {
        ink: {
          950: "#0a0a0c",
          900: "#111114",
          800: "#18181c",
          700: "#232328",
          600: "#2e2e35",
          500: "#4a4a52",
        },
        bone: {
          50: "#f7f6f2",
          100: "#efeee7",
          200: "#dedcd0",
        },
        neon: {
          cyan: "#5ef2ff",
          blue: "#5b8cff",
          purple: "#b083ff",
          pink: "#ff5fa8",
        },
      },
      boxShadow: {
        glow: "0 0 40px -8px rgba(94,242,255,0.35)",
        "glow-pink": "0 0 40px -8px rgba(255,95,168,0.35)",
        "glow-purple": "0 0 40px -8px rgba(176,131,255,0.35)",
      },
      backgroundImage: {
        "grid-fade": "radial-gradient(circle at 50% 0%, rgba(94,242,255,0.08), transparent 60%)",
      },
      animation: {
        "fade-up": "fadeUp 0.6s ease forwards",
        marquee: "marquee 30s linear infinite",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: 0, transform: "translateY(16px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
    },
  },
  plugins: [],
};
