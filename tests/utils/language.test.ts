import faker from "faker";
import { replaceBoth, retrieveFiltered } from "../../utils/language";
import { languages, exceptions, mappings } from "../../utils/languages.json";

describe("replaceBoth", () => {
    it("replaces excepted sources correctly", () => {
        Object.entries(exceptions.source).forEach(([code, replacement]) => {
            const { source } = replaceBoth("exception", { source: code, target: "" })
            expect(source).toBe(replacement);
        });
    });

    it("replaces excepted targets correctly", () => {
        Object.entries(exceptions.target).forEach(([code, replacement]) => {
            const { target } = replaceBoth("exception", { source: "", target: code })
            expect(target).toBe(replacement);
        });
    });

    it("replaces mapped sources correctly", () => {
        Object.entries(mappings.source).forEach(([code, replacement]) => {
            const { source } = replaceBoth("mapping", { source: code, target: "" })
            expect(source).toBe(replacement);
        });
    });

    it("replaces mapped targets correctly", () => {
        Object.entries(mappings.target).forEach(([code, replacement]) => {
            const { target } = replaceBoth("mapping", { source: "", target: code })
            expect(target).toBe(replacement);
        });
    });
});

describe("retrieveFiltered", () => {
    it("filters by exceptions & by opposite values", () => {
        const source = faker.random.locale();
        const target = faker.random.locale();
        const sourceKeys = Object.keys(languages).filter(code => !Object.keys(exceptions.source).includes(code) && code !== target);
        const targetKeys = Object.keys(languages).filter(code => !Object.keys(exceptions.target).includes(code) && code !== source);

        const { sourceLangs, targetLangs } = retrieveFiltered(source, target);
        expect(sourceLangs.map(([code]) => code)).toStrictEqual(sourceKeys);
        expect(targetLangs.map(([code]) => code)).toStrictEqual(targetKeys);
    });
});
