const statusTexts: {
    [key: string]: string
} = {
    400: "Bad Request",
    404: "This page could not be found",
    405: "Method Not Allowed",
    500: "Internal Server Error",
    fallback: "An unexpected error has occurred"
};

export const statusTextFrom = (code: number): string => (
    statusTexts[code] ?? statusTexts.fallback
);
