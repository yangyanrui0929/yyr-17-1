/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        night: {
          50: "#e8ecf5",
          100: "#c5cde3",
          200: "#9eabc9",
          300: "#7789af",
          400: "#5a709b",
          500: "#3d5887",
          600: "#2a3e66",
          700: "#1a2a48",
          800: "#0f1a30",
          900: "#0a0e1a",
          950: "#060810",
        },
        amber: {
          neon: "#d4a574",
          glow: "#e8c39e",
          warm: "#b8956e",
        },
        neon: {
          pink: "#ff6b9d",
          mint: "#5eead4",
          yellow: "#ffd93d",
          purple: "#c084fc",
          blue: "#60a5fa",
        },
        film: {
          grain: "#1a1a2e",
          scratch: "rgba(255,255,255,0.03)",
        },
      },
      fontFamily: {
        display: ['"Noto Serif SC"', "serif"],
        body: ['"ZCOOL KuaiLe"', '"Noto Sans SC"', "sans-serif"],
        mono: ['"JetBrains Mono"', "monospace"],
      },
      animation: {
        "flicker": "flicker 3s ease-in-out infinite",
        "flicker-slow": "flicker 5s ease-in-out infinite",
        "glow-pulse": "glow-pulse 2s ease-in-out infinite",
        "float": "float 6s ease-in-out infinite",
        "scan": "scan 8s linear infinite",
        "grain": "grain 0.5s steps(10) infinite",
        "slide-up": "slide-up 0.5s ease-out",
        "fade-in": "fade-in 0.6s ease-out",
        "score-pop": "score-pop 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)",
      },
      keyframes: {
        flicker: {
          "0%, 100%": { opacity: "1" },
          "41%": { opacity: "1" },
          "42%": { opacity: "0.8" },
          "43%": { opacity: "1" },
          "45%": { opacity: "0.9" },
          "46%": { opacity: "1" },
          "49%": { opacity: "0.85" },
          "50%": { opacity: "1" },
          "55%": { opacity: "0.95" },
          "56%": { opacity: "1" },
        },
        "glow-pulse": {
          "0%, 100%": { boxShadow: "0 0 20px currentColor, 0 0 40px currentColor" },
          "50%": { boxShadow: "0 0 30px currentColor, 0 0 60px currentColor" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        scan: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100%)" },
        },
        grain: {
          "0%, 100%": { transform: "translate(0, 0)" },
          "10%": { transform: "translate(-5%, -10%)" },
          "30%": { transform: "translate(3%, -15%)" },
          "50%": { transform: "translate(12%, 9%)" },
          "70%": { transform: "translate(9%, 4%)" },
          "90%": { transform: "translate(-1%, 7%)" },
        },
        "slide-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "score-pop": {
          "0%": { opacity: "0", transform: "scale(0.5)" },
          "60%": { opacity: "1", transform: "scale(1.1)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
      boxShadow: {
        "neon-pink": "0 0 20px rgba(255, 107, 157, 0.5), 0 0 40px rgba(255, 107, 157, 0.3)",
        "neon-mint": "0 0 20px rgba(94, 234, 212, 0.5), 0 0 40px rgba(94, 234, 212, 0.3)",
        "neon-yellow": "0 0 20px rgba(255, 217, 61, 0.5), 0 0 40px rgba(255, 217, 61, 0.3)",
        "neon-amber": "0 0 20px rgba(212, 165, 116, 0.5), 0 0 40px rgba(212, 165, 116, 0.3)",
        "neon-purple": "0 0 20px rgba(192, 132, 252, 0.5), 0 0 40px rgba(192, 132, 252, 0.3)",
        "glass": "0 8px 32px rgba(0, 0, 0, 0.3)",
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};
