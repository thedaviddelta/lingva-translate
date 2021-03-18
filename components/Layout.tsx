import { FC } from "react";
import { Flex, VStack, Button, Link } from "@chakra-ui/react";
import Head from "next/head";
import Header from "./Header";
import Footer from "./Footer";

type Props = {
    customTitle?: string
    [key: string]: any
};

const title = "Lingva Translate";

const Layout: FC<Props> = ({ customTitle, children }) => (
    <>
        <Head>
            <title>
                {customTitle ?? title}
            </title>
            <link rel="icon" href="/favicon.svg" />
        </Head>

        <Button
            as={Link}
            href="#main"
            userSelect="none"
            position="absolute"
            top="-100px"
            left="0"
            _focus={{
                top: "0"
            }}
        >
            Skip to content
        </Button>

        <VStack minH="100vh" spacing={8}>
            <Header />
            <Flex
                as="main"
                id="main"
                flexGrow={1}
                w="full"
            >
                {children}
            </Flex>
            <Footer />
        </VStack>
    </>
);

export default Layout;
