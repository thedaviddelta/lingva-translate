import { FC } from "react";
import { Stack, HStack, Heading, Text, Icon, useColorModeValue } from "@chakra-ui/react";
import { FaSadTear } from "react-icons/fa";
import { CustomHead } from ".";

type Props = {
    statusCode: number,
    statusText: string
};

const CustomError: FC<Props> = ({ statusCode, statusText }) => (
    <>
        <CustomHead customTitle={`${statusCode} - ${statusText}`} />

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
                {statusText}
            </Text>
        </Stack>
    </>
);

export default CustomError;
