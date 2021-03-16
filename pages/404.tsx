import { FC } from "react";
import { CustomError } from "../components";

const My404: FC = () => (
    <CustomError statusCode={404} />
);

export default My404;
