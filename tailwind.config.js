const { fontFamily } = require("tailwindcss/defaultTheme")

/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: ["src/app/**/*.{ts,tsx}", "src/components/**/*.{ts,tsx}"]

}