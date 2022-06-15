export const extractSlug = (
    slug: string[]
): {
    source?: string,
    target?: string,
    query?: string
} => {
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
};
