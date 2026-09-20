/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "#07060B",
        surface: {
          50: "#0C0A12",
          100: "#12101A",
          200: "#181421",
          300: "#201A2D",
          border: "rgba(139, 92, 246, 0.12)",
        },
        violet: {
          300: "#C4B5FD",
          400: "#A78BFA",
          500: "#8B5CF6",
          600: "#7C3AED",
          700: "#6D28D9",
          800: "#5B21B6",
          900: "#4C1D95",
          neon: "#A855F7",
        },
        forge: {
          bg: "#07060B",
          surface: "#0C0A12",
          card: "#12101A",
          elevated: "#181421",
          strong: "#201A2D",
          violet: "#8B5CF6",
          brightViolet: "#A78BFA",
          deepViolet: "#6D28D9",
          darkViolet: "#4C1D95",
          neonViolet: "#A855F7",
          success: "#22C55E",
          warning: "#F59E0B",
          error: "#EF4444",
          info: "#60A5FA",
        },
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        mono: ["JetBrains Mono", "Menlo", "Courier New", "monospace"],
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "glow": "glow 2.5s ease-in-out infinite alternate",
        "glow-active": "glowActive 2s ease-in-out infinite alternate",
        "ai-float": "aiFloat 4s ease-in-out infinite",
        "ai-float-delayed": "aiFloat 4s ease-in-out 2s infinite",
        "ai-pulse-radar": "aiRadar 3s cubic-bezier(0, 0, 0.2, 1) infinite",
        "ai-beam": "aiBeam 3s linear infinite",
        "ai-shimmer": "aiShimmer 2.5s ease-in-out infinite",
        "ai-scanline": "aiScanline 4s linear infinite",
        "ai-packet": "aiPacket 3s ease-in-out infinite",
      },
      keyframes: {
        glow: {
          "0%": { boxShadow: "0 0 15px rgba(139, 92, 246, 0.15)" },
          "100%": { boxShadow: "0 0 30px rgba(139, 92, 246, 0.35)" },
        },
        glowActive: {
          "0%": { boxShadow: "0 0 20px rgba(139, 92, 246, 0.25), 0 0 40px rgba(168, 85, 247, 0.10)" },
          "100%": { boxShadow: "0 0 35px rgba(139, 92, 246, 0.45), 0 0 70px rgba(168, 85, 247, 0.20)" },
        },
        aiFloat: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        aiRadar: {
          "0%": { transform: "scale(0.8)", opacity: "0.8" },
          "100%": { transform: "scale(2.2)", opacity: "0" },
        },
        aiBeam: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(200%)" },
        },
        aiShimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        aiScanline: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(1000%)" },
        },
        aiPacket: {
          "0%": { left: "0%", opacity: "0" },
          "15%": { opacity: "1" },
          "85%": { opacity: "1" },
          "100%": { left: "100%", opacity: "0" },
        },
      },
    },
  },
  plugins: [],
};
