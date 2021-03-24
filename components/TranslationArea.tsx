import { FC, ChangeEvent } from "react";
import { Box, HStack, Textarea, IconButton, useBreakpointValue, useClipboard } from "@chakra-ui/react";
import { FaCopy, FaCheck, FaPlay, FaStop } from "react-icons/fa";
import { useAudioFromBuffer } from "../hooks";

type Props =  {
    value: string,
    onChange?: (e: ChangeEvent<HTMLTextAreaElement>) => void,
    readOnly?: true,
    audio?: number[],
    canCopy?: boolean,
    [key: string]: any
};

const TranslationArea: FC<Props> = ({ value, onChange, readOnly, audio, canCopy, ...props }) => {
    const { hasCopied, onCopy } = useClipboard(value);
    const { audioExists, isAudioPlaying, onAudioClick } = useAudioFromBuffer(audio);
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
                {...props}
            />
            <HStack
                position="absolute"
                bottom={4}
                right={4}
            >
                {canCopy && <IconButton
                    aria-label="Copy to clipboard"
                    icon={hasCopied ? <FaCheck /> : <FaCopy />}
                    onClick={onCopy}
                    colorScheme="lingva"
                    variant="ghost"
                    disabled={!value}
                />}
                <IconButton
                    aria-label={isAudioPlaying ? "Stop audio" : "Play audio"}
                    icon={isAudioPlaying ? <FaStop /> : <FaPlay />}
                    onClick={onAudioClick}
                    colorScheme="lingva"
                    variant="ghost"
                    disabled={!audioExists}
                />
            </HStack>
        </Box>
    );
};

export default TranslationArea;
