import { useState, useEffect, useReducer, FC, ChangeEvent } from "react";
import { GetStaticPaths, GetStaticProps, InferGetStaticPropsType } from "next";
import Head from "next/head";
import Router from "next/router";
import Error from "next/error";
import { googleScrape, extractSlug } from "../utils/translate";
import Languages from "../components/Languages";
import { retrieveFiltered } from "../utils/language";
import langReducer, { Actions, initialState } from "../utils/reducer";

const Page: FC<InferGetStaticPropsType<typeof getStaticProps>> = ({ translation, error, initial }) => {
    const [{ source, target, query }, dispatch] = useReducer(langReducer, initialState);
    const [encodedQuery, setEncodedQuery] = useState("");

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        dispatch({
            type: Actions.SET_FIELD,
            payload: {
                key: e.target.id,
                value: e.target.value
            }
        });
    };

    useEffect(() => {
        initial && dispatch({ type: Actions.SET_ALL, payload: { state: initial }});
    }, [initial]);

    useEffect(() => {
        if (!query || query === initial?.query)
            return;

        const timeout = setTimeout(() => setEncodedQuery(encodeURIComponent(query)), 1000);
        return () => clearTimeout(timeout);
    }, [query, initial?.query]);

    useEffect(() => {
        encodedQuery && Router.push(`/${source}/${target}/${encodedQuery}`);
    }, [source, target, encodedQuery]);

    const { sourceLangs, targetLangs } = retrieveFiltered(source, target);

    return error ? (
        <Error statusCode={error} />
    ) : (
        <div>
            <Head>
                <title>Lingva Translate</title>
                <link rel="icon" href="/favicon.svg" />
            </Head>

            <div>
                <button onClick={() => dispatch({ type: Actions.SWITCH_LANGS })} disabled={source === "auto"}>
                    Switch languages
                </button>
            </div>
            <div>
                <label htmlFor="source">
                    Source:
                </label>
                <select id="source" value={source} onChange={handleChange}>
                    <Languages langs={sourceLangs} />
                </select>
            </div>
            <div>
                <label htmlFor="target">
                    Target:
                </label>
                <select id="target" value={target} onChange={handleChange}>
                    <Languages langs={targetLangs} />
                </select>
            </div>
            <div>
                <label htmlFor="query">
                    Query:
                </label>
                <input type="text" id="query" value={query} onChange={handleChange} />
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

export const getStaticProps: GetStaticProps = async ({ params }) => {
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
