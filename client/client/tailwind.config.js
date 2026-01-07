/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "#000000",
                foreground: "#ededed",
                "accents-1": "#111111",
                "accents-2": "#333333",
                "accents-3": "#444444",
                "vercel-blue": "#0070f3",
            },
        },
    },
    plugins: [],
}