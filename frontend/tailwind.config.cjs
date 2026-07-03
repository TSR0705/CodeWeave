/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx}"],
  mode: "jit",
  darkMode: ["class"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Outfit", "sans-serif"],
        mono: ["Fira Code", "monospace"],
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
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
          violet: "#6366f1", // indigo-500
          glow: "rgba(99, 102, 241, 0.15)",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Elite Obsidian Slate Palette
        obsidian: {
          950: "#030303",
          900: "#0a0a0c",
          850: "#101014",
          800: "#16161c",
          700: "#22222a",
          600: "#2d2d38",
          500: "#3d3d4b",
          400: "#5d5d70",
          300: "#8e8e9f",
          200: "#c3c3ce",
          100: "#e4e4e9",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        "premium-glow": "0 0 25px -5px rgba(99, 102, 241, 0.15)",
        "card-glow": "0 10px 40px -15px rgba(0, 0, 0, 0.8)",
      },
      screens: {
        xs: "450px",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
