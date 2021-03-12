import cheerio from "cheerio";
import { replaceBoth } from "./language";

export async function googleScrape(
    source: string,
    target: string,
    query: string
): Promise<{
    translation?: string,
    statusCode?: number,
    errorMsg?: string
}> {
    const parsed = replaceBoth("mapping", { source, target });
    const res = await fetch(
        `https://translate.google.com/m?sl=${parsed.source}&tl=${parsed.target}&q=${encodeURIComponent(query)}`
    ).catch(() => null);

    if (!res)
        return {
            errorMsg: "An error occurred while retrieving the translation"
        }

    if (!res.ok)
        return {
            statusCode: res.status
        };

    const html = await res.text();
    const translation = cheerio.load(html)(".result-container").text().trim();

    return translation
        ? {
            translation
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
