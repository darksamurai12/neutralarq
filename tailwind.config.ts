import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--muted-foreground))",
          accent: "hsl(var(--accent))",
          border: "hsl(var(--border))",
        },
        // Cores Pastel adaptáveis
        pastel: {
          lavender: "var(--pastel-lavender, #F3F0FF)",
          peach: "var(--pastel-peach, #FFF4E6)",
          mint: "var(--pastel-mint, #EBFBEE)",
          sky: "var(--pastel-sky, #E7F5FF)",
          amber: "var(--pastel-amber, #FFF9DB)",
          rose: "var(--pastel-rose, #FFF0F6)",
          slate: "var(--pastel-slate, #F8FAFC)",
        }
      },
      borderRadius: {
        lg: "1rem",
        md: "0.75rem",
        sm: "0.5rem",
        xl: "1.25rem",
        "2xl": "1.5rem",
        "3xl": "2rem",
      },
      boxShadow: {
        'glass': '0 8px 32px -4px rgba(0, 0, 0, 0.05)',
        'card-hover': '0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.03)',
      }
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;