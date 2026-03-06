import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#030b0e',
        foreground: '#E5E7EB',
        primary: {
          DEFAULT: '#22C55E',
          foreground: '#041014',
        },
        muted: '#0d1117',
        border: '#1a2332',
        navy:   '#050d1a',
        forest: '#060f0b',
        command:'#030b0e',
      },
      backgroundOpacity: {
        '8': '0.08',
      },
    },
  },
  plugins: [],
}

export default config

