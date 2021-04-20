import { replaceBoth, retrieveFiltered, CheckType, LangType } from "../../utils/language";
import { languages, exceptions, mappings } from "../../utils/languages.json";

describe("replaceBoth", () => {
    const testReplacer = (
        checkType: CheckType,
        checkObj: {
            [key in LangType]: {
                [key: string]: string
            }
        },
        langType: LangType
    ) => (
        Object.entries(checkObj[langType]).forEach(([code, replacement]) => {
            const res = replaceBoth(checkType, { source: "", target: "", [langType]: code })
            expect(res[langType]).toBe(replacement);
        })
    );

    it("replaces excepted sources correctly", () => {
        testReplacer("exception", exceptions, "source");
    });

    it("replaces excepted targets correctly", () => {
        testReplacer("exception", exceptions, "target");
    });

    it("replaces mapped sources correctly", () => {
        testReplacer("mapping", mappings, "source");
    });

    it("replaces mapped targets correctly", () => {
        testReplacer("mapping", mappings, "target");
    });
});

describe("retrieveFiltered", () => {
    const filteredEntries = (langType: LangType) => (
        Object.entries(languages).filter(([code]) => !Object.keys(exceptions[langType]).includes(code))
    );

    it("filters by exceptions", () => {
        const { sourceLangs, targetLangs } = retrieveFiltered();
        expect(sourceLangs).toStrictEqual(filteredEntries("source"));
        expect(targetLangs).toStrictEqual(filteredEntries("target"));
    });
});
