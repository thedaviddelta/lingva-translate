import { extendTheme } from "@chakra-ui/react";
import { mode } from "@chakra-ui/theme-tools";

export default extendTheme({
    colors: {
        lingva: {
            50: "#e7f5ed",
            100: "#bde3cb",
            200: "#92d1ab",
            300: "#64c08a",
            400: "#3cb372",
            500: "#00a659",
            600: "#009750",
            700: "#008544",
            800: "#007439",
            900: "#005525"
        }
    },
    config: {
        initialColorMode: process.env["DEFAULT_DARK_THEME"] === "true" ? "dark" : "light",
        useSystemColorMode: false
    },
    components: {
        Textarea: {
            variants: {
                outline: props => ({
                    borderColor: mode("lingva.500", "lingva.200")(props),
                    _hover: {
                        borderColor: mode("lingva.700", "lingva.400")(props),
                    },
                    _readOnly: {
                        userSelect: "auto"
                    }
                })
            }
        },
        Select: {
            variants: {
                flushed: props => ({
                    field: {
                        borderColor: mode("lingva.500", "lingva.200")(props)
                    }
                })
            }
        }
    }
});
