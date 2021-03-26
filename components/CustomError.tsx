import { FC } from "react";
import { Stack, HStack, Heading, Text, Icon, useColorModeValue } from "@chakra-ui/react";
import { FaSadTear } from "react-icons/fa";
import Layout from "./Layout";
import { statusTextFrom } from "../utils/error";

type Props = {
    statusCode: number
};

const CustomError: FC<Props> = ({ statusCode }) => (
    <Layout customTitle={`${statusCode} - ${statusTextFrom(statusCode)}`}>
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
                {statusTextFrom(statusCode)}
            </Text>
        </Stack>
    </Layout>
);

export default CustomError;
