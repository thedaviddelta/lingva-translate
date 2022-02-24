import { ApolloServer, gql, IResolvers, ApolloError, UserInputError } from "apollo-server-micro";
import { NextApiHandler } from "next";
import NextCors from "nextjs-cors";
import { googleScrape, textToSpeechScrape } from "@utils/translate";
import { retrieveFromType, getName, isValid } from "@utils/language";

export const typeDefs = gql`
    enum LangType {
        SOURCE,
        TARGET
    }
    type Query {
        translation(source: String="auto" target: String="en" query: String!): Translation!
        audio(lang: String! query: String!): Entry!
        languages(type: LangType): [Language]!
    }
    type Translation {
        source: Entry!
        target: Entry!
    }
    type Entry {
        lang: Language!
        text: String!
        audio: [Int]!
    }
    type Language {
        code: String!
        name: String!
    }
`;

export const resolvers: IResolvers = {
    Query: {
        translation(_, args) {
            const { source, target, query } = args;

            if (!isValid(source) || !isValid(target))
                throw new UserInputError("Invalid language code");

            return {
                source: {
                    lang: {
                        code: source
                    },
                    text: query
                },
                target: {
                    lang: {
                        code: target
                    }
                }
            };
        },
        audio(_, args) {
            const { lang, query } = args;

            if (!isValid(lang))
                throw new UserInputError("Invalid language code");

            return {
                lang: {
                    code: lang
                },
                text: query
            };
        },
        languages(_, args) {
            const { type } = args;
            const langEntries = retrieveFromType(type?.toLocaleLowerCase());
            return langEntries.map(([code, name]) => ({ code, name }));
        }
    },
    Translation: {
        async target(parent) {
            const { source, target } = parent;
            const textScrape = await googleScrape(source.lang.code, target.lang.code, source.text);

            if ("errorMsg" in textScrape)
                throw new ApolloError(textScrape.errorMsg);
            return {
                lang: target.lang,
                text: textScrape.translationRes
            };
        }
    },
    Entry: {
        async audio(parent) {
            const { lang, text } = parent;
            const audio = await textToSpeechScrape(lang.code, text);
            if (!audio)
                throw new ApolloError("An error occurred while retrieving the audio");
            return audio;
        }
    },
    Language: {
        name(parent) {
            const { code, name } = parent;
            return name || getName(code);
        }
    }
};

export const config = {
    api: {
        bodyParser: false
    }
};

const apolloHandler = new ApolloServer({ typeDefs, resolvers }).createHandler({ path: "/api/graphql" });

const handler: NextApiHandler = async (req, res) => {
    await NextCors(req, res, {
        methods: ["GET", "POST"],
        origin: "*"
    });

    if (req.method !== "OPTIONS")
        return apolloHandler(req, res);
    res.end();
};

export default handler;
