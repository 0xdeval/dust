import {
  createSystem,
  defaultBaseConfig,
  defineConfig,
} from "@chakra-ui/react";

const customConfig = defineConfig({
  theme: {
    textStyles: {
      fonts: {
        heading: "var(--font-inter)",
        body: "var(--font-inter)",
      },
      colors: {
        brand: {
          500: "tomato",
        },
      },
    },
  },
});

export const system = createSystem(defaultBaseConfig, customConfig);
