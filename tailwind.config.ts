import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/{**,.client,.server}/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          900: "#1e2a4a", // Adjust this value to match the exact shade in the image
        },
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
} satisfies Config;
