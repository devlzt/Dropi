import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "Sora", "ui-sans-serif", "system-ui"],
      },
      colors: {
        background: "#F6F8F7",
        foreground: "#080B16",
        muted: "#7D819B",
        primary: {
          DEFAULT: "#65D83E",
          soft: "#8AE968",
          pale: "#DDF9CE",
          foreground: "#15340D",
        },
        overdue: "#FF7A45",
        border: "#DDE3EE",
        card: "#FFFFFF",
      },
      boxShadow: {
        soft: "0 12px 30px -24px rgba(15, 23, 42, 0.22)",
        glow: "0 12px 28px -24px rgba(139, 228, 92, 0.62)",
      },
    },
  },
  plugins: [animate],
} satisfies Config;
