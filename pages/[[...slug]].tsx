import { useState, useEffect, FC } from "react";
import { GetStaticPaths, GetStaticProps, InferGetStaticPropsType } from "next";
import { useRouter } from "next/router";
import Error from "next/error";
import { googleScrape, extractSlug } from "../utils/translate";
import Languages from "../components/Languages";
import { languages, exceptions } from "../utils/languages.json";

const Page: FC<InferGetStaticPropsType<typeof getStaticProps>> = ({ translation, error, initial }) => {
    if (error)
        return <Error statusCode={error} />

    const router = useRouter();

    const [source, setSource] = useState("auto");
    const [target, setTarget] = useState("en");
    const [query, setQuery] = useState("");

    const updateTranslation = () => {
        query && router.push(`/${source}/${target}/${query}`);
    };

    useEffect(() => {
        initial?.source && setSource(initial.source);
        initial?.target && setTarget(initial.target);
        initial?.query && setQuery(initial.query);
    }, [initial]);

    useEffect(() => {
        if (!query || query === initial?.query)
            return;

        const timeout = setTimeout(updateTranslation, 1500);
        return () => clearTimeout(timeout);
    }, [query]);

    useEffect(updateTranslation, [source, target]);

    const langs = Object.entries(languages);
    const sourceLangs = langs.filter(([code]) => !exceptions.source.includes(code));
    const targetLangs = langs.filter(([code]) => !exceptions.target.includes(code));

    return (
        <div>
            <div>
                <label htmlFor="source">
                    Source:
                </label>
                <select id="source" value={source} onChange={e => setSource(e.target.value)}>
                    <Languages langs={sourceLangs} />
                </select>
            </div>
            <div>
                <label htmlFor="target">
                    Target:
                </label>
                <select id="target" value={target} onChange={e => setTarget(e.target.value)}>
                    <Languages langs={targetLangs} />
                </select>
            </div>
            <div>
                <label htmlFor="query">
                    Query:
                </label>
                <input type="text" id="query" value={query} onChange={e => setQuery(e.target.value)} />
            </div>
            <div>
                {translation}
            </div>
        </div>
    );
}

export default Page;

export const getStaticPaths: GetStaticPaths = async () => ({
    paths: [
        {
            params: { slug: [] }
        }
    ],
    fallback: true
});

export const getStaticProps: GetStaticProps = async ({ params, locale }) => {
    if (!params?.slug || !Array.isArray(params.slug))
        return {
            props: {}
        };

    const { source, target, query } = extractSlug(params.slug);

    if (!query)
        return {
            notFound: true
        };

    if (!source || !target)
        return {
            redirect: {
                destination: `/${source ?? "auto"}/${target ?? "en"}/${query}`,
                permanent: true
            }
        }

    return {
        props: {
            ...await googleScrape(source, target, query),
            initial: {
                source, target, query
            }
        },
        revalidate: 2 * 30 * 24 * 60 * 60 // 2 months
    };
}
