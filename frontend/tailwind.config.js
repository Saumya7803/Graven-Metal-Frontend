/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        coal: '#060606',
        obsidian: '#0f0f0f',
        graphite: '#171717',
        midnight: '#081018',
        onyx: '#05080d',
        brass: '#b08d57',
        gold: '#d9b66a',
        amberlux: '#f0cf8a',
        champagne: '#f4deb3',
        platinum: '#d7dde6',
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(217,182,106,0.22), 0 18px 45px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.02)',
        gold: '0 10px 24px rgba(217,182,106,0.28), 0 0 0 1px rgba(217,182,106,0.2)',
        panel: '0 0 0 1px rgba(217,182,106,0.16), 0 30px 55px rgba(2,8,15,0.6)',
        halo: '0 24px 60px rgba(0,0,0,0.62), 0 0 0 1px rgba(220,189,124,0.24)',
        insetgold: 'inset 0 1px 0 rgba(250,219,160,0.28), inset 0 -1px 0 rgba(95,66,30,0.55)',
      },
      backgroundImage: {
        'luxury-radial': 'radial-gradient(circle at 10% 10%, rgba(217,182,106,0.2), transparent 45%), radial-gradient(circle at 90% 0%, rgba(176,141,87,0.18), transparent 32%)',
        'luxury-linear': 'linear-gradient(145deg, #090f15 0%, #0d141d 52%, #070b12 100%)',
        'gold-cta': 'linear-gradient(100deg, #9f7536 0%, #d9b66a 46%, #f0cf8a 100%)',
        'metal-grid': 'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)',
        'steel-sheen': 'linear-gradient(120deg, rgba(255,255,255,0.06), rgba(255,255,255,0) 32%, rgba(255,224,165,0.09) 68%, rgba(255,255,255,0.02))',
        'gold-veil': 'radial-gradient(circle at 15% 15%, rgba(240,207,138,0.22), transparent 45%), radial-gradient(circle at 85% 0%, rgba(176,141,87,0.2), transparent 36%)',
      },
      fontFamily: {
        display: ['"Cinzel"', '"Playfair Display"', 'serif'],
        body: ['"Manrope"', 'sans-serif'],
      },
    },
  },
  plugins: [],
};


