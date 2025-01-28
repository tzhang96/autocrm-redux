import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: 'none',
            color: 'inherit',
            a: {
              color: '#2563eb',
              '&:hover': {
                color: '#1d4ed8',
              },
            },
            h1: {
              color: 'inherit',
              marginTop: '2rem',
              marginBottom: '1rem',
              fontSize: '2.25rem',
              fontWeight: '700',
            },
            h2: {
              color: 'inherit',
              marginTop: '1.75rem',
              marginBottom: '0.75rem',
              fontSize: '1.875rem',
              fontWeight: '600',
            },
            h3: {
              color: 'inherit',
              marginTop: '1.5rem',
              marginBottom: '0.75rem',
              fontSize: '1.5rem',
              fontWeight: '600',
            },
            'h1, h2, h3, h4, h5, h6': {
              color: 'inherit',
            },
            p: {
              marginTop: '1.25rem',
              marginBottom: '1.25rem',
            },
            pre: {
              backgroundColor: '#1e293b',
              color: '#e2e8f0',
              overflow: 'auto',
              padding: '1rem',
              borderRadius: '0.375rem',
            },
            code: {
              color: 'inherit',
              backgroundColor: 'rgb(243 244 246)',
              padding: '0.2em 0.4em',
              borderRadius: '0.25rem',
              fontSize: '0.875em',
            },
            'code::before': {
              content: '""',
            },
            'code::after': {
              content: '""',
            },
            ul: {
              listStyleType: 'disc',
              paddingLeft: '1.625em',
            },
            ol: {
              listStyleType: 'decimal',
              paddingLeft: '1.625em',
            },
            'ul > li': {
              position: 'relative',
              paddingLeft: '0.375em',
            },
            'ol > li': {
              position: 'relative',
              paddingLeft: '0.375em',
            },
            blockquote: {
              fontWeight: '500',
              fontStyle: 'italic',
              color: 'inherit',
              borderLeftWidth: '0.25rem',
              borderLeftColor: '#e5e7eb',
              quotes: '"\\201C""\\201D""\\2018""\\2019"',
              marginTop: '1.6em',
              marginBottom: '1.6em',
              paddingLeft: '1em',
            },
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};

export default config; 