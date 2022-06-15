import { ApolloServer, gql, IResolvers, ApolloError, UserInputError } from "apollo-server-micro";
import { NextApiHandler } from "next";
import NextCors from "nextjs-cors";
import {
    getTranslationInfo,
    getTranslationText,
    getAudio,
    replaceExceptedCode,
    isValidCode,
    LanguageType,
    languageList,
    LangCode
} from "lingva-scraper";

export const typeDefs = gql`
    enum LangType {
        SOURCE,
        TARGET
    }
    type Query {
        translation(source: String="auto" target: String="en" query: String!): Translation!
        audio(lang: String! query: String!): AudioEntry!
        languages(type: LangType): [Language]!
    }
    type Translation {
        source: SourceEntry!
        target: TargetEntry!
    }
    type SourceEntry {
        lang: Language!
        text: String!
        audio: [Int]!
        detected: Language
        typo: String
        pronunciation: String
        definitions: [DefinitionsGroup]
        examples: [String]
        similar: [String]
    }
    type TargetEntry {
        lang: Language!
        text: String!
        audio: [Int]!
        pronunciation: String
        extraTranslations: [ExtraTranslationsGroup]
    }
    type AudioEntry {
        lang: Language!
        text: String!
        audio: [Int]!
    }
    type Language {
        code: String!
        name: String!
    }
    type DefinitionsGroup {
        type: String!
        list: [DefinitionList]!
    }
    type DefinitionList {
        definition: String!
        example: String!
        field: String
        synonyms: [String]
    }
    type ExtraTranslationsGroup {
        type: String!
        list: [ExtraTranslationList]!
    }
    type ExtraTranslationList {
        word: String!
        article: String
        frequency: Int!
        meanings: [String]
    }
`;

export const resolvers: IResolvers = {
    Query: {
        async translation(_, args) {
            const { source, target, query } = args;

            if (!isValidCode(source, LanguageType.SOURCE) || !isValidCode(target, LanguageType.TARGET))
                throw new UserInputError("Invalid language code");

            const translation = await getTranslationText(source, target, query);
            if (!translation)
                throw new ApolloError("An error occurred while retrieving the translation");

            const info = await getTranslationInfo(source, target, query);
            return {
                source: {
                    lang: {
                        code: source
                    },
                    text: query,
                    detected: info?.detectedSource && {
                        code: info.detectedSource
                    },
                    typo: info?.typo,
                    pronunciation: info?.pronunciation.query,
                    definitions: info?.definitions,
                    examples: info?.examples,
                    similar: info?.similar
                },
                target: {
                    lang: {
                        code: target
                    },
                    text: translation,
                    pronunciation: info?.pronunciation.translation,
                    extraTranslations: info?.extraTranslations
                }
            };
        },
        audio(_, args) {
            const { lang, query } = args;

            if (!isValidCode(lang))
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
            const lowerType = type?.toLocaleLowerCase() as typeof LanguageType[keyof typeof LanguageType] | undefined;
            const langEntries = Object.entries(languageList[lowerType ?? "all"]);
            return langEntries.map(([code, name]) => ({ code, name }));
        }
    },
    ...(["SourceEntry", "TargetEntry", "AudioEntry"].reduce((acc, key) => ({
        ...acc,
        [key]: {
            async audio(parent) {
                const { lang, text } = parent;
                const parsedLang = replaceExceptedCode(LanguageType.TARGET, lang.code);
                const audio = await getAudio(parsedLang, text);
                if (!audio)
                    throw new ApolloError("An error occurred while retrieving the audio");
                return audio;
            }
        }
    }), {} as IResolvers)),
    Language: {
        name(parent) {
            const { code, name } = parent;
            return name || languageList.all[code as LangCode];
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
