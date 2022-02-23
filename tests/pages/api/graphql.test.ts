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
    const lang = "es";
    const text = faker.random.words();
    resolveFetchWith({ status: 200 });

    const { data } = await query({
        query: `
            query($lang: String! $text: String!) {
                audio(lang: $lang query: $text) {
                    lang {
                        code
                    }
                    text
                    audio
                }
            }
        `,
        variables: { lang, text }
    });
    expect(data).toMatchObject({ audio: { lang: { code: lang }, text, audio: expect.any(Array) } });
    expect(fetch).toHaveBeenCalledTimes(1);
});

it("returns null and throws on translation error", async () => {
    const text = faker.random.words();
    fetchMock.mockRejectOnce();

    const { data, errors } = await query({
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
    expect(data).toBeNull();
    expect(errors).toBeTruthy();
});

it("returns null and throws on audio error", async () => {
    const lang = "es";
    const text = faker.random.words();
    fetchMock.mockRejectOnce();

    const { data, errors } = await query({
        query: `
            query($lang: String! $text: String!) {
                audio(lang: $lang query: $text) {
                    audio
                }
            }
        `,
        variables: { lang, text }
    });
    expect(data).toBeNull();
    expect(errors).toBeTruthy();
});

it("keeps a default value for both source and target languages", async () => {
    const text = faker.random.words();
    const translation = faker.random.words();
    resolveFetchWith(htmlRes(translation));

    const { data } = await query({
        query: `
            query($text: String!) {
                translation(query: $text) {
                    source {
                        lang {
                            code
                            name
                        }
                    }
                    target {
                        lang {
                            code
                            name
                        }
                    }
                }
            }
        `,
        variables: { text }
    });
    expect(data).toMatchObject({
        translation: {
            source: {
                lang: {
                    code: "auto",
                    name: "Detect"
                }
            },
            target: {
                lang: {
                    code: "en",
                    name: "English"
                }
            }
        }
    });
});

it("throws error on empty query in translation", async () => {
    const { errors } = await query({
        query: `
            query {
                translation {
                    source {
                        lang {
                            code
                        }
                    }
                    target {
                        lang {
                            code
                        }
                    }
                }
            }
        `
    });
    expect(errors).toBeTruthy();
});

it("throws error on empty lang or query in audio", async () => {
    const lang = "es";
    const text = faker.random.words();

    const { errors: queryErrors } = await query({
        query: `
            query($lang: String!) {
                audio(lang: $lang) {
                    lang {
                        code
                    }
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
                    lang {
                        code
                    }
                    text
                }
            }
        `,
        variables: { text }
    });
    expect(langErrors).toBeTruthy();
});

it("returns languages on empty type", async () => {
    const { data } = await query({
        query: `
            query {
                languages {
                    code
                }
            }
        `
    });
    expect(data).toMatchObject({ languages: expect.any(Array) });
});

it("returns languages on 'source' type", async () => {
    const { data } = await query({
        query: `
            query($type: LangType!) {
                languages(type: $type) {
                    code
                }
            }
        `,
        variables: { type: "SOURCE" }
    });
    expect(data).toMatchObject({ languages: expect.any(Array) });
});

it("returns languages on 'target' type", async () => {
    const { data } = await query({
        query: `
            query($type: LangType!) {
                languages(type: $type) {
                    code
                }
            }
        `,
        variables: { type: "TARGET" }
    });
    expect(data).toMatchObject({ languages: expect.any(Array) });
});
