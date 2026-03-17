import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./charts/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        matrix: {
          pink: "#ff0088",
          magenta: "#cc0066",
          darkMagenta: "#660033",
          black: "#000000",
          darkGray: "#0a0a0a",
          gray: "#1a1a2e",
          cyan: "#00ffff",
        },
      },
      fontFamily: {
        mono: ["'Share Tech Mono'", "monospace"],
        display: ["'Orbitron'", "sans-serif"],
      },
      boxShadow: {
        neon: "0 0 5px #ff0088, 0 0 20px #ff008855, 0 0 40px #ff008833",
        "neon-lg":
          "0 0 10px #ff0088, 0 0 30px #ff008855, 0 0 60px #ff008833",
        "neon-cyan": "0 0 5px #00ffff, 0 0 20px #00ffff55",
      },
      animation: {
        "pulse-neon": "pulseNeon 2s ease-in-out infinite",
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-up": "slideUp 0.5s ease-out",
        "glow-pulse": "glowPulse 3s ease-in-out infinite",
      },
      keyframes: {
        pulseNeon: {
          "0%, 100%": { boxShadow: "0 0 5px #ff0088, 0 0 20px #ff008855" },
          "50%": { boxShadow: "0 0 10px #ff0088, 0 0 40px #ff008877" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        glowPulse: {
          "0%, 100%": { opacity: "0.5" },
          "50%": { opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
