import { writeFile } from "node:fs/promises";
import { getTranslationInfo, getAudio, LangCode } from "lingva-scraper";

const handleError = (obj: object | null) => {
    if (!obj)
        throw new Error();
    return obj;
};

const renew = {
    fullInfo: () => getTranslationInfo("auto" as LangCode<"source">, "es" as LangCode<"target">, "win").then(handleError),
    simpleInfo: () => getTranslationInfo("es" as LangCode<"source">, "en" as LangCode<"target">, "hola").then(handleError),
    pronunciationInfo: () => getTranslationInfo("zh" as LangCode<"source">, "ko" as LangCode<"target">, "早安").then(handleError),
    audio: () => getAudio("es" as LangCode<"target">, "hola").then(handleError),
};

type DataType = keyof typeof renew;

const save = (json: object, type: DataType) => {
    writeFile(
        `./mocks/data/${type}.json`,
        JSON.stringify(json, null, 2),
        "utf-8"
    ).then(() =>
        console.log(`Successfully renewed '${type}'`)
    ).catch(() =>
        console.log(`Error renewing '${type}'`)
    )
};

const isKeyOf = <T extends object>(obj: T, key: keyof any): key is keyof T => key in obj;

const arg = process.argv[2];

if (arg && isKeyOf(renew, arg))
    renew[arg]().then(json => save(json, arg));
else
    Object.entries(renew).forEach(([key, fn]) =>
        isKeyOf(renew, key) && fn().then(json => save(json, key))
    );
