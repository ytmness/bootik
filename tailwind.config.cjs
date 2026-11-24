module.exports = {
  content: ["./*.html", "./admin/*.html", "./assets/js/**/*.js"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "inverse-primary": "#ffb4a8",
        "secondary-fixed": "#C8C4BC",
        "on-tertiary-fixed-variant": "#0039b4",
        "surface-container-low": "#E8E5DF",
        "surface-variant": "#C8C4BC",
        "on-secondary": "#ffffff",
        "on-secondary-container": "#5C5650",
        outline: "#8A8278",
        "surface-container-high": "#DDDBD4",
        tertiary: "#003ec2",
        "on-primary-fixed-variant": "#930000",
        "on-error-container": "#93000a",
        secondary: "#5C5650",
        "on-primary-fixed": "#410000",
        "on-surface": "#161514",
        "surface-tint": "#C8102E",
        "surface-container-highest": "#DDDBD4",
        "on-secondary-fixed": "#161514",
        "surface-container": "#DDDBD4",
        "on-background": "#161514",
        "primary-fixed-dim": "#ffb4a8",
        "inverse-on-surface": "#F2F0EB",
        "secondary-fixed-dim": "#A8A29E",
        "on-primary": "#ffffff",
        "surface-container-lowest": "#ffffff",
        "on-tertiary": "#ffffff",
        "surface-dim": "#DDDBD4",
        surface: "#F2F0EB",
        "primary-container": "#C8102E",
        "error-container": "#ffdad6",
        "on-primary-container": "#FFD4D0",
        "tertiary-container": "#0052f9",
        "on-tertiary-container": "#dce1ff",
        "surface-bright": "#F2F0EB",
        background: "#F2F0EB",
        "inverse-surface": "#161514",
        "tertiary-fixed-dim": "#b7c4ff",
        primary: "#C8102E",
        "on-error": "#ffffff",
        "outline-variant": "#D4D0C8",
        "secondary-container": "#E8E5DF",
        "primary-fixed": "#ffdad4",
        error: "#ba1a1a",
        "on-secondary-fixed-variant": "#5C5650",
        "on-tertiary-fixed": "#001551",
        "on-surface-variant": "#5C5650",
        "tertiary-fixed": "#dce1ff"
      },
      borderRadius: {
        DEFAULT: "0.125rem",
        sm: "0.125rem",
        md: "0.25rem",
        lg: "0.375rem",
        xl: "0.5rem",
        full: "9999px"
      },
      fontFamily: {
        headline: ['"Big Shoulders Display"', "sans-serif"],
        body: ["Archivo", "sans-serif"],
        label: ["Archivo", "sans-serif"]
      }
    }
  }
  ,
  plugins: []
};
