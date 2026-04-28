/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      backgroundColor: {
        primary: 'var(--bg-primary)',
        surface: 'var(--bg-surface)',
        glass: 'var(--bg-glass)',
        'light-zone': 'var(--bg-light-zone)',
        'card-bg': 'var(--card-bg)',
        'terminal-bg': 'var(--terminal-bg)',
        'stat-tile-bg': 'var(--stat-tile-bg)',
        'nav-bg': 'var(--nav-bg)',
        'accent-blue': 'var(--accent-blue)',
        'border-active': 'var(--border-active)',
        'border-default': 'var(--border-default)',
      },
      textColor: {
        primary: 'var(--text-primary)',
        secondary: 'var(--text-secondary)',
        muted: 'var(--text-muted)',
        'on-accent': 'var(--text-on-accent)',
        terminal: 'var(--text-terminal)',
        'accent-blue': 'var(--accent-blue)',
        'accent-lime': 'var(--accent-lime)',
      },
      borderColor: {
        default: 'var(--border-default)',
        active: 'var(--border-active)',
        'border-default': 'var(--border-default)',
        'border-active': 'var(--border-active)',
        'card-border': 'var(--card-border)',
        'terminal-border': 'var(--terminal-border)',
        'glass-border': 'var(--bg-glass-border)',
        'accent-blue': 'var(--accent-blue)',
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
      }
    },
  },
  plugins: [],
};
