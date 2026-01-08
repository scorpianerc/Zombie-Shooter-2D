/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                // Horror color palette
                blood: {
                    DEFAULT: "#8B0000",
                    dark: "#4a0000",
                    light: "#a00000",
                },
                zombie: {
                    green: "#3d5c3d",
                    rotten: "#4a5c23",
                },
                bone: "#e8e4d9",
                fog: "rgba(100, 100, 100, 0.3)",
                abyss: {
                    DEFAULT: "#0a0a0a",
                    light: "#1a1a1a",
                },
            },
            fontFamily: {
                nosifer: ["Nosifer", "cursive"],
                creepster: ["Creepster", "cursive"],
                special: ["Special Elite", "cursive"],
            },
            boxShadow: {
                "glow-red": "0 0 20px rgba(139, 0, 0, 0.8)",
                "glow-green": "0 0 20px rgba(61, 92, 61, 0.8)",
                "glow-red-lg": "0 0 40px rgba(139, 0, 0, 0.6)",
            },
            animation: {
                "fog-move": "fogMove 8s linear infinite",
                pulse: "pulse 2s ease-in-out infinite",
                "loading-pulse": "loadingPulse 1.5s ease-in-out infinite",
                drip: "drip 3s ease-in infinite",
                "float-zombie": "floatZombie 5s ease-in-out infinite",
            },
            keyframes: {
                fogMove: {
                    "0%": { transform: "translateY(0)" },
                    "100%": { transform: "translateY(-20px)" },
                },
                pulse: {
                    "0%, 100%": { opacity: "1", transform: "scale(1)" },
                    "50%": { opacity: "0.7", transform: "scale(1.02)" },
                },
                loadingPulse: {
                    "0%, 100%": { opacity: "1" },
                    "50%": { opacity: "0.6" },
                },
                drip: {
                    "0%": { height: "0", opacity: "1" },
                    "70%": { height: "100px", opacity: "1" },
                    "100%": { height: "100px", opacity: "0" },
                },
                floatZombie: {
                    "0%, 100%": { transform: "translateY(0) rotate(0deg)" },
                    "50%": { transform: "translateY(-20px) rotate(5deg)" },
                },
            },
        },
    },
    plugins: [],
};
