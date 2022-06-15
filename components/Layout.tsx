import { FC, PropsWithChildren } from "react";
import { Flex, VStack, Button, Link, useColorModeValue } from "@chakra-ui/react";
import { Header, Footer } from ".";

type Props = {
    [key: string]: any
};

const Layout: FC<PropsWithChildren<Props>> = ({ children, ...props }) => (
    <>
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

        <VStack minH="100%" spacing={7}>
            <Header
                bgColor={useColorModeValue("lingva.100", "lingva.900")}
            />

            <Flex
                as="main"
                id="main"
                flexGrow={1}
                w="full"
                {...props}
            >
                {children}
            </Flex>

            <Footer
                bgColor={useColorModeValue("lingva.100", "lingva.900")}
                color={useColorModeValue("lingva.900", "lingva.100")}
            />
        </VStack>
    </>
);

export default Layout;
