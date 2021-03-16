import { FC } from "react";
import { Center, Text, useColorModeValue } from "@chakra-ui/react";

type Props = {
    [key: string]: any
};

const Footer: FC<Props> = (props) => (
    <Center
        w="full"
        p={3}
        fontSize={["sm", null, "md"]}
        bgColor={useColorModeValue("lingva.100", "lingva.900")}
        color={useColorModeValue("lingva.800", "lingva.200")}
        {...props}
    >
        <Text as="span">&#169; 2021 TheDavidDelta</Text>
        <Text as="span" mx={2}>·</Text>
        <Text as="span">Licensed under AGPLv3</Text>
    </Center>
);

export default Footer;
