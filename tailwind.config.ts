import { type Config } from "tailwindcss";
import { nextui } from "@nextui-org/react";

export default {
  content: [
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
    "'./src/**/*.{js,ts,jsx,tsx}'",
  ],
  theme: {
    colors: {
      inherit: "inherit",
      current: "current",
      transparent: "transparent",
      black: "#000000",
      white: "#ffffff",
      accent: {
        50: "#e7ffe4",
        100: "#c9ffc4",
        200: "#98ff90",
        300: "#56ff50",
        400: "#00ff00",
        500: "#00e606",
        600: "#00b809",
        700: "#008b07",
        800: "#076d0d",
        900: "#0b5c11",
        DEFAULT: "#00ff00",
      },
      info: {
        50: "#f0f9ff",
        100: "#e0f2fe",
        200: "#bae6fd",
        300: "#7ed4fb",
        400: "#3abef7",
        500: "#0fa6e8",
        600: "#0385c6",
        700: "#046aa0",
        800: "#085a84",
        900: "#0d4b6d",
        DEFAULT: "#3abef7",
      },
      'euricom': {
        primary: "#062A30",
        secondary: "rgb(6,42,48,0.5)",
        danger: "#EE2020"
      },
    },
    extend: {
      screens: {
        xs: "480px",
      },
    },
  },
  darkMode: "class",
  plugins: [
    nextui({
      layout: {
        radius: {
          small: "2px", // rounded-small
          medium: "2px", // rounded-medium
          large: "2px", // rounded-large
        },
      },
      themes: {
        light: {
          colors: {
            primary: {
              50: "#f0fafb",
              100: "#d8eff5",
              200: "#b7e0ea",
              300: "#84c8dc",
              400: "#52abc7",
              500: "#308caa",
              600: "#2a7190",
              700: "#285d76",
              800: "#284e62",
              900: "#264253",
              DEFAULT: "#52abc7",
            },
            secondary: {
              50: "#f4f6f7",
              100: "#e2e8eb",
              200: "#c8d4d9",
              300: "#a2b6be",
              400: "#758f9b",
              500: "#648290",
              600: "#4d616d",
              700: "#43525b",
              800: "#3c474e",
              900: "#353d44",
              DEFAULT: "#648290",
            },
            success: {
              50: "#ecfdf5",
              100: "#d1fae5",
              200: "#a7f3d0",
              300: "#6ee7b7",
              400: "#37d39a",
              500: "#11b881",
              600: "#059669",
              700: "#047857",
              800: "#065f46",
              900: "#064e3b",
              DEFAULT: "#37d39a",
            },
            warning: {
              50: "#fffbeb",
              100: "#fef3c7",
              200: "#fde68a",
              300: "#fbd24e",
              400: "#fabd22",
              500: "#f49d0c",
              600: "#d87607",
              700: "#b3520a",
              800: "#91400f",
              900: "#78350f",
              DEFAULT: "#fabd22",
            },
            danger: {
              50: "#fdf3f3",
              100: "#fce7e8",
              200: "#f9d2d7",
              300: "#f3aeb7",
              400: "#ec8091",
              500: "#e4677e",
              600: "#cc3256",
              700: "#ab2548",
              800: "#902141",
              900: "#7b203d",
              DEFAULT: "#e4677e",
            },
          },
        },
      },
    }),
  ],
} satisfies Config;
