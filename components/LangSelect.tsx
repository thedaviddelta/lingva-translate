import { FC, ChangeEvent } from "react";
import { Select } from "@chakra-ui/react";
import { LangCode } from "lingva-scraper";

type Props = {
    value: string,
    onChange: (e: ChangeEvent<any>) => void,
    langs: {
        [code in LangCode]: string
    },
    detectedSource?: LangCode<"source">,
    [key: string]: any
};

const LangSelect: FC<Props> = ({ value, onChange, langs, detectedSource, ...props }) => (
    <Select
        value={value}
        onChange={onChange}
        variant="flushed"
        px={[2, null, 3]}
        textAlign="center"
        style={{ textAlignLast: "center" }}
        {...props}
    >
        {Object.entries(langs).map(([code, name]) => (
            <option value={code} key={code}>
                {name}{code === "auto" && !!detectedSource && ` (${langs[detectedSource]})`}
            </option>
        ))}
    </Select>
);

export default LangSelect;
