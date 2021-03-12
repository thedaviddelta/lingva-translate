import faker from "faker";
import langReducer, { Actions, initialState } from "../../utils/reducer";

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
    const state = {
        source: faker.random.locale(),
        target: faker.random.locale(),
        query: faker.random.words()
    };

    const res = langReducer(initialState, {
        type: Actions.SET_ALL,
        payload: { state }
    });
    expect(res).toStrictEqual(state);
});

it("switches the languages", () => {
    const state = {
        ...initialState,
        source: "es",
        target: "ca"
    };

    const res = langReducer(state, { type: Actions.SWITCH_LANGS });
    expect(res.source).toStrictEqual(state.target);
    expect(res.target).toStrictEqual(state.source);
});

it("resets the source while switching if they're the same", () => {
    const state = {
        ...initialState,
        source: "eo",
        target: "eo"
    };

    const res = langReducer(state, { type: Actions.SWITCH_LANGS });
    expect(res.source).toStrictEqual(initialState.source);
    expect(res.target).toStrictEqual(state.source);
});
