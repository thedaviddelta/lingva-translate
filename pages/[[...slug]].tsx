import { useState, useEffect, FC } from "react";
import { GetStaticPaths, GetStaticProps, InferGetStaticPropsType } from "next";
import { useRouter } from "next/router";
import Error from "next/error";
import { googleScrape, extractSlug } from "../utils/translate";

const Page: FC<InferGetStaticPropsType<typeof getStaticProps>> = ({ translation, error, initial }) => {
    if (error)
        return <Error statusCode={error} />

    const router = useRouter();

    const [query, setQuery] = useState("");

    useEffect(() => {
        initial?.query && setQuery(initial.query);
    }, [initial]);

    useEffect(() => {
        if (!query || query === initial?.query)
            return;

        const timeout = setTimeout(() => router.push(`/auto/en/${query}`), 2000);
        return () => clearTimeout(timeout);
    }, [query]);

    return (
        <div>
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
