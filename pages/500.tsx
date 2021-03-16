import { FC } from "react";
import { CustomError } from "../components";

const My500: FC = () => (
    <CustomError statusCode={500} />
);

export default My500;
