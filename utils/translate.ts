import cheerio from "cheerio";
import { mappings } from "./languages.json";

const isKeyOf = <T extends object>(obj: T) => (key: keyof any): key is keyof T => key in obj;

export async function googleScrape(
    source: string,
    target: string,
    query: string
): Promise<{
    translation?: string,
    error?: number
}> {
    const newTarget = isKeyOf(mappings.target)(target)
        ? mappings.target[target]
        : target;
    const res = await fetch(`https://translate.google.com/m?sl=${source}&tl=${newTarget}&q=${encodeURI(query)}`);

    if (!res.ok)
        return {
            error: res.status
        };

    const html = await res.text();
    return {
        translation: cheerio.load(html)(".result-container").text()
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
            return { target: p1, query: p2 }
        case 3:
            return { source: p1, target: p2, query: p3 }
        default:
            return {}
    }
}
