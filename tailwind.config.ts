import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        dutch: {
          orange: "#FF6B35",
          blue: "#1B4F8A",
        },
      },
    },
  },
  safelist: [
    "bg-red-500", "hover:bg-red-600",
    "bg-orange-400", "hover:bg-orange-500",
    "bg-green-500", "hover:bg-green-600",
    "bg-blue-500", "hover:bg-blue-600",
  ],
  plugins: [],
};

export default config;
