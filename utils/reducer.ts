import { replaceBoth, isValid, LangCode } from "./language";

const defaultSourceLang = process.env["NEXT_PUBLIC_DEFAULT_SOURCE_LANG"];
const defaultTargetLang = process.env["NEXT_PUBLIC_DEFAULT_TARGET_LANG"];

type State = {
    source: LangCode,
    target: LangCode,
    query: string,
    delayedQuery: string,
    translation: string,
    isLoading: boolean
}

export const initialState: State = {
    source: isValid(defaultSourceLang) ? defaultSourceLang : "auto",
    target: isValid(defaultTargetLang) ? defaultTargetLang : "en",
    query: "",
    delayedQuery: "",
    translation: "",
    isLoading: true
}

export enum Actions {
    SET_FIELD,
    SET_ALL,
    SWITCH_LANGS
}

type Action = {
    type: Actions.SET_FIELD,
    payload: {
        key: string,
        value: any
    }
} | {
    type: Actions.SET_ALL,
    payload: {
        state: State
    }
} | {
    type: Actions.SWITCH_LANGS
}

export default function reducer(state: State, action: Action): State {
    const { source, target } = replaceBoth("exception", {
        source: state.target,
        target: state.source
    });

    switch (action.type) {
        case Actions.SET_FIELD:
            const { key, value } = action.payload;
            if (key === "source" && value === state.target)
                return { ...state, [key]: value, target: target !== value ? target : "eo" };
            if (key === "target" && value === state.source)
                return { ...state, [key]: value, source };
            return { ...state, [key]: value };
        case Actions.SET_ALL:
            return { ...state, ...action.payload.state };
        case Actions.SWITCH_LANGS:
            return {
                ...state,
                source: source !== target
                    ? source
                    : initialState.source,
                target,
                query: state.translation,
                delayedQuery: state.translation,
                translation: state.query
            };
        default:
            return state;
    }
}
