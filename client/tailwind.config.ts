import type { Config } from 'tailwindcss';

export default {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [require('@tailwindcss/typography')],
  future: {
    hoverOnlyWhenSupported: true,
    respectDefaultRingColorOpacity: true,
  },
  // Optional performance optimizations
  performance: {
    // If you don't need certain features, you can disable them
    attributify: false, // Disable attributify mode if you don't use it
    transform: false, // Disable transform if you don't use arbitrary values
  },
} satisfies Config;