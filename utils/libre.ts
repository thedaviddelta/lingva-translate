import { isValidCode, LanguageType, LangCode, TranslationInfo } from "lingva-scraper";

/**
 * Client for a self-hosted LibreTranslate instance, used instead of scraping
 * Google Translate (which is no longer reachable/reliable).
 *
 * Configure the endpoint with the `LIBRE_TRANSLATE_URL` environment variable
 * (defaults to `http://127.0.0.1:5000`) and, optionally, `LIBRE_TRANSLATE_API_KEY`.
 */

const baseUrl = (process.env["LIBRE_TRANSLATE_URL"] || "http://127.0.0.1:5000").replace(/\/+$/, "");
const apiKey = process.env["LIBRE_TRANSLATE_API_KEY"] || undefined;

const requestTimeout = 60 * 1000;
const cacheLimit = 500;

type LibreResponse = {
    translatedText?: string,
    detectedLanguage?: {
        confidence: number,
        language: string
    }
};

// Lingva (Google) codes that differ from the ISO codes LibreTranslate expects
const requestExceptions: Record<string, string> = {
    zh_HANT: "zh",
    iw: "he",
    jw: "jv"
};

// LibreTranslate codes that have to be mapped back to Lingva ones
const responseExceptions: Record<string, string> = {
    he: "iw",
    jv: "jw"
};

const parseCode = (code: string) => requestExceptions[code] ?? code;

// getTranslationText and getTranslationInfo are called one after another with
// the same query, so the response is cached to avoid a duplicated request
const cache = new Map<string, LibreResponse>();

const saveToCache = (key: string, value: LibreResponse) => {
    if (cache.size >= cacheLimit)
        cache.delete(cache.keys().next().value as string);
    cache.set(key, value);
};

const requestTranslation = async (source: string, target: string, query: string): Promise<LibreResponse | null> => {
    const cacheKey = `${source}\u0000${target}\u0000${query}`;
    const cached = cache.get(cacheKey);
    if (cached) {
        cache.delete(cacheKey);
        cache.set(cacheKey, cached);
        return cached;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), requestTimeout);

    try {
        const response = await fetch(`${baseUrl}/translate`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                q: query,
                source: source === "auto" ? "auto" : parseCode(source),
                target: parseCode(target),
                format: "text",
                ...(apiKey && { api_key: apiKey })
            }),
            signal: controller.signal
        });

        if (!response.ok) {
            console.error(`[libre-translate] Request failed with status ${response.status}: ${await response.text()}`);
            return null;
        }

        const data = await response.json() as LibreResponse;

        if (!data.translatedText) {
            console.error("[libre-translate] Response does not contain a translation");
            return null;
        }

        saveToCache(cacheKey, data);
        return data;
    } catch (error) {
        console.error(`[libre-translate] ${(error as Error).message}`);
        return null;
    } finally {
        clearTimeout(timeoutId);
    }
};

export const getTranslationText = async (source: string, target: string, query: string): Promise<string | null> => {
    const response = await requestTranslation(source, target, query);
    return response?.translatedText ?? null;
};

export const getTranslationInfo = async (source: string, target: string, query: string): Promise<TranslationInfo | null> => {
    const response = await requestTranslation(source, target, query);

    if (!response?.translatedText)
        return null;

    const detectedCode = response.detectedLanguage
        ? responseExceptions[response.detectedLanguage.language] ?? response.detectedLanguage.language
        : undefined;

    const info: TranslationInfo = {
        pronunciation: {},
        definitions: [],
        examples: [],
        similar: [],
        extraTranslations: []
    };

    if (detectedCode && isValidCode(detectedCode, LanguageType.SOURCE))
        info.detectedSource = detectedCode as LangCode<"source">;

    return info;
};
