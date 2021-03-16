import { FC } from "react";
import { IconButton, useColorMode } from "@chakra-ui/react";
import { SunIcon, MoonIcon } from "@chakra-ui/icons";

type Props = {
    [key: string]: any
};

const ColorModeToggler: FC<Props> = (props) => {
    const { colorMode, toggleColorMode } = useColorMode();
    return (
        <IconButton
            aria-label="Toggle color mode"
            icon={colorMode === "light" ? <MoonIcon /> : <SunIcon />}
            colorScheme="lingva"
            onClick={toggleColorMode}
            {...props}
        />
    );
};

export default ColorModeToggler;
