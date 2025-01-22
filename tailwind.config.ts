import type { Config } from "tailwindcss";

export default {
  content: [
    "./apps/dashboard/**/*.{js,ts,jsx,tsx,mdx}",
    "./apps/portal/**/*.{js,ts,jsx,tsx,mdx}",
    "./packages/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
  ],
} satisfies Config;
