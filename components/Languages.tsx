import { FC } from "react";

type Props = {
    langs: [string, string][]
};

const Languages: FC<Props> = ({ langs }) => (
    <>
        {langs.map(([code, name]) => (
            <option value={code} key={code}>{name}</option>
        ))}
    </>
);

export default Languages;
