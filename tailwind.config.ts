import type { Config } from 'tailwindcss'
const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: { primary: '#0D0D1A', secondary: '#1A1A2E', card: '#16213E', hover: '#1E2640' },
        accent: { DEFAULT: '#0F3460', light: '#533483', glow: '#7B52AB' },
        text: { primary: '#E0E0E0', secondary: '#A0A0B0', muted: '#666680' },
        online: '#4CAF50', danger: '#E53935', warning: '#FF9800', success: '#4CAF50',
      },
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
      animation: { 'pulse-slow': 'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite' },
    },
  },
  plugins: [],
}
export default config
