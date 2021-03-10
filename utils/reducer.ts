export enum Actions {
    "SET_FIELD",
    "SET_ALL"
}

export const initialState = {
    source: "auto",
    target: "en",
    query: ""
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
        state: {
            [key: string]: string
        }
    }
}

export default function reducer(state: typeof initialState, action: Action) {
    switch (action.type) {
        case Actions.SET_FIELD:
            const { key, value } = action.payload;
            return { ...state, [key]: value };
        case Actions.SET_ALL:
            return { ...state, ...action.payload.state };
        default:
            return state;
    }
}
