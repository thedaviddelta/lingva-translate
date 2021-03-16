import { FC } from "react";
import { Flex, HStack, useColorModeValue, IconButton, Link } from "@chakra-ui/react";
import { FaGithub } from "react-icons/fa";
import Image from "next/image";
import ColorModeToggler from "./ColorModeToggler";

type Props = {
    [key: string]: any
};

const Header: FC<Props> = (props) => (
    <Flex
        px={1}
        py={3}
        justify="space-around"
        align="center"
        bgColor={useColorModeValue("lingva.100", "lingva.900")}
        w="full"
        {...props}
    >
        <Image
            src={useColorModeValue("/banner_light.svg", "/banner_dark.svg")}
            alt="Logo"
            layout="intrinsic"
            width={110}
            height={64}
        />
        <HStack spacing={4}>
            <ColorModeToggler/>
            <IconButton
                as={Link}
                href="https://github.com/TheDavidDelta/lingva-translate"
                isExternal={true}
                aria-label="GitHub"
                icon={<FaGithub />}
                colorScheme="lingva"
            />
        </HStack>
    </Flex>
);

export default Header;
