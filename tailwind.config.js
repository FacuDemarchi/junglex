/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // Asegúrate de incluir tus archivos fuente
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        primary: "var(--primary-color)",
        "primary-light": "var(--primary-light)",
        "primary-dark": "var(--primary-dark)",
        secondary: "var(--secondary-color)",
        "secondary-light": "var(--secondary-light)",
        "secondary-dark": "var(--secondary-dark)",
        accent: "var(--accent-color)",
        warning: "var(--warning-color)",
        success: "var(--success-color)",
        danger: "var(--danger-color)",
        info: "var(--info-color)",
        light: "var(--light-color)",
        dark: "var(--dark-color)",
        "text-primary": "var(--text-primary)",
        "text-secondary": "var(--text-secondary)",
        "text-light": "var(--text-light)",
        "text-dark": "var(--text-dark)",
      },
      spacing: {
        xs: "var(--spacing-xs)",
        sm: "var(--spacing-sm)",
        md: "var(--spacing-md)",
        lg: "var(--spacing-lg)",
        xl: "var(--spacing-xl)",
      },
      borderRadius: {
        DEFAULT: "var(--border-radius)",
      },
      borderColor: {
        DEFAULT: "var(--border-color)",
      },
      boxShadow: {
        DEFAULT: "var(--box-shadow)",
        sm: "var(--box-shadow-sm)",
        lg: "var(--box-shadow-lg)",
      },
      fontFamily: {
        base: "var(--font-family-base)",
      },
      fontSize: {
        base: "var(--font-size-base)",
        sm: "var(--font-size-sm)",
        lg: "var(--font-size-lg)",
      },
      fontWeight: {
        normal: "var(--font-weight-normal)",
        bold: "var(--font-weight-bold)",
      },
    },
  },
  plugins: [],
}
