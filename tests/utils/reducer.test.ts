import faker from "faker";
import langReducer, { Actions, initialState } from "@utils/reducer";

it("changes a field value", () => {
    const query = faker.random.words();

    const res = langReducer(initialState, {
        type: Actions.SET_FIELD,
        payload: {
            key: "query",
            value: query
        }
    });
    expect(res).toStrictEqual({ ...initialState, query });
});

it("changes all fields", () => {
    const query = faker.random.words();
    const state = {
        source: "zh",
        target: "zh_HANT",
        query,
        delayedQuery: query,
        translation: faker.random.words(),
        isLoading: faker.datatype.boolean()
    } as const;

    const res = langReducer(initialState, {
        type: Actions.SET_ALL,
        payload: { state }
    });
    expect(res).toStrictEqual(state);
});

it("switches target on source change", () => {
    const state = {
        ...initialState,
        source: "es",
        target: "ca"
    } as const;

    const res = langReducer(state, {
        type: Actions.SET_FIELD,
        payload: {
            key: "source",
            value: state.target
        }
    });
    expect(res.source).toStrictEqual(state.target);
    expect(res.target).toStrictEqual(state.source);
});

it("switches the languages & the translations", () => {
    const state = {
        ...initialState,
        source: "es",
        target: "ca",
        query: faker.random.words(),
        translation: faker.random.words()
    } as const;

    const res = langReducer(state, { type: Actions.SWITCH_LANGS });
    expect(res).toStrictEqual({
        source: state.target,
        target: state.source,
        query: state.translation,
        delayedQuery: state.translation,
        translation: state.query,
        isLoading: initialState.isLoading
    });
});

it("resets the source while switching if they're the same", () => {
    const state = {
        ...initialState,
        source: "eo",
        target: "eo"
    } as const;

    const res = langReducer(state, { type: Actions.SWITCH_LANGS });
    expect(res.source).toStrictEqual(initialState.source);
    expect(res.target).toStrictEqual(state.source);
});
