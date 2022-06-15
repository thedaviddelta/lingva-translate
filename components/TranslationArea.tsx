import { FC } from "react";
import {
    VStack,
    HStack,
    Text,
    Textarea,
    IconButton,
    Tooltip,
    Spinner,
    TextareaProps,
    useBreakpointValue,
    useColorModeValue,
    useClipboard
} from "@chakra-ui/react";
import { FaCopy, FaCheck, FaPlay, FaStop } from "react-icons/fa";
import { useAudioFromBuffer } from "@hooks";

type Props =  {
    value: string,
    onChange?: TextareaProps["onChange"],
    onSubmit?: () => void,
    readOnly?: true,
    audio?: number[],
    canCopy?: boolean,
    isLoading?: boolean,
    [key: string]: any
};

const TranslationArea: FC<Props> = ({ value, onChange, onSubmit, readOnly, audio, canCopy, isLoading, pronunciation, ...props }) => {
    const { hasCopied, onCopy } = useClipboard(value);
    const { audioExists, isAudioPlaying, onAudioClick } = useAudioFromBuffer(audio);
    const spinnerProps = {
        size: useBreakpointValue(["lg", null, "xl"]) ?? "lg",
        color: useColorModeValue("lingva.500", "lingva.200"),
        emptyColor: useColorModeValue("gray.300", "gray.600")
    };

    return (
        <VStack
            w="full"
            h={useBreakpointValue([44, null, 80]) ?? 44}
            align="stretch"
            spacing={0}
            position="relative"
            isolation="isolate"
            border="1px solid"
            borderColor={useColorModeValue("lingva.500", "lingva.200")}
            borderRadius="md"
            _hover={{
                borderColor: useColorModeValue("lingva.800", "lingva.400"),
            }}
            _readOnly={{
                userSelect: "auto"
            }}
        >
            <Textarea
                value={value}
                onChange={onChange}
                readOnly={readOnly}
                dir="auto"
                resize="none"
                size="lg"
                variant="ghost"
                boxShadow={`inset 0 0 1px ${useColorModeValue("hsl(146 100% 17% / 25%)", "hsl(142 40% 82% / 25%)")}`}
                data-gramm_editor={false}
                onKeyPress={e => (e.ctrlKey || e.metaKey) && e.key === "Enter" && onSubmit?.()}
                flex={1}
                bgColor="transparent"
                _focus={{
                    bgColor: useColorModeValue("hsl(0deg 0% 0% / 2.5%)", "hsl(0deg 0% 100% / 2.5%)")
                }}
                {...props}
            />
            <HStack
                position={!pronunciation ? "absolute" : undefined}
                pointerEvents={!pronunciation ? "none" : undefined}
                bottom={0}
                left={0}
                right={0}
            >
                <HStack justify="space-between" px={5} h={useBreakpointValue([12, null, 14]) ?? 12} w="0px" flex={1}>
                    <Tooltip label={pronunciation}>
                        <Text opacity={0.75} whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">
                            {pronunciation}
                        </Text>
                    </Tooltip>
                    <HStack pointerEvents="auto">
                        {canCopy && (
                            <Tooltip label={hasCopied ? "Copied!" : "Copy to clipboard"}>
                                <IconButton
                                    aria-label="Copy to clipboard"
                                    icon={hasCopied ? <FaCheck /> : <FaCopy />}
                                    onClick={onCopy}
                                    colorScheme="lingva"
                                    variant="ghost"
                                    disabled={!value}
                                />
                            </Tooltip>
                        )}
                        <Tooltip label={isAudioPlaying ? "Stop audio" : "Play audio"}>
                            <IconButton
                                aria-label={isAudioPlaying ? "Stop audio" : "Play audio"}
                                icon={isAudioPlaying ? <FaStop /> : <FaPlay />}
                                onClick={onAudioClick}
                                colorScheme="lingva"
                                variant="ghost"
                                disabled={!audioExists}
                            />
                        </Tooltip>
                    </HStack>
                </HStack>
            </HStack>
            {isLoading && <Spinner
                position="absolute"
                inset={0}
                m="auto !important"
                thickness="3px"
                label="Loading translation"
                {...spinnerProps}
            />}
        </VStack>
    );
};

export default TranslationArea;
