import { NextApiHandler } from "next";
import NextCors from "nextjs-cors";
import { googleScrape, textToSpeechScrape } from "../../../utils/translate";
import { statusTextFrom } from "../../../utils/error";

type Data = {
    translation?: string,
    audio?: number[],
    error?: string
};

const methods = ["GET"];

const handler: NextApiHandler<Data> = async (req, res) => {
    await NextCors(req, res, {
        methods,
        origin: "*"
    });

    const {
        query: { slug },
        method
    } = req;

    if (!slug || !Array.isArray(slug) || slug.length !== 3)
        return res.status(404).json({ error: statusTextFrom(404) });

    if (!method || !methods.includes(method))
        return res.status(405).json({ error: statusTextFrom(405) });

    const [source, target, query] = slug;

    if (source === "audio") {
        const audio = await textToSpeechScrape(target, query);
        return audio
            ? res.status(200).json({ audio })
            : res.status(500).json({ error: statusTextFrom(500) });
    }

    const { translationRes, errorMsg, statusCode } = await googleScrape(source, target, query);

    if (statusCode)
        return res.status(statusCode).json({ error: statusTextFrom(statusCode) });
    if (errorMsg)
        return res.status(500).json({ error: errorMsg });
    res.status(200).json({ translation: translationRes });
}

export default handler;
