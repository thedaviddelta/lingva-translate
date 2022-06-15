import { NextApiHandler } from "next";
import NextCors from "nextjs-cors";
import { languageList, LangCode } from "lingva-scraper";

type Data = {
    languages: {
        code: LangCode,
        name: string
    }[]
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

    if (slug && Array.isArray(slug) && slug.length > 1)
        return res.status(404).json({ error: "Not Found" });

    if (!method || !methods.includes(method)) {
        res.setHeader("Allow", methods);
        return res.status(405).json({ error: "Method Not Allowed" });
    }

    const type = slug?.[0];

    if (type !== undefined && type !== "source" && type !== "target")
        return res.status(400).json({ error: "Type should be 'source', 'target' or empty" });

    const langEntries = Object.entries(languageList[type ?? "all"]) as [LangCode, string][];
    const languages = langEntries.map(([code, name]) => ({ code, name }));

    res.status(200).json({ languages });
}

export default handler;
