import { FC } from "react";
import { CustomError } from "@components";

const My500: FC = () => (
    <CustomError statusCode={500} statusText="Internal Server Error" />
);

export default My500;
