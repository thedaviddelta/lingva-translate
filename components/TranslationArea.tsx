import { FC, ChangeEvent } from "react";
import { Textarea, useBreakpointValue } from "@chakra-ui/react";

type Props =  {
    value: string,
    onChange?: (e: ChangeEvent<HTMLTextAreaElement>) => void,
    readOnly?: true
    [key: string]: any
};

const TranslationArea: FC<Props> = ({ value, onChange, readOnly, ...props }) => (
    <Textarea
        value={value}
        onChange={onChange}
        readOnly={readOnly}
        lang="auto"
        dir="auto"
        resize="none"
        rows={useBreakpointValue([6, null, 12]) ?? undefined}
        size="lg"
        {...props}
    />
);

export default TranslationArea;
