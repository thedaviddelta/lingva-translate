import { TranslationInfo, LangCode } from "lingva-scraper";

import fullInfo from "./fullInfo.json";
import simpleInfo from "./simpleInfo.json";
import pronunciationInfo from "./pronunciationInfo.json";
import audio from "./audio.json";

export const fullInfoMock = fullInfo as TranslationInfo;
export const simpleInfoMock = simpleInfo as TranslationInfo;
export const pronunciationInfoMock = pronunciationInfo as TranslationInfo;
export const audioMock = {
    query: audio as number[],
    translation: audio as number[]
};
export const translationMock = "victoria";
export const initialMock = {
    source: "es" as LangCode<"source">,
    target: "en" as LangCode<"target">,
    query: "hola"
};
export const initialAutoMock = {
    source: "auto" as LangCode<"source">,
    target: "es" as LangCode<"target">,
    query: "win"
};
