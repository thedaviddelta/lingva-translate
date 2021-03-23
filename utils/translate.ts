import UserAgent from "user-agents";
import cheerio from "cheerio";
import { replaceBoth } from "./language";

export async function googleScrape(
    source: string,
    target: string,
    query: string
): Promise<{
    translationRes?: string,
    statusCode?: number,
    errorMsg?: string
}> {
    const parsed = replaceBoth("mapping", { source, target });
    const res = await fetch(
        `https://translate.google.com/m?sl=${parsed.source}&tl=${parsed.target}&q=${encodeURIComponent(query)}`,
        {
            headers: {
                "User-Agent": new UserAgent().toString()
            }
        }
    ).catch(
        () => null
    );

    if (!res)
        return {
            errorMsg: "An error occurred while retrieving the translation"
        }

    if (!res.ok)
        return {
            statusCode: res.status
        };

    const html = await res.text();
    const translationRes = cheerio.load(html)(".result-container").text().trim();

    return translationRes
        ? {
            translationRes
        } : {
            errorMsg: "An error occurred while parsing the translation"
        };
}

export function extractSlug(slug: string[]): {
    source?: string,
    target?: string,
    query?: string
} {
    const [p1, p2, p3] = slug;
    switch (slug.length) {
        case 1:
            return { query: p1 };
        case 2:
            return { target: p1, query: p2 };
        case 3:
            return { source: p1, target: p2, query: p3 };
        default:
            return {};
    }
}

export async function textToSpeechScrape(lang: string, text?: string) {
    if (!text)
        return null;

    const { target: parsedLang } = replaceBoth("mapping", { source: "", target: lang });

    const slicedText = text.slice(0, 100);
    const res = await fetch(
        `http://translate.google.com/translate_tts?tl=${parsedLang}&q=${slicedText}&textlen=${slicedText.length}&client=tw-ob`,
        {
            headers: {
                "User-Agent": new UserAgent().toString()
            }
        }
    ).catch(
        () => null
    );

    return res?.ok
        ? res.blob().then(blob => blob.arrayBuffer()).then(buffer => Array.from(new Uint8Array(buffer)))
        : null;
}

