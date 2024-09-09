import { extendTheme } from "@chakra-ui/react";

const theme = extendTheme({
  styles: {
    global: {
      "html, body": {
        color: "white",
        background: "black", // Set to black for overall background
        lineHeight: "tall",
      },
    },
  },
  colors: {
    gray: {
      300: "#2D3748", // Dark background for boxes
      400: "#1A202C", // Even darker background for page
      500: "#171923", // Darkest shade used for contrast
    },
    blue: {
      500: "#3182ce", // Updated blue for a more vibrant look
      600: "#2b6cb0", // Darker blue for hover states, etc.
    },
  },
  components: {
    Box: {
      baseStyle: {
        padding: 4,
        borderRadius: "lg",
        boxShadow: "xl",
      },
    },
    Input: {
      variants: {
        filled: {
          field: {
            color: "black",
            _focus: {
              borderColor: "blue.500",
              boxShadow: `0 0 0 1px var(--chakra-colors-blue-100)`,
            },
          },
        },
      },
      defaultProps: {
        variant: "filled",
      },
    },
    Text: {
      baseStyle: {
        color: "white",
      },
    },
    Button: {
      baseStyle: {
        fontWeight: "bold",
      },
      sizes: {
        md: {
          fontSize: "md",
          padding: 6,
        },
      },
      variants: {
        solid: {
          bg: "blue.100",
          _hover: {
            bg: "blue.600",
          },
        },
      },
    },
  },
});
export default theme;
