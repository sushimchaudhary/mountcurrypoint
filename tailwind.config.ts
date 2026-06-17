import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // You can define your theme colors or fonts here
      colors: {
        primary: "#22c55e", // Example: match your green branding
      },
    },
  },
  plugins: [
    require("@tailwindcss/typography"),
    // You can add other plugins here like @tailwindcss/forms
  ],
};

export default config;