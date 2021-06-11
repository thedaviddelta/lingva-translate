import { ApolloServer, gql, IResolvers } from "apollo-server-micro";
import { NextApiHandler } from "next";
import NextCors from "nextjs-cors";
import { googleScrape, textToSpeechScrape } from "@utils/translate";

export const typeDefs = gql`
    type Query {
        translation(source: String="auto" target: String="en" query: String!): Translation!
        audio(lang: String! query: String!): Entry!
    }
    type Translation {
        source: Entry!
        target: Entry!
    }
    type Entry {
        lang: String!
        text: String
        audio: [Int]
    }
`;

export const resolvers: IResolvers = {
    Query: {
        translation(_, args) {
            const { source, target, query } = args;
            return {
                source: {
                    lang: source,
                    text: query
                },
                target: {
                    lang: target
                }
            };
        },
        audio(_, args) {
            return {
                lang: args.lang,
                text: args.query
            };
        }
    },
    Translation: {
        async target(parent) {
            const { source, target } = parent;
            const { translationRes } = await googleScrape(source.lang, target.lang, source.text);
            return {
                lang: target.lang,
                text: translationRes
            };
        }
    },
    Entry: {
        async audio(parent) {
            const { lang, text } = parent;
            return await textToSpeechScrape(lang, text);
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

    return req.method !== "OPTIONS"
        ? apolloHandler(req, res)
        : res.end();
};

export default handler;
