import { useEffect, useReducer, useCallback, FC, ChangeEvent } from "react";
import { GetStaticPaths, GetStaticProps, InferGetStaticPropsType } from "next";
import Router from "next/router";
import dynamic from "next/dynamic";
import { Stack, VStack, HStack, IconButton } from "@chakra-ui/react";
import { FaExchangeAlt } from "react-icons/fa";
import { HiTranslate } from "react-icons/hi";
import { useHotkeys } from "react-hotkeys-hook";
import { CustomHead, LangSelect, TranslationArea } from "@components";
import { useToastOnLoad } from "@hooks";
import { googleScrape, extractSlug, textToSpeechScrape } from "@utils/translate";
import { retrieveFromType, replaceBoth, isValid } from "@utils/language";
import langReducer, { Actions, initialState } from "@utils/reducer";
import { localGetItem, localSetItem } from "@utils/storage";

const AutoTranslateButton = dynamic(() => import("@components/AutoTranslateButton"), { ssr: false });

const Page: FC<InferGetStaticPropsType<typeof getStaticProps>> = ({ home, translationRes, audio, errorMsg, initial }) => {
    const [{ source, target, query, delayedQuery, translation, isLoading }, dispatch] = useReducer(langReducer, initialState);

    const handleChange = (e: ChangeEvent<HTMLTextAreaElement | HTMLSelectElement>) => {
        dispatch({
            type: Actions.SET_FIELD,
            payload: {
                key: e.target.id,
                value: e.target.value
            }
        });
    };

    const changeRoute = useCallback((customQuery: string) => {
        if (isLoading)
            return;
        if (!customQuery || customQuery === initialState.query)
            return;
        if (!home && !initial)
            return;
        if (!home && customQuery === initial.query && source === initial.source && target === initial.target)
            return;

        localSetItem("source", source);
        localSetItem("target", target);

        dispatch({ type: Actions.SET_FIELD, payload: { key: "isLoading", value: true }});
        Router.push(`/${source}/${target}/${encodeURIComponent(customQuery)}`);
    }, [isLoading, source, target, home, initial]);

    useEffect(() => {
        if (home) {
            const localSource = localGetItem("source");
            const localTarget = localGetItem("target");
            return dispatch({
                type: Actions.SET_ALL,
                payload: {
                    state: {
                        ...initialState,
                        source: isValid(localSource) ? localSource : initialState.source,
                        target: isValid(localTarget) ? localTarget : initialState.target,
                        isLoading: false
                    }
                }
            });
        }

        if (!initial)
            return;

        dispatch({
            type: Actions.SET_ALL,
            payload: {
                state: {
                    ...initial,
                    delayedQuery: initial.query,
                    translation: translationRes,
                    isLoading: false
                }
            }
        });
    }, [initial, translationRes, home]);

    useEffect(() => {
        const timeout = setTimeout(() =>
            dispatch({ type: Actions.SET_FIELD, payload: { key: "delayedQuery", value: query }}
        ), 1000);
        return () => clearTimeout(timeout);
    }, [query]);

    useEffect(() => {
        const handler = (url: string) => {
            url === Router.asPath || dispatch({ type: Actions.SET_FIELD, payload: { key: "isLoading", value: true }});

            if (url !== "/")
                return;
            dispatch({ type: Actions.SET_FIELD, payload: { key: "source", value: initialState.source }});
            localSetItem("source", initialState.source);
            dispatch({ type: Actions.SET_FIELD, payload: { key: "target", value: initialState.target }});
            localSetItem("target", initialState.target);
        };
        Router.events.on("beforeHistoryChange", handler);
        return () => Router.events.off("beforeHistoryChange", handler);
    }, []);

    const sourceLangs = retrieveFromType("source");
    const targetLangs = retrieveFromType("target");
    const { source: transLang, target: queryLang } = replaceBoth("exception", { source: target, target: source });

    useToastOnLoad({
        title: "Unexpected error",
        description: errorMsg,
        status: "error",
        updateDeps: initial
    });

    const canSwitch = source !== "auto" && !isLoading;

    useHotkeys("ctrl+shift+s, command+shift+s, ctrl+shift+f, command+shift+f", () => (
        canSwitch && dispatch({ type: Actions.SWITCH_LANGS })
    ), [canSwitch]);

    return (
        <>
            <CustomHead home={home} />

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
                        isDisabled={!canSwitch}
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
                        onChange={e => isLoading || handleChange(e)}
                        onSubmit={useCallback(() => changeRoute(query), [query, changeRoute])}
                        lang={queryLang}
                        audio={audio?.source}
                    />
                    <Stack direction={["row", null, "column"]} justify="center" spacing={3} px={[2, null, "initial"]}>
                        <IconButton
                            aria-label="Translate"
                            icon={<HiTranslate />}
                            colorScheme="lingva"
                            variant="outline"
                            onClick={() => changeRoute(query)}
                            isDisabled={isLoading}
                            w={["full", null, "auto"]}
                        />
                        <AutoTranslateButton
                            onAuto={useCallback(() => changeRoute(delayedQuery), [delayedQuery, changeRoute])}
                            isDisabled={isLoading}
                            w={["full", null, "auto"]}
                        />
                    </Stack>
                    <TranslationArea
                        id="translation"
                        aria-label="Translation result"
                        placeholder="Translation"
                        value={translation ?? ""}
                        readOnly={true}
                        lang={transLang}
                        audio={audio?.target}
                        canCopy={true}
                        isLoading={isLoading}
                    />
                </Stack>
            </VStack>
        </>
    );
};

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

    if (!isValid(source) || !isValid(target))
        return {
            notFound: true
        };

    const textScrape = await googleScrape(source, target, query);

    const [sourceAudio, targetAudio] = await Promise.all([
        textToSpeechScrape(source, query),
        "translationRes" in textScrape
            ? textToSpeechScrape(target, textScrape.translationRes)
            : null
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
        revalidate: !("errorMsg" in textScrape)
            ? 2 * 30 * 24 * 60 * 60 // 2 months
            : 1
    };
};
