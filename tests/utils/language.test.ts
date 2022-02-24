import faker from "faker";
import { replaceBoth, retrieveFromType, getName, CheckType, LangType } from "@utils/language";
import { languages, exceptions, mappings } from "@utils/languages.json";

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
            const res = replaceBoth(checkType, { source: "auto", target: "en", [langType]: code })
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

describe("retrieveFromType", () => {
    const checkExceptions = (langType: LangType) => (
        retrieveFromType(langType).forEach(([code]) => !Object.keys(exceptions).includes(code))
    );

    it("returns full list on empty type", () => {
        expect(retrieveFromType()).toStrictEqual(Object.entries(languages));
    });

    it("filters source exceptions", () => {
        checkExceptions("source");
    });

    it("filters target exceptions", () => {
        checkExceptions("target");
    });
});

describe("getName", () => {
    it("returns name from valid code", () => {
        const langEntries = Object.entries(languages);
        const randomEntry = faker.random.arrayElement(langEntries);
        const [code, name] = randomEntry;
        expect(getName(code)).toEqual(name);
    });

    it("returns null on wrong code", () => {
        const randomCode = faker.random.words();
        expect(getName(randomCode)).toBeNull();
    });
});
