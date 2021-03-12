import faker from "faker";
import { googleScrape, extractSlug } from "../../utils/translate";

const source = faker.random.locale();
const target = faker.random.locale();
const query = faker.random.words();

describe("googleScrape", () => {
    beforeEach(() => {
        fetchMock.resetMocks();
    });

    it("parses html response correctly", async () => {
        const translation = faker.random.words();
        const className = "result-container";
        const html = `
            <div class=${className}>
                ${translation}
            </div>
        `;
        fetchMock.mockResponseOnce(async () => ({ body: html }));

        expect(await googleScrape(source, target, query)).toStrictEqual({ translation });
    });

    it("returns status code on request error", async () => {
        const status = faker.random.number({ min: 400, max: 499 });
        fetchMock.mockResponseOnce(async () => ({ status }));

        expect(await googleScrape(source, target, query)).toStrictEqual({ statusCode: status });
    });

    it("returns correct message on network error", async () => {
        fetchMock.mockRejectOnce();

        const res = await googleScrape(source, target, query);
        expect(res?.errorMsg).toMatch(/retrieving/);
    });

    it("returns correct message on parsing wrong class", async () => {
        const translation = faker.random.words();
        const className = "wrong-container";
        const html = `
            <div class=${className}>
                ${translation}
            </div>
        `;
        fetchMock.mockResponseOnce(async () => ({ body: html }));

        const res = await googleScrape(source, target, query);
        expect(res?.errorMsg).toMatch(/parsing/);
    });
});

describe("extractSlug", () => {
    it("returns 'query' for 1 param", () => {
        expect(extractSlug([query])).toStrictEqual({ query });
    });

    it("returns 'target' & 'query' resp. for 2 params", () => {
        expect(extractSlug([target, query])).toStrictEqual({ target, query });
    });

    it("returns 'source', 'target' & 'query' resp. for 3 param", () => {
        expect(extractSlug([source, target, query])).toStrictEqual({ source, target, query });
    });

    it("returns empty object on 0 or >4 params", () => {
        expect(extractSlug([])).toStrictEqual({});

        const length = faker.random.number({ min: 4, max: 50 });
        const array = Array(length).fill("");
        expect(extractSlug(array)).toStrictEqual({});
    });
});
