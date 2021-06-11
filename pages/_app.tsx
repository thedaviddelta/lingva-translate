import { AppProps } from "next/app";
import { FC } from "react";
import { ChakraProvider } from "@chakra-ui/react";
import theme from "@theme";

const App: FC<AppProps> = ({ Component, pageProps }) => (
    <ChakraProvider theme={theme}>
        <Component {...pageProps} />
    </ChakraProvider>
);

export default App;
