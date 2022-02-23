import UserAgent from "user-agents";
import cheerio from "cheerio";
import { replaceBoth, LangCode } from "./language";

export async function googleScrape(
    source: LangCode,
    target: LangCode,
    query: string
): Promise<{
    translationRes: string
} | {
    errorMsg: string
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

    if (!res?.ok)
        return {
            errorMsg: "An error occurred while retrieving the translation"
        }

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

export async function textToSpeechScrape(lang: LangCode, text: string) {
    const { target: parsedLang } = replaceBoth("mapping", { source: "auto", target: lang });

    const lastSpace = text.lastIndexOf(" ", 200);
    const slicedText = text.slice(0, text.length > 200 && lastSpace !== -1 ? lastSpace : 200);

    const res = await fetch(
        `https://translate.google.com/translate_tts?tl=${parsedLang}&q=${encodeURIComponent(slicedText)}&textlen=${slicedText.length}&client=tw-ob`,
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

