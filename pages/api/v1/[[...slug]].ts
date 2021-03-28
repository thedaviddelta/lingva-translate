import { NextApiHandler } from "next";
import NextCors from "nextjs-cors";
import { googleScrape, textToSpeechScrape } from "../../../utils/translate";

type Data = {
    translation?: string,
    audio?: number[],
    error?: string
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

    if (source === "audio") {
        const audio = await textToSpeechScrape(target, query);
        return audio
            ? res.status(200).json({ audio })
            : res.status(500).json({ error: "An error occurred while retrieving the audio" });
    }

    const { translationRes, errorMsg } = await googleScrape(source, target, query);

    if (errorMsg)
        return res.status(500).json({ error: errorMsg });
    res.status(200).json({ translation: translationRes });
}

export default handler;
