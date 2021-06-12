import { ColorModeScript } from "@chakra-ui/color-mode";
import Document, { Html, Head, Main, NextScript } from "next/document";
import theme from "@theme";

export default class MyDocument extends Document {
    render() {
        return (
            <Html lang="en">
                <Head />
                <body>
                    <ColorModeScript initialColorMode={theme.config.initialColorMode} />
                    <Main />
                    <NextScript />
                </body>
            </Html>
        );
    };
}
