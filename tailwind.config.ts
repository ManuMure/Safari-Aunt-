import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Sampled directly from the Safari Aunt Expedition logo.
        cream: {
          DEFAULT: "#F6F2E7",
          dark: "#EFE9D8",
        },
        forest: {
          DEFAULT: "#1F422E",
          dark: "#152E20",
        },
        rust: {
          DEFAULT: "#8B4A1E",
          dark: "#6E3A17",
        },
        mustard: {
          DEFAULT: "#D89242",
          light: "#F0C68A",
        },
      },
      fontFamily: {
        serif: ["var(--font-playfair)", "Georgia", "serif"],
        sans: ["var(--font-inter)", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
