/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{html,js,jsx,ts,tsx}"],
  extend: {
    colors: {
      primary: "var(--color-primary)",
      secondary: "var(--color-secondary)",
      background: "var(--color-background)",
      chatBg: "var(--color-chat-bg)",
      // chatText: "var(--color-chat-text)",
      chatText: "#FF0000",
      text: "var(--color-text)",
      border: "var(--color-border)",
      inputBg: "var(--color-input-bg)",
      inputText: "var(--color-input-text)",
    },
    fontFamily: {
      sans: ["var(--font-sans)"],
    },
    fontSize: {
      xs: "var(--font-size-xs)",
      sm: "var(--font-size-sm)",
      base: "var(--font-size-base)",
      lg: "var(--font-size-lg)",
      xl: "var(--font-size-xl)",
    },
    spacing: {
      1: "var(--space-1)",
      2: "var(--space-2)",
      3: "var(--space-3)",
      4: "var(--space-4)",
      5: "var(--space-5)",
      6: "var(--space-6)",
      8: "var(--space-8)",
      10: "var(--space-10)",
    },
    borderRadius: {
      sm: "var(--radius-sm)",
      md: "var(--radius-md)",
      lg: "var(--radius-lg)",
    },
  },
  plugins: [],
};
