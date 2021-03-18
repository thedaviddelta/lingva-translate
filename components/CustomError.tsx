import { FC } from "react";
import { Stack, HStack, Heading, Text, Icon, useColorModeValue } from "@chakra-ui/react";
import { FaSadTear } from "react-icons/fa";
import Layout from "./Layout";

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
    <Layout customTitle={`${statusCode} - ${statusTexts?.[statusCode] ?? statusTexts.fallback}`}>
        <Stack
            color={useColorModeValue("lingva.900", "lingva.100")}
            direction={["column", null, "row"]}
            justify="center"
            align="center"
            spacing={4}
            w="full"
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
    </Layout>
);

export default CustomError;
