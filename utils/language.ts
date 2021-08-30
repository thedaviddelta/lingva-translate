import languagesJson from "./languages.json";
const { languages, exceptions, mappings } = languagesJson;

const checkTypes = {
    exception: exceptions,
    mapping: mappings
};

export type CheckType = keyof typeof checkTypes;

const langTypes = [
    "source",
    "target"
] as const;

export type LangType = typeof langTypes[number];

const isKeyOf = <T extends object>(obj: T) => (key: keyof any): key is keyof T => key in obj;

export function replaceBoth(
    checkType: CheckType,
    langs: {
        [key in LangType]: string
    }
): {
    [key in LangType]: string
} {
    const [source, target] = langTypes.map(langType => {
        const object = checkTypes[checkType][langType];
        const langCode = langs[langType];
        return isKeyOf(object)(langCode) ? object[langCode] : langCode;
    });
    return { source, target };
}

export function retrieveFromType(type?: LangType): [string, string][] {
    const langEntries = Object.entries(languages);

    if (!type)
        return langEntries;
    return langEntries.filter(([code]) => (
        !Object.keys(exceptions[type]).includes(code)
    ));
}

export function getName(code: string): string | null {
    return isKeyOf(languages)(code) ? languages[code] : null;
}
