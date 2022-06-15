import { NextApiHandler } from "next";
import NextCors from "nextjs-cors";
import { getTranslationInfo, getTranslationText, getAudio, isValidCode, LanguageType, TranslationInfo } from "lingva-scraper";

type Data = {
    translation: string,
    info?: TranslationInfo
} | {
    audio: number[]
} | {
    error: string
};

const methods = ["GET"];

const handler: NextApiHandler<Data> = async (req, res) => {
    await NextCors(req, res, {
        methods,
        origin: "*",
        preflightContinue: true
    });

    const {
        query: { slug },
        method
    } = req;

    if (!slug || !Array.isArray(slug) || slug.length !== 3)
        return res.status(404).json({ error: "Not Found" });

    if (!method || !methods.includes(method)) {
        res.setHeader("Allow", methods);
        return res.status(405).json({ error: "Method Not Allowed" });
    }

    const [source, target, query] = slug;

    if (!isValidCode(target, LanguageType.TARGET))
        return res.status(400).json({ error: "Invalid target language" });

    if (source === "audio") {
        const audio = await getAudio(target, query);
        return audio
            ? res.status(200).json({ audio })
            : res.status(500).json({ error: "An error occurred while retrieving the audio" });
    }

    if (!isValidCode(source, LanguageType.SOURCE))
        return res.status(400).json({ error: "Invalid source language" });

    const translation = await getTranslationText(source, target, query);

    if (!translation)
        return res.status(500).json({ error: "An error occurred while retrieving the translation" });

    const info = await getTranslationInfo(source, target, query);

    return info
        ? res.status(200).json({ translation, info })
        : res.status(200).json({ translation });
}

export default handler;
