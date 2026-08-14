import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#F7F7F5",
        surface: "#FFFFFF",
        foreground: "#161A17",
        muted: "#667067",
        border: "#E3E7E2",
        primary: { DEFAULT: "#185C45", hover: "#124936" },
        positive: "#18794E",
        negative: "#C13B3A",
        warning: "#A46714",
      },
      borderRadius: { lg: "12px", md: "8px" },
    },
  },
  plugins: [],
};

export default config;
