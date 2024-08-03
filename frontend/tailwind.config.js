module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    'node_modules/flowbite-react/**/*.{js,jsx,ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        cream: '#f8f0e3',
        gold: '#FFD700',
        
        'deep-red': '#5C0000',
        'royal-purple': '#4B0082',
        'dark-brown': '#3E2723',
        'deep-navy': '#1A237E',
        red: {
          700: '#B91C1C',
          800: '#991B1B',
          900: '#7F1D1D',
        },
        gray: {
          100: '#F3F4F6',
          200: '#E5E7EB',
          800: '#1F2937',
        },
        blue: {
          600: '#2563EB',
        },
      },
      fontFamily: {
        'cinzel': ['Cinzel', 'serif'],
        'palatino': ['Palatino', 'serif'],
      },
      backgroundImage: {
        'parchment': "url('../src/parchment-bg.jpg')",
      },
    },
  },
  plugins: [
    require('flowbite/plugin')
  ],
}