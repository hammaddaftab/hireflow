import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        anton: ["var(--font-anton)", "sans-serif"],
        heading: ["var(--font-anton)", "sans-serif"],
        bebas: ["var(--font-bebas)", "sans-serif"],
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        border: "var(--border)",
        
        // Google Material Design 3 Primary Roles
        primary: {
          DEFAULT: "var(--primary)",
          hover: "var(--primary-hover)",
          container: "var(--primary-container)",
          on: "var(--on-primary)",
          "on-container": "var(--on-primary-container)",
        },
        "on-primary": "var(--on-primary)",
        "primary-container": "var(--primary-container)",
        "on-primary-container": "var(--on-primary-container)",

        // Google Material Design 3 Surface Roles
        surface: {
          DEFAULT: "var(--surface)",
          dim: "var(--surface-dim)",
          bright: "var(--surface-bright)",
          overlay: "var(--surface-container-high)",
        },
        "surface-dim": "var(--surface-dim)",
        "surface-bright": "var(--surface-bright)",
        "surface-container-lowest": "var(--surface-container-lowest)",
        "surface-container-low": "var(--surface-container-low)",
        "surface-container": "var(--surface-container)",
        "surface-container-high": "var(--surface-container-high)",
        "surface-container-highest": "var(--surface-container-highest)",
        "surface-overlay": "var(--surface-container-high)",
        
        "on-surface": "var(--on-surface)",
        "on-surface-variant": "var(--on-surface-variant)",
        
        outline: {
          DEFAULT: "var(--outline)",
          variant: "var(--outline-variant)",
        },
        "outline-variant": "var(--outline-variant)",

        scrim: "var(--scrim)",
      },
      boxShadow: {
        gold: "0 0 14px rgba(245, 158, 11, 0.25)",
        "gold-lg": "0 0 20px rgba(245, 158, 11, 0.35)",
        surface: "0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)",
        "surface-md": "0 4px 6px -1px rgba(0, 0, 0, 0.07), 0 2px 4px -2px rgba(0, 0, 0, 0.05)",
        "surface-lg": "0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -4px rgba(0, 0, 0, 0.05)",
        overlay: "0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
      },
    },
  },
  plugins: [],
};

export default config;
