/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./src/pages/**/*.{js,ts,jsx,tsx}', './src/components/**/*.{js,ts,jsx,tsx}'],
	theme: {
		extend: {
			colors: {
				background: 'black',
			},
			keyframes: {
				pulsate: {
					'0%, 100%': { transform: 'scale(1);' },
					'50%': { transform: 'scale(1.4);' },
				},
			},
			animation: {
				pulsate: 'pulsate 1s ease-in-out infinite',
			},
		},
	},
	daisyui: {
		themes: ['light', 'dark', 'retro', 'black', 'luxury', 'dracula', 'night', 'coffee'],
	},
	plugins: [require('daisyui')],
	darkMode: 'class',
};

