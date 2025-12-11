/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                'ios-1': 'rgb(111, 45, 189)',
                'ios-2': 'rgb(185, 250, 248)',
                'ios-3': 'rgb(166, 99, 204)',
                'ios-4': 'rgb(178, 152, 220)',
                'ios-5': 'rgb(184, 208, 235)',
            },
            backdropBlur: {
                'xs': '2px',
            }
        },
    },
    plugins: [],
};
