import { replaceExceptedCode, isValidCode, LanguageType, LangCode } from "lingva-scraper";

const defaultSourceLang = process.env["NEXT_PUBLIC_DEFAULT_SOURCE_LANG"];
const defaultTargetLang = process.env["NEXT_PUBLIC_DEFAULT_TARGET_LANG"];

export type State = {
    source: LangCode<"source">,
    target: LangCode<"target">,
    query: string,
    delayedQuery: string,
    translation: string,
    isLoading: boolean,
    pronunciation: {
        query?: string,
        translation?: string
    },
    audio: {
        query?: number[],
        translation?: number[]
    }
}

export const initialState: State = {
    source: isValidCode(defaultSourceLang, LanguageType.SOURCE) ? defaultSourceLang : "auto",
    target: isValidCode(defaultTargetLang, LanguageType.TARGET) ? defaultTargetLang : "en",
    query: "",
    delayedQuery: "",
    translation: "",
    isLoading: true,
    pronunciation: {},
    audio: {}
}

export enum Actions {
    SET_FIELD,
    SET_SOURCE,
    SET_TARGET,
    SET_ALL,
    SWITCH_LANGS
}

type Action<T extends keyof State = keyof State> = {
    type: Actions.SET_FIELD,
    payload: {
        key: T,
        value: State[T]
    }
} | {
    type: Actions.SET_SOURCE | Actions.SET_TARGET,
    payload: {
        code: string
    }
} | {
    type: Actions.SET_ALL,
    payload: {
        state: State
    }
} | {
    type: Actions.SWITCH_LANGS,
    payload: {
        detectedSource?: LangCode<"source">
    }
}

export default function reducer(state: State, action: Action): State {
    switch (action.type) {
        case Actions.SET_FIELD: {
            const { key, value } = action.payload;
            return { ...state, [key]: value };
        }
        case Actions.SET_SOURCE: {
            const { code } = action.payload;
            if (!isValidCode(code, LanguageType.SOURCE))
                return state;

            if (code !== state.target)
                return { ...state, source: code };

            const sourceAsTarget = replaceExceptedCode(LanguageType.TARGET, state.source);
            return {
                ...state,
                source: code,
                target: sourceAsTarget !== code
                    ? sourceAsTarget
                    : "eo"
            };
        }
        case Actions.SET_TARGET: {
            const { code } = action.payload;
            if (!isValidCode(code, LanguageType.TARGET))
                return state;

            if (code !== state.source)
                return { ...state, target: code };

            const targetAsSource = replaceExceptedCode(LanguageType.SOURCE, state.target);
            return {
                ...state,
                target: code,
                source: targetAsSource !== code
                    ? targetAsSource
                    : "auto"
            };
        }
        case Actions.SET_ALL: {
            return { ...state, ...action.payload.state };
        }
        case Actions.SWITCH_LANGS: {
            const { detectedSource } = action.payload;

            const newTarget = state.source === "auto" && detectedSource
                ? detectedSource
                : state.source;
            const parsedNewTarget = replaceExceptedCode(LanguageType.TARGET, newTarget);

            const parsedNewSource = parsedNewTarget === state.target
                ? initialState.source
                : replaceExceptedCode(LanguageType.SOURCE, state.target);

            return {
                ...state,
                source: parsedNewSource,
                target: parsedNewTarget,
                query: state.translation,
                delayedQuery: state.translation,
                translation: state.query,
                pronunciation: {
                    query: state.pronunciation.translation,
                    translation: state.pronunciation.query
                },
                audio: {
                    query: state.audio.translation,
                    translation: state.audio.query
                }
            };
        }
        default:
            return state;
    }
}
