import { FC } from "react";
import { Box, HStack, Textarea, IconButton, Tooltip, Spinner, TextareaProps, useBreakpointValue, useColorModeValue, useClipboard } from "@chakra-ui/react";
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

const TranslationArea: FC<Props> = ({ value, onChange, onSubmit, readOnly, audio, canCopy, isLoading, ...props }) => {
    const { hasCopied, onCopy } = useClipboard(value);
    const { audioExists, isAudioPlaying, onAudioClick } = useAudioFromBuffer(audio);
    const spinnerProps = {
        size: useBreakpointValue(["lg", null, "xl"]) ?? undefined,
        color: useColorModeValue("lingva.500", "lingva.200"),
        emptyColor: useColorModeValue("gray.300", "gray.600")
    };

    return (
        <Box
            position="relative"
            w="full"
        >
            <Textarea
                value={value}
                onChange={onChange}
                readOnly={readOnly}
                dir="auto"
                resize="none"
                rows={useBreakpointValue([6, null, 12]) ?? undefined}
                size="lg"
                data-gramm_editor={false}
                onKeyPress={e => (e.ctrlKey || e.metaKey) && e.key === "Enter" && onSubmit?.()}
                {...props}
            />
            <HStack
                position="absolute"
                bottom={4}
                right={4}
            >
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
            {isLoading && <Spinner
                position="absolute"
                top="0"
                bottom="0"
                left="0"
                right="0"
                m="auto"
                thickness="3px"
                label="Loading translation"
                {...spinnerProps}
            />}
        </Box>
    );
};

export default TranslationArea;
