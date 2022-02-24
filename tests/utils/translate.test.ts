import { htmlRes, resolveFetchWith } from "@tests/commonUtils";
import faker from "faker";
import { googleScrape, extractSlug, textToSpeechScrape } from "@utils/translate";

const source = "es";
const target = "ca";
const query = faker.random.words();

describe("googleScrape", () => {
    beforeEach(() => {
        fetchMock.resetMocks();
    });

    it("parses html response correctly", async () => {
        const translationRes = faker.random.words();
        const html = htmlRes(translationRes);
        resolveFetchWith(html);

        expect(await googleScrape(source, target, query)).toStrictEqual({ translationRes });
    });

    it("returns correct message on request error", async () => {
        const status = faker.datatype.number({ min: 400, max: 499 });
        resolveFetchWith({ status });

        const res = await googleScrape(source, target, query);
        expect("errorMsg" in res && res.errorMsg).toMatch(/retrieving/);
    });

    it("returns correct message on network error", async () => {
        fetchMock.mockRejectOnce();

        const res = await googleScrape(source, target, query);
        expect("errorMsg" in res && res.errorMsg).toMatch(/retrieving/);
    });

    it("returns correct message on parsing wrong class", async () => {
        const translation = faker.random.words();
        const className = "wrong-container";
        const html = htmlRes(translation, className);
        resolveFetchWith(html);

        const res = await googleScrape(source, target, query);
        expect("errorMsg" in res && res.errorMsg).toMatch(/parsing/);
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

        const length = faker.datatype.number({ min: 4, max: 50 });
        const array = Array(length).fill("");
        expect(extractSlug(array)).toStrictEqual({});
    });
});

describe("textToSpeechScrape", () => {
    it("returns an array on successful request", async () => {
        resolveFetchWith({ status: 200 });
        expect(await textToSpeechScrape(target, query)).toEqual(expect.any(Array));
    });

    it("returns 'null' on request error", async () => {
        const status = faker.datatype.number({ min: 400, max: 499 });
        resolveFetchWith({ status });
        expect(await textToSpeechScrape(target, query)).toBeNull();
    });

    it("returns 'null' on network error", async () => {
        fetchMock.mockRejectOnce();
        expect(await textToSpeechScrape(target, query)).toBeNull();
    });
});
