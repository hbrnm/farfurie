import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#1b5e45",
          soft: "#247a58",
        },
        accent: {
          DEFAULT: "#e8a838",
          soft: "#f3d28a",
        },
        ink: {
          DEFAULT: "#14201a",
          soft: "#3d4f45",
        },
        leaf: "#eef3ea",
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      maxWidth: {
        shell: "72rem",
      },
    },
  },
  plugins: [],
} satisfies Config;
