import { AppProps } from "next/app";
import { FC } from "react";
import { ChakraProvider } from "@chakra-ui/react";
import theme from "@theme";
import { Layout } from "@components";

const App: FC<AppProps> = ({ Component, pageProps }) => (
    <ChakraProvider theme={theme}>
        <Layout>
            <Component {...pageProps} />
        </Layout>
    </ChakraProvider>
);

export default App;
