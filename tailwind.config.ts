import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#18181B',
        secondary: '#3F3F46',
        cta: '#2563EB',
        surface: '#FFFFFF',
        muted: '#475569',
        background: '#FAFAFA',
      },
      boxShadow: {
        panel: '0 20px 60px rgba(15, 23, 42, 0.08)',
      },
    },
  },
  plugins: [],
}

export default config
