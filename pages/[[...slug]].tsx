import { useState, useEffect, useReducer, FC, ChangeEvent } from "react";
import { GetStaticPaths, GetStaticProps, InferGetStaticPropsType } from "next";
import Head from "next/head";
import Router from "next/router";
import Error from "next/error";
import { Stack, VStack, HStack, IconButton } from "@chakra-ui/react";
import { FaExchangeAlt } from "react-icons/fa";
import { Header, Footer, LangSelect, TranslationArea } from "../components";
import { googleScrape, extractSlug } from "../utils/translate";
import { retrieveFiltered } from "../utils/language";
import langReducer, { Actions, initialState } from "../utils/reducer";

const Page: FC<InferGetStaticPropsType<typeof getStaticProps>> = ({ translation, statusCode, errorMsg, initial }) => {
    const [{ source, target, query }, dispatch] = useReducer(langReducer, initialState);
    const [delayedQuery, setDelayedQuery] = useState(initialState.query);

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
        initial && dispatch({ type: Actions.SET_ALL, payload: { state: initial }});
    }, [initial]);

    useEffect(() => {
        const timeout = setTimeout(() => setDelayedQuery(query), 1000);
        return () => clearTimeout(timeout);
    }, [query]);

    useEffect(() => {
        const queryIsEmpty = !delayedQuery || delayedQuery === initialState.query;
        const queryIsInitial = delayedQuery === initial?.query;
        const sourceIsInitial = source === initialState.source || source === initial?.source;
        const targetIsInitial = target === initialState.target || source === initial?.target;
        const allAreInitials = queryIsInitial && sourceIsInitial && targetIsInitial;

        queryIsEmpty || allAreInitials || Router.push(`/${source}/${target}/${encodeURIComponent(delayedQuery)}`);
    }, [source, target, delayedQuery, initial]);

    const { sourceLangs, targetLangs } = retrieveFiltered(source, target);

    return statusCode ? (
        <Error statusCode={statusCode} />
    ) : (
        <>
            <Head>
                <title>Lingva Translate</title>
                <link rel="icon" href="/favicon.svg" />
            </Head>

            <VStack minH="100vh" spacing={8}>
                <Header />
                <VStack px={[8, null, 24, 40]} flexGrow={1} w="full">
                    <HStack w="full">
                        <LangSelect
                            id="source"
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
                            value={target}
                            onChange={handleChange}
                            langs={targetLangs}
                        />
                    </HStack>
                    <Stack direction={["column", null, "row"]} w="full">
                        <TranslationArea
                            id="query"
                            placeholder="Text"
                            value={query}
                            onChange={handleChange}
                        />
                        <TranslationArea
                            id="translation"
                            placeholder="Translation"
                            value={translation}
                            readOnly={true}
                        />
                    </Stack>
                </VStack>
                <Footer />
            </VStack>
        </>
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
            props: {}
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

    return {
        props: {
            ...await googleScrape(source, target, query),
            initial: {
                source, target, query
            }
        },
        revalidate: 2 * 30 * 24 * 60 * 60 // 2 months
    };
}
