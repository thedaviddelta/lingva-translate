import { useEffect, useReducer, FC, ChangeEvent } from "react";
import { GetStaticPaths, GetStaticProps, InferGetStaticPropsType } from "next";
import Router from "next/router";
import { Stack, VStack, HStack, IconButton } from "@chakra-ui/react";
import { FaExchangeAlt } from "react-icons/fa";
import { Layout, LangSelect, TranslationArea } from "../components";
import { useToastOnLoad } from "../hooks";
import { googleScrape, extractSlug, textToSpeechScrape } from "../utils/translate";
import { retrieveFiltered, replaceBoth } from "../utils/language";
import langReducer, { Actions, initialState } from "../utils/reducer";

const Page: FC<InferGetStaticPropsType<typeof getStaticProps>> = ({ home, translationRes, audio, errorMsg, initial }) => {
    const [{ source, target, query, delayedQuery, translation }, dispatch] = useReducer(langReducer, initialState);

    const handleChange = (e: ChangeEvent<HTMLTextAreaElement | HTMLSelectElement>) => {
        dispatch({
            type: Actions.SET_FIELD,
            payload: {
                key: e.target.id,
                value: e.target.value
            }
        });
    };

    useEffect(() => {
        const state = { ...initial, delayedQuery: initial?.query, translation: translationRes };
        initial && dispatch({ type: Actions.SET_ALL, payload: { state }});
    }, [initial, translationRes]);

    useEffect(() => {
        const timeout = setTimeout(() =>
            dispatch({ type: Actions.SET_FIELD, payload: { key: "delayedQuery", value: query }}
        ), 1000);
        return () => clearTimeout(timeout);
    }, [query]);

    useEffect(() => {
        if (!delayedQuery || delayedQuery === initialState.query)
            return;
        if (!home && !initial)
            return;
        if (!home && delayedQuery === initial.query && source === initial.source && target === initial.target)
            return;

        Router.push(`/${source}/${target}/${encodeURIComponent(delayedQuery)}`);
    }, [source, target, delayedQuery, initial, home]);

    const { sourceLangs, targetLangs } = retrieveFiltered(source, target);
    const { source: transLang, target: queryLang } = replaceBoth("exception", { source: target, target: source });

    useToastOnLoad({
        title: "Unexpected error",
        description: errorMsg,
        status: "error",
        updateDeps: initial
    });

    return (
        <Layout home={home}>
            <VStack px={[8, null, 24, 40]} w="full">
                <HStack px={[1, null, 3, 4]} w="full">
                    <LangSelect
                        id="source"
                        aria-label="Source language"
                        value={source}
                        onChange={handleChange}
                        langs={sourceLangs}
                    />
                    <IconButton
                        aria-label="Switch languages"
                        icon={<FaExchangeAlt />}
                        colorScheme="lingva"
                        variant="ghost"
                        onClick={() => dispatch({ type: Actions.SWITCH_LANGS })}
                        isDisabled={source === "auto"}
                    />
                    <LangSelect
                        id="target"
                        aria-label="Target language"
                        value={target}
                        onChange={handleChange}
                        langs={targetLangs}
                    />
                </HStack>
                <Stack direction={["column", null, "row"]} w="full">
                    <TranslationArea
                        id="query"
                        aria-label="Translation query"
                        placeholder="Text"
                        value={query}
                        onChange={handleChange}
                        lang={queryLang}
                        audio={audio?.source}
                    />
                    <TranslationArea
                        id="translation"
                        aria-label="Translation result"
                        placeholder="Translation"
                        value={translation ?? ""}
                        readOnly={true}
                        lang={transLang}
                        audio={audio?.target}
                        canCopy={true}
                    />
                </Stack>
            </VStack>
        </Layout>
    );
}

export default Page;

export const getStaticPaths: GetStaticPaths = async () => ({
    paths: [
        {
            params: { slug: [] }
        }
    ],
    fallback: true
});

export const getStaticProps: GetStaticProps = async ({ params }) => {
    if (!params?.slug || !Array.isArray(params.slug))
        return {
            props: { home: true }
        };

    const { source, target, query } = extractSlug(params.slug);

    if (!query)
        return {
            notFound: true
        };

    if (!source || !target)
        return {
            redirect: {
                destination: `/${source ?? "auto"}/${target ?? "en"}/${query}`,
                permanent: true
            }
        }

    const textScrape = await googleScrape(source, target, query);

    const [sourceAudio, targetAudio] = await Promise.all([
        textToSpeechScrape(source, query),
        textToSpeechScrape(target, textScrape.translationRes)
    ]);

    return {
        props: {
            ...textScrape,
            audio: {
                source: sourceAudio,
                target: targetAudio
            },
            initial: {
                source, target, query
            }
        },
        revalidate: !textScrape.errorMsg
            ? 2 * 30 * 24 * 60 * 60 // 2 months
            : 1
    };
}
