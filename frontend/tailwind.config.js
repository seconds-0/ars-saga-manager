module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: '#f8f0e3',
        gold: '#d4af37',
        'deep-red': '#5C0000',
        'royal-purple': '#4B0082',
        'dark-brown': '#3E2723',
        'deep-navy': '#1A237E',
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
  plugins: [],
}