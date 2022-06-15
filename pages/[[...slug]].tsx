import { useCallback, useEffect, useReducer } from "react";
import { GetStaticPaths, GetStaticProps, NextPage } from "next";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import {
    getTranslationInfo,
    getTranslationText,
    getAudio,
    languageList,
    LanguageType,
    replaceExceptedCode,
    isValidCode,
    TranslationInfo,
    LangCode
} from "lingva-scraper";
import { HStack, IconButton, Stack, VStack } from "@chakra-ui/react";
import { FaExchangeAlt } from "react-icons/fa";
import { HiTranslate } from "react-icons/hi";
import { useHotkeys } from "react-hotkeys-hook";
import { CustomHead, LangSelect, TranslationArea } from "@components";
import { useToastOnLoad } from "@hooks";
import { extractSlug } from "@utils/slug";
import langReducer, { Actions, initialState, State } from "@utils/reducer";
import { localGetItem, localSetItem } from "@utils/storage";

const AutoTranslateButton = dynamic(() => import("@components/AutoTranslateButton"), { ssr: false });

export enum ResponseType {
    SUCCESS,
    ERROR,
    HOME
}

type Props = {
    type: ResponseType.SUCCESS,
    translation: string,
    info: TranslationInfo | null,
    audio: {
        query: number[] | null,
        translation: number[] | null
    },
    initial: {
        source: LangCode<"source">,
        target: LangCode<"target">,
        query: string
    }
} | {
    type: ResponseType.ERROR,
    errorMsg: string,
    initial: {
        source: LangCode<"source">,
        target: LangCode<"target">,
        query: string
    }
} | {
    type: ResponseType.HOME
};

const Page: NextPage<Props> = (props) => {
    const [
        { source, target, query, delayedQuery, translation, isLoading, pronunciation, audio },
        dispatch
    ] = useReducer(langReducer, initialState);

    const router = useRouter();

    const setField = useCallback(<T extends keyof State,>(key: T, value: State[T]) => (
        dispatch({ type: Actions.SET_FIELD, payload: { key, value }})
    ), []);

    const setAllFields = useCallback((state: State) => (
        dispatch({ type: Actions.SET_ALL, payload: { state }})
    ), []);

    const setLanguage = useCallback((type: typeof LanguageType[keyof typeof LanguageType], code: string) => (
        dispatch({
            type: type === LanguageType.SOURCE
                ? Actions.SET_SOURCE
                : Actions.SET_TARGET,
            payload: { code }
        })
    ), []);

    const switchLanguages = useCallback((detectedSource?: LangCode<"source">) => (
        dispatch({ type: Actions.SWITCH_LANGS, payload: { detectedSource } })
    ), []);

    const changeRoute = useCallback((customQuery: string) => {
        if (isLoading || router.isFallback)
            return;
        if (!customQuery || customQuery === initialState.query)
            return;
        if (props.type === ResponseType.SUCCESS && customQuery === props.initial.query
         && source === props.initial.source && target === props.initial.target)
            return;

        localSetItem(LanguageType.SOURCE, source);
        localSetItem(LanguageType.TARGET, target);

        setField("isLoading", true);
        router.push(`/${source}/${target}/${encodeURIComponent(customQuery)}`);
    }, [isLoading, source, target, props, router, setField]);

    useEffect(() => {
        if (router.isFallback)
            return;

        if (props.type === ResponseType.HOME) {
            const localSource = localGetItem(LanguageType.SOURCE);
            const localTarget = localGetItem(LanguageType.TARGET);

            return setAllFields({
                ...initialState,
                source: isValidCode(localSource, LanguageType.SOURCE)
                    ? localSource
                    : initialState.source,
                target: isValidCode(localTarget, LanguageType.TARGET)
                    ? localTarget
                    : initialState.target,
                isLoading: false
            });
        }

        if (props.type === ResponseType.ERROR)
            return setAllFields({
                ...initialState,
                ...props.initial,
                delayedQuery: props.initial.query,
                isLoading: false
            });

        setAllFields({
            ...props.initial,
            delayedQuery: props.initial.query,
            translation: props.translation,
            isLoading: false,
            pronunciation: props.info?.pronunciation ?? {},
            audio: {
                query: props.audio.query ?? undefined,
                translation: props.audio.translation ?? undefined
            }
        });
    }, [props, router, setAllFields]);

    useEffect(() => {
        const timeoutId = setTimeout(() => setField("delayedQuery", query), 1000);
        return () => clearTimeout(timeoutId);
    }, [query, setField]);

    useEffect(() => {
        const handler = (url: string) => {
            url === router.asPath || setField("isLoading", true);

            if (url !== "/")
                return;
            setLanguage(LanguageType.SOURCE, initialState.source);
            localSetItem(LanguageType.SOURCE, initialState.source);
            setLanguage(LanguageType.TARGET, initialState.target);
            localSetItem(LanguageType.TARGET, initialState.target);
        };
        router.events.on("beforeHistoryChange", handler);
        return () => router.events.off("beforeHistoryChange", handler);
    }, [router, setLanguage, setField]);

    useToastOnLoad({
        status: "error",
        title: "Unexpected error",
        description: props.type === ResponseType.ERROR ? props.errorMsg : undefined,
        updateDeps: props.type === ResponseType.ERROR ? props.initial : undefined
    });

    const detectedSource = props.type === ResponseType.SUCCESS ? props.info?.detectedSource : undefined;

    const canSwitch = !isLoading && (source !== "auto" || !!detectedSource);

    useHotkeys("ctrl+shift+s, command+shift+s, ctrl+shift+f, command+shift+f", () => (
        canSwitch && switchLanguages(detectedSource)
    ), [canSwitch, detectedSource, switchLanguages]);

    // parse existing code with opposite exceptions in order to flatten to the standards
    const queryLang = source === "auto" && !!detectedSource
        ? detectedSource
        : replaceExceptedCode(LanguageType.TARGET, source);
    const transLang = replaceExceptedCode(LanguageType.SOURCE, target);

    return (
        <>
            <CustomHead home={props.type === ResponseType.HOME} />

            <VStack px={[8, null, 24, 40]} w="full">
                <HStack px={[1, null, 3, 4]} w="full">
                    <LangSelect
                        id="source"
                        aria-label="Source language"
                        value={source}
                        detectedSource={detectedSource}
                        onChange={e => setLanguage(LanguageType.SOURCE, e.target.value)}
                        langs={languageList.source}
                    />
                    <IconButton
                        aria-label="Switch languages"
                        icon={<FaExchangeAlt />}
                        colorScheme="lingva"
                        variant="ghost"
                        onClick={() => switchLanguages(detectedSource)}
                        isDisabled={!canSwitch}
                    />
                    <LangSelect
                        id="target"
                        aria-label="Target language"
                        value={target}
                        onChange={e => setLanguage(LanguageType.TARGET, e.target.value)}
                        langs={languageList.target}
                    />
                </HStack>
                <Stack direction={["column", null, "row"]} w="full">
                    <TranslationArea
                        id="query"
                        aria-label="Translation query"
                        placeholder="Text"
                        value={query}
                        onChange={e => isLoading || setField("query", e.target.value)}
                        onSubmit={() => changeRoute(query)}
                        lang={queryLang}
                        audio={audio.query}
                        pronunciation={pronunciation.query}
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
                            isDisabled={isLoading}
                            // runs on effect update
                            onAuto={useCallback(() => changeRoute(delayedQuery), [delayedQuery, changeRoute])}
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
                        audio={audio.translation}
                        canCopy={true}
                        isLoading={isLoading}
                        pronunciation={pronunciation.translation}
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

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
    if (!params?.slug || !Array.isArray(params.slug))
        return {
            props: {
                type: ResponseType.HOME
            }
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
        };

    if (!isValidCode(source, LanguageType.SOURCE) || !isValidCode(target, LanguageType.TARGET))
        return {
            notFound: true
        };

    const initial = { source, target, query };

    const translation = await getTranslationText(source, target, query);

    if (!translation)
        return {
            props: {
                type: ResponseType.ERROR,
                errorMsg: "An error occurred while retrieving the translation",
                initial
            },
            revalidate: 1
        };

    const info = await getTranslationInfo(source, target, query);

    const audioSource = source === "auto" && info?.detectedSource
        ? info.detectedSource
        : source;
    const parsedAudioSource = replaceExceptedCode(LanguageType.TARGET, audioSource);

    const [audioQuery, audioTranslation] = await Promise.all([
        getAudio(parsedAudioSource, query),
        getAudio(target, translation)
    ]);

    const audio = {
        query: audioQuery,
        translation: audioTranslation
    };

    return {
        props: {
            type: ResponseType.SUCCESS,
            translation,
            info,
            audio,
            initial
        },
        revalidate: 2 * 30 * 24 * 60 * 60 // 2 months
    };
};
