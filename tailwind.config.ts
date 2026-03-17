import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary-light': '#E0F2F7', // A very light blue
        'primary-main': '#4FC3F7',  // A standard light blue
        'primary-dark': '#0288D1',  // A darker blue
        'secondary-light': '#BBDEFB', // Another soft blue
        'secondary-main': '#90CAF9',  // A slightly darker soft blue
        'accent-light': '#B3E5FC',  // Even lighter blue
        'accent-main': '#81D4FA',   // Lightest blue
        // Standardized alert colors (can be customized further)
        'alert-success': '#D4EDDA', // Light green
        'alert-info': '#D1ECF1',    // Light cyan
        'alert-warning': '#FFF3CD', // Light yellow
        'alert-danger': '#F8D7DA',  // Light red
      },
    },
  },
  plugins: [],
};
export default config;
