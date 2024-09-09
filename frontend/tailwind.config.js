const { join } = require("path");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    join(__dirname, "src/**/*.{js,jsx,ts,tsx,html}"),
    join(__dirname, "pages/**/*.{js,jsx,ts,tsx,html}"),
    join(__dirname, "components/**/*.{js,jsx,ts,tsx,html}"),
    join(__dirname, "app/**/*.{js,jsx,ts,tsx,html}"),
  ],
  theme: {
    extend: {},
  },
  plugins: [require("daisyui")],
};
