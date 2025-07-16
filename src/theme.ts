import { createSystem, defaultConfig, defineTokens } from "@chakra-ui/react";

const tokens = defineTokens({
  colors: {
    primary: { value: "#00ADB5" },
    secondary: { value: "#393E46" },
    success: { value: "#00ADB5" },
    error: { value: "#222831" },
    border: {value: "#ffff00"},
    backgroundPrimary: { value: "#EEEEEE" },
    backgroundSecondary: { value: "#393E46" },
  },
  spacing: {
    xs: { value: "0.25rem" },
    sm: { value: "0.5rem" },
    md: { value: "1rem" },
    lg: { value: "1.5rem" },
    xl: { value: "2rem" },
    "2xl": { value: "3rem" },
    "3xl": { value: "4rem" },
    "4xl": { value: "6rem" },
    "5xl": { value: "8rem" },
  },
  sizes: {
    xs: { value: "0.5rem" },
    sm: { value: "0.75rem" },
    md: { value: "1rem" },
    lg: { value: "1.25rem" },
    xl: { value: "1.5rem" },
    "2xl": { value: "2rem" },
    "3xl": { value: "2.5rem" },
    "4xl": { value: "3rem" },
    "5xl": { value: "4rem" },
    sidebar: { value: "12.5rem" },
    header: { value: "3.75rem" },
  },
  fontSizes: {
    xs: { value: "0.75rem" },
    sm: { value: "0.875rem" },
    md: { value: "1rem" },
    lg: { value: "1.125rem" },
    xl: { value: "1.25rem" },
    "2xl": { value: "1.5rem" },
    "3xl": { value: "1.875rem" },
    "4xl": { value: "2.25rem" },
    "5xl": { value: "3rem" },
  },
  radii: {
    xs: { value: "0.125rem" },
    sm: { value: "0.25rem" },
    md: { value: "0.375rem" },
    lg: { value: "0.5rem" },
    xl: { value: "0.75rem" },
    "2xl": { value: "1rem" },
    full: { value: "9999px" },
  },
  shadows: {
    xs: { value: "0 1px 2px 0 rgba(0, 0, 0, 0.05)" },
    sm: { value: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)" },
    md: { value: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)" },
    lg: { value: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)" },
    xl: { value: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" },
  },
  zIndex: {
    dropdown: { value: 1000 },
    sticky: { value: 1020 },
    fixed: { value: 1030 },
    modal: { value: 1050 },
    popover: { value: 1060 },
    tooltip: { value: 1070 },
  },
});

export const system = createSystem(defaultConfig, {
  theme: {
    tokens,
},
});