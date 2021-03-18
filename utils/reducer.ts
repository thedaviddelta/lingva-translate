import { replaceBoth } from "./language";

export const initialState = {
    source: "auto",
    target: "en",
    query: "",
    delayedQuery: "",
    translation: ""
}

type State = typeof initialState;

export enum Actions {
    SET_FIELD,
    SET_ALL,
    SWITCH_LANGS
}

type Action = {
    type: Actions.SET_FIELD,
    payload: {
        key: string,
        value: string
    }
} | {
    type: Actions.SET_ALL,
    payload: {
        state: State
    }
} | {
    type: Actions.SWITCH_LANGS
}

export default function reducer(state: State, action: Action) {
    switch (action.type) {
        case Actions.SET_FIELD:
            const { key, value } = action.payload;
            return { ...state, [key]: value };
        case Actions.SET_ALL:
            return { ...state, ...action.payload.state };
        case Actions.SWITCH_LANGS:
            const { source, target } = replaceBoth("exception", {
                source: state.target,
                target: state.source
            });
            return {
                ...state,
                source: source !== target
                    ? source
                    : initialState.source,
                target,
                query: state.translation,
                delayedQuery: state.translation,
                translation: ""
            };
        default:
            return state;
    }
}
