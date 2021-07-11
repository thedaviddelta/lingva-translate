import { useState, useEffect, FC } from "react";
import { IconButton } from "@chakra-ui/react";
import { FaBolt } from "react-icons/fa";

type Props = {
    onAuto: () => void,
    [key: string]: any
};

const initLocalStorage = () => {
    const initial = typeof window !== "undefined" && localStorage.getItem("isauto");
    return initial ? initial === "true" : false;
};

const AutoTranslateButton: FC<Props> = ({ onAuto, ...props }) => {
    const [isAuto, setIsAuto] = useState(initLocalStorage);

    useEffect(() => {
        localStorage.setItem("isauto", isAuto.toString());
    }, [isAuto]);

    useEffect(() => {
        isAuto && onAuto();
    }, [isAuto, onAuto]);

    return (
        <IconButton
            aria-label="Switch auto"
            icon={<FaBolt />}
            colorScheme="lingva"
            variant={isAuto ? "solid" : "outline"}
            onClick={() => setIsAuto(current => !current)}
            {...props}
        />
    );
};

export default AutoTranslateButton;
