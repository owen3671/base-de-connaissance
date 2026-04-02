import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#14213d",
        ocean: "#1d3557",
        sand: "#f6efe4",
        gold: "#c38f2d",
        mint: "#d4f2e3",
        coral: "#f6d2c4",
      },
      boxShadow: {
        soft: "0 18px 40px rgba(20, 33, 61, 0.08)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      backgroundImage: {
        "grid-soft":
          "linear-gradient(rgba(29, 53, 87, 0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(29, 53, 87, 0.08) 1px, transparent 1px)",
      },
    },
  },
  plugins: [],
};

export default config;
