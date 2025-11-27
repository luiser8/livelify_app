/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Colores principales de Livelify (azules y violetas)
                'livelify': {
                    50: '#f0f4ff',
                    100: '#e0e9ff',
                    200: '#c7d7fe',
                    300: '#a4b8fc',
                    400: '#8091f8',
                    500: '#6366f1', // Azul principal
                    600: '#5558e3',
                    700: '#4044c8',
                    800: '#3538a2',
                    900: '#2f3280',
                    950: '#1e1f4b',
                },
                'livelify-purple': {
                    50: '#faf5ff',
                    100: '#f3e8ff',
                    200: '#e9d5ff',
                    300: '#d8b4fe',
                    400: '#c084fc',
                    500: '#a855f7', // Púrpura principal
                    600: '#9333ea',
                    700: '#7e22ce',
                    800: '#6b21a8',
                    900: '#581c87',
                    950: '#3b0764',
                },
                'livelify-sky': {
                    50: '#f0f9ff',
                    100: '#e0f2fe',
                    200: '#bae6fd',
                    300: '#7dd3fc',
                    400: '#38bdf8',
                    500: '#0ea5e9', // Azul cielo
                    600: '#0284c7',
                    700: '#0369a1',
                    800: '#075985',
                    900: '#0c4a6e',
                },
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
            backgroundImage: {
                'gradient-livelify': 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                'gradient-livelify-light': 'linear-gradient(135deg, #8091f8 0%, #c084fc 100%)',
            },
        },
    },
    plugins: [],
}