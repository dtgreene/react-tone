import animate from 'tailwindcss-animate';

const mix = (name) =>
  `color-mix(in srgb, ${name}, transparent calc(100% - 100% * <alpha-value>))`;

/** @type {import('tailwindcss').Config} */
export default {
  content: ['src/**/*.{js,jsx}'],
  theme: {
    extend: {
      borderColor: ({ theme }) => ({
        ...theme('colors'),
        DEFAULT: theme('colors.zinc.600', 'currentColor'),
      }),
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        ring: 'var(--ring)',
        primary: {
          DEFAULT: mix('var(--primary)'),
          foreground: mix('var(--primary-foreground)'),
        },
        danger: {
          DEFAULT: mix('var(--danger)'),
          foreground: mix('var(--danger-foreground)'),
        },
        accent: {
          DEFAULT: 'var(--accent)',
          foreground: 'var(--accent-foreground)',
        },
        popover: {
          DEFAULT: 'var(--popover)',
          foreground: 'var(--popover-foreground)',
        },
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },
      },
    },
  },
  plugins: [animate],
  darkMode: 'class',
};
