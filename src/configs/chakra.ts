import {
  createSystem,
  defaultBaseConfig,
  defineConfig,
} from "@chakra-ui/react";

const customConfig = defineConfig({
  theme: {
    tokens: {
      colors: {
        bgSurface: {
          default: { value: "#ffffff" },
          _dark: { value: "#111111" },
        },
        textPrimary: {
          default: { value: "#111111" },
          _dark: { value: "#ffffff" },
        },
        textSecondary: {
          default: { value: "#666666" },
          _dark: { value: "#808081" },
        },
        borderPrimary: {
          default: { value: "#eaeaea" },
          _dark: { value: "#27272A" },
        },
        bgSurfaceAccent: {
          default: { value: "#F97316" },
          _dark: { value: "#F97316" },
        },
        textAccentPrimary: {
          default: { value: "#DEA466" },
          _dark: { value: "#DEA466" },
        },
        textAccentSecondary: {
          default: { value: "#000000" },
          _dark: { value: "#000000" },
        },
        borderAccent: {
          default: { value: "#6C2710" },
          _dark: { value: "#6C2710" },
        },
      },
      fonts: {
        heading: { value: "var(--font-inter)" },
        body: { value: "var(--font-inter)" },
      },
    },
  },
});

export const system = createSystem(defaultBaseConfig, customConfig);
