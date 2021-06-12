import { FC } from "react";
import { CustomError } from "@components";

const My404: FC = () => (
    <CustomError statusCode={404} statusText="This page could not be found" />
);

export default My404;
