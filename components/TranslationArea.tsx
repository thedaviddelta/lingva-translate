import { FC, ChangeEvent } from "react";
import { Textarea, Button, useBreakpointValue } from "@chakra-ui/react";
import { useAudioFromBuffer } from "../hooks";

type Props =  {
    value: string,
    onChange?: (e: ChangeEvent<HTMLTextAreaElement>) => void,
    readOnly?: true,
    audio?: number[],
    [key: string]: any
};

const TranslationArea: FC<Props> = ({ value, onChange, readOnly, audio, ...props }) => {
    const { audioExists, isAudioPlaying, onAudioClick } = useAudioFromBuffer(audio);
    return (
        <>
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
            <Button onClick={onAudioClick} disabled={!audioExists}>
                Play
            </Button>
        </>
    );
};

export default TranslationArea;
