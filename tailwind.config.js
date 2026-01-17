/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./index.html",
        "./main.js",
        "./api/**/*.js"
    ],
    theme: {
        extend: {
            colors: {
                'tesla-red': '#DC2626',
                'tesla-gold': '#F59E0B',
                'tesla-dark': '#1A202C',
            }
        },
    },
    plugins: [],
}
