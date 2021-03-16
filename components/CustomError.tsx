import { FC } from "react";
import Head from "next/head";
import { Stack, VStack, HStack, Heading, Text, Icon, useColorModeValue } from "@chakra-ui/react";
import { FaSadTear } from "react-icons/fa";
import Header from "./Header";
import Footer from "./Footer";

const statusTexts: {
    [key: string]: string
} = {
    400: "Bad Request",
    404: "This page could not be found",
    405: "Method Not Allowed",
    500: "Internal Server Error",
    fallback: "An unexpected error has occurred"
};

type Props = {
    statusCode: number
};

const CustomError: FC<Props> = ({ statusCode }) => (
    <>
        <Head>
            <title>
                {statusCode} - {statusTexts?.[statusCode] ?? statusTexts.fallback}
            </title>
            <link rel="icon" href="/favicon.svg" />
        </Head>

        <VStack h="100vh">
            <Header/>
            <Stack
                flexGrow={1}
                color={useColorModeValue("lingva.900", "lingva.100")}
                direction={["column", null, "row"]}
                justify="center"
                align="center"
                spacing={4}
            >
                <HStack align="center" spacing={5}>
                    <Heading as="h1" size="3xl">
                        {statusCode}
                    </Heading>
                    <Icon as={FaSadTear} boxSize={10} />
                </HStack>
                <Text as="h2" fontSize="xl">
                    {statusTexts?.[statusCode] ?? statusTexts.fallback}
                </Text>
            </Stack>
            <Footer/>
        </VStack>
    </>
);

export default CustomError;
