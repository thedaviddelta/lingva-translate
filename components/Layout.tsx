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
const description = "Alternative front-end for Google Translate, serving as a Free and Open Source translator with over a hundred languages available";

const Layout: FC<Props> = ({ customTitle, children }) => (
    <>
        <Head>
            <title>
                {customTitle ?? title}
            </title>
            <meta name="description" content={description} />
            <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
            <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
            <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
            <meta property="og:type" content="website" />
            <meta property="og:title" content={customTitle ?? title} />
            <meta property="og:description" content={description} />
            <meta property="og:locale" content="en" />
            <meta property="og:image" content="/favicon-512x512.png" />
            <meta property="og:image:type" content="image/png" />
            <meta property="og:image:width" content="512" />
            <meta property="og:image:height" content="512" />
            <meta property="og:image:alt" content={title} />
            <meta property="twitter:card" content="summary_large_image" />
            <meta property="twitter:creator" content="@thedaviddelta" />
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
