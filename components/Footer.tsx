import { FC } from "react";
import { Center, Text } from "@chakra-ui/react";

type Props = {
    [key: string]: any
};

const Footer: FC<Props> = (props) => (
    <Center
        as="footer"
        w="full"
        p={3}
        fontSize={["sm", null, "md"]}
        {...props}
    >
        <Text as="span">&#169; 2021 TheDavidDelta</Text>
        <Text as="span" mx={2}>·</Text>
        <Text as="span">Licensed under AGPLv3</Text>
    </Center>
);

export default Footer;
