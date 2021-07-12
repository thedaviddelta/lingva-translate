import { FC, ChangeEvent } from "react";
import { Select } from "@chakra-ui/react";

type Props = {
    value: string,
    onChange: (e: ChangeEvent<any>) => void,
    langs: [string, string][],
    [key: string]: any
};

const LangSelect: FC<Props> = ({ value, onChange, langs, ...props }) => (
    <Select
        value={value}
        onChange={onChange}
        variant="flushed"
        px={[2, null, 3]}
        textAlign="center"
        style={{ textAlignLast: "center" }}
        {...props}
    >
        {langs.map(([code, name]) => (
            <option value={code} key={code}>{name}</option>
        ))}
    </Select>
);

export default LangSelect;
