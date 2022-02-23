import httpMocks from "node-mocks-http";
import faker from "faker";
import { htmlRes, resolveFetchWith } from "@tests/commonUtils";
import handler from "@pages/api/v1/[[...slug]]";

beforeEach(() => {
    fetchMock.resetMocks();
});

const source = "es";
const target = "ca";
const query = faker.random.words();
const slug = [source, target, query];

it("returns 404 on <3 params", async () => {
    const { req, res } = httpMocks.createMocks<any, any>({
        method: "GET",
        query: { slug: [source, target] }
    });

    await handler(req, res);
    expect(res.statusCode).toBe(404);
});

it("returns 404 on >3 params", async () => {
    const { req, res } = httpMocks.createMocks<any, any>({
        method: "GET",
        query: { slug: [source, target, query, ""] }
    });

    await handler(req, res);
    expect(res.statusCode).toBe(404);
});

it("returns 405 on forbidden method", async () => {
    const { req, res } = httpMocks.createMocks<any, any>({
        method: "POST",
        query: { slug }
    });

    await handler(req, res);
    expect(res.statusCode).toBe(405);
});

it("returns translation on scrapping resolve", async () => {
    const translationRes = faker.random.words();
    resolveFetchWith(htmlRes(translationRes));

    const { req, res } = httpMocks.createMocks<any, any>({
        method: "GET",
        query: { slug }
    });

    await handler(req, res);
    expect(res.statusCode).toBe(200);
    expect(res._getJSONData()).toStrictEqual({ translation: translationRes });
});

it("returns 500 on scrapping error", async () => {
    fetchMock.mockRejectOnce();

    const { req, res } = httpMocks.createMocks<any, any>({
        method: "GET",
        query: { slug }
    });

    await handler(req, res);
    expect(res.statusCode).toBe(500);
    expect(res._getJSONData()).toStrictEqual({ error: expect.any(String) });
});

it("returns audio on audio request", async () => {
    resolveFetchWith({ status: 200 });

    const { req, res } = httpMocks.createMocks<any, any>({
        method: "GET",
        query: { slug: ["audio", target, query] }
    });

    await handler(req, res);
    expect(res.statusCode).toBe(200);
    expect(res._getJSONData()).toStrictEqual({ audio: expect.any(Array) });
});

it("returns 500 on audio request error", async () => {
    fetchMock.mockRejectOnce();

    const { req, res } = httpMocks.createMocks<any, any>({
        method: "GET",
        query: { slug: ["audio", target, query] }
    });

    await handler(req, res);
    expect(res.statusCode).toBe(500);
});
