import { languages, exceptions, mappings } from "./languages.json";

const checkTypes = {
    exception: exceptions,
    mapping: mappings
}

type CheckType = keyof typeof checkTypes;

const langTypes = [
    "source",
    "target"
] as const;

type LangType = typeof langTypes[number];

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

export function retrieveFiltered(source: string, target: string) {
    const current = {
        source: target,
        target: source
    };
    const [sourceLangs, targetLangs] = langTypes.map(type => (
        Object.entries(languages).filter(([code]) => (
            !Object.keys(exceptions[type]).includes(code)
            && current[type] !== code
        ))
    ));
    return { sourceLangs, targetLangs };
}
