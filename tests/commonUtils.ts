import { MockResponseInit } from "jest-fetch-mock";

export const htmlRes = (translation: string, className = "result-container") => `
        <div>
            <div class=${className}>
                ${translation}
            </div>
        </div>
`;

export const resolveFetchWith = (params: string | MockResponseInit) => (
    fetchMock.mockResponseOnce(async () => params)
);
