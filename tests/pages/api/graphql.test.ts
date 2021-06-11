import { createTestClient } from "apollo-server-testing";
import { ApolloServer } from "apollo-server-micro";
import faker from "faker";
import { htmlRes, resolveFetchWith } from "@tests/commonUtils";
import { typeDefs, resolvers } from "@pages/api/graphql";

beforeEach(() => {
    fetchMock.resetMocks();
});

const { query } = createTestClient(new ApolloServer({ typeDefs, resolvers }));

it("doesn't trigger fetch if neither target nor audio are specified", async () => {
    const text = faker.random.words();
    const { data } = await query({
        query: `
            query($text: String!) {
                translation(query: $text) {
                    source {
                        text
                    }
                }
            }
        `,
        variables: { text }
    });
    expect(data).toMatchObject({ translation: { source: { text } } });
    expect(fetch).not.toHaveBeenCalled();
});

it("returns translation triggering fetch", async () => {
    const text = faker.random.words();
    const translation = faker.random.words();
    resolveFetchWith(htmlRes(translation));

    const { data } = await query({
        query: `
            query($text: String!) {
                translation(query: $text) {
                    target {
                        text
                    }
                }
            }
        `,
        variables: { text }
    });
    expect(data).toMatchObject({ translation: { target: { text: translation } } });
    expect(fetch).toHaveBeenCalledTimes(1);
});

it("returns audio triggering fetch", async () => {
    const lang = faker.random.locale();
    const text = faker.random.words();
    resolveFetchWith({ status: 200 });

    const { data } = await query({
        query: `
            query($lang: String! $text: String!) {
                audio(lang: $lang query: $text) {
                    lang
                    text
                    audio
                }
            }
        `,
        variables: { lang, text }
    });
    expect(data).toMatchObject({ audio: { lang, text, audio: expect.any(Array) } });
    expect(fetch).toHaveBeenCalledTimes(1);
});

it("returns null on translation error", async () => {
    const text = faker.random.words();
    fetchMock.mockRejectOnce();

    const { data } = await query({
        query: `
            query($text: String!) {
                translation(query: $text) {
                    target {
                        text
                    }
                }
            }
        `,
        variables: { text }
    });
    expect(data).toMatchObject({ translation: { target: { text: null } } });
});

it("returns null on audio error", async () => {
    const lang = faker.random.locale();
    const text = faker.random.words();
    fetchMock.mockRejectOnce();

    const { data } = await query({
        query: `
            query($lang: String! $text: String!) {
                audio(lang: $lang query: $text) {
                    audio
                }
            }
        `,
        variables: { lang, text }
    });
    expect(data).toMatchObject({ audio: { audio: null } });
});

it("keeps a default value for both source and target languages", async () => {
    const text = faker.random.words();
    fetchMock.mockRejectOnce();

    const { data } = await query({
        query: `
            query($text: String!) {
                translation(query: $text) {
                    source {
                        lang
                    }
                    target {
                        lang
                    }
                }
            }
        `,
        variables: { text }
    });
    expect(data).toMatchObject({ translation: { source: { lang: "auto" }, target: { lang: "en" } } });
});

it("throws error on empty query in translation", async () => {
    const { errors } = await query({
        query: `
            query {
                translation {
                    source {
                        lang
                    }
                    target {
                        lang
                    }
                }
            }
        `
    });
    expect(errors).toBeTruthy();
});

it("throws error on empty lang or query in audio", async () => {
    const lang = faker.random.locale();
    const text = faker.random.words();

    const { errors: queryErrors } = await query({
        query: `
            query($lang: String!) {
                audio(lang: $lang) {
                    lang
                    text
                }
            }
        `,
        variables: { lang }
    });
    expect(queryErrors).toBeTruthy();

    const { errors: langErrors } = await query({
        query: `
            query($text: String!) {
                audio(query: $text) {
                    lang
                    text
                }
            }
        `,
        variables: { text }
    });
    expect(langErrors).toBeTruthy();
});
