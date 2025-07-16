import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./app.tsx";

import { ChakraProvider } from "@chakra-ui/react";
import { createSystem, defaultConfig } from "@chakra-ui/react";

const system = createSystem(defaultConfig, {
  theme: {
    tokens: {
      colors: {
        brand: {
          1: { value: "#222831" },
          2: { value: "#393E46" },
          3: { value: "#00ADB5" },
          4: { value: "#EEEEEE" },
        },
      },
    },
    // components: {
    //   Menu: {
    //     baseStyle: {
    //       menu: {
    //         boxShadow: { value: "lg" },
    //         rounded: { value: "lg" },
    //         flexDirection: { value: "column" },
    //         py: { value: "2" },
    //       },
    //       item: {
    //         fontWeight: { value: "medium" },
    //         lineHeight: { value: "normal" },
    //         color: { value: "gray.600" },
    //       },
    //     },
    //     sizes: {
    //       sm: {
    //         item: {
    //           fontSize: { value: "0.75rem" },
    //           px: { value: 2 },
    //           py: { value: 1 },
    //         },
    //       },
    //       md: {
    //         item: {
    //           fontSize: { value: "0.875rem" },
    //           px: { value: 3 },
    //           py: { value: 2 },
    //         },
    //       },
    //     },
    //     variants: {
    //       bold: {
    //         item: {
    //           fontWeight: { value: "bold" },
    //         },
    //         menu: {
    //           boxShadow: { value: "xl" },
    //         },
    //       },
    //       colorful: {
    //         item: {
    //           color: { value: "orange.600" },
    //         },
    //         menu: {
    //           bg: { value: "orange.100" },
    //         },
    //       },
    //     },
    //     defaultProps: {
    //       size: "md",
    //     },
    //   },
    //   Button: {
    //     baseStyle: {
    //       bg: { value: "{colors.brand.2}" },
    //       color: { value: "{colors.brand.4}" },
    //       border: { value: "none" },
    //       _hover: {
    //         bg: { value: "{colors.brand.4}" },
    //       },
    //     },
    //     variants: {
    //       solid: {
    //         bg: { value: "{colors.brand.2}" },
    //         color: { value: "{colors.brand.4}" },
    //         border: { value: "none" },
    //         _hover: {
    //           bg: { value: "{colors.brand.3}" },
    //         },
    //       },
    //     },
    //   },
    // },
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ChakraProvider value={system}>
      <App />
    </ChakraProvider>
  </StrictMode>
);
