/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./pages/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
	theme: {
		extend: {
			colors: {
				background: 'black',
			},
		},
	},
	daisyui: {
		themes: ['light', 'dark', 'retro', 'black', 'luxury', 'dracula', 'night', 'coffee'],
	},
	plugins: [require('daisyui')],
	darkMode: 'class',
};
