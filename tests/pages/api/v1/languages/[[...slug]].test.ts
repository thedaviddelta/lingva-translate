import httpMocks from "node-mocks-http";
import handler from "@pages/api/v1/languages/[[...slug]]";

it("returns 404 on >1 params", async () => {
    const { req, res } = httpMocks.createMocks<any, any>({
        method: "GET",
        query: { slug: ["one", "two"] }
    });

    await handler(req, res);
    expect(res.statusCode).toBe(404);
});

it("returns 405 on forbidden method", async () => {
    const { req, res } = httpMocks.createMocks<any, any>({
        method: "POST",
        query: {}
    });

    await handler(req, res);
    expect(res.statusCode).toBe(405);
});

it("returns 400 on wrong param", async () => {
    const { req, res } = httpMocks.createMocks<any, any>({
        method: "GET",
        query: { slug: ["other"] }
    });

    await handler(req, res);
    expect(res.statusCode).toBe(400);
});

it("returns 200 on empty param", async () => {
    const { req, res } = httpMocks.createMocks<any, any>({
        method: "GET",
        query: {}
    });

    await handler(req, res);
    expect(res.statusCode).toBe(200);
    expect(res._getJSONData()).toStrictEqual({ languages: expect.any(Array) });
});

it("returns 200 on 'source' param", async () => {
    const { req, res } = httpMocks.createMocks<any, any>({
        method: "GET",
        query: { slug: ["source"] }
    });

    await handler(req, res);
    expect(res.statusCode).toBe(200);
    expect(res._getJSONData()).toStrictEqual({ languages: expect.any(Array) });
});

it("returns 200 on 'target' param", async () => {
    const { req, res } = httpMocks.createMocks<any, any>({
        method: "GET",
        query: { slug: ["target"] }
    });

    await handler(req, res);
    expect(res.statusCode).toBe(200);
    expect(res._getJSONData()).toStrictEqual({ languages: expect.any(Array) });
});
