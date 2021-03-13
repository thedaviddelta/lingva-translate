import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { htmlRes, resolveFetchWith } from "../commonUtils";
import Router from "next/router";
import { getPage } from "next-page-tester";
import faker from "faker";
import { getStaticProps } from "../../pages/[[...slug]]";

const mockPush = jest.spyOn(Router, "push").mockImplementation(async () => true);

beforeEach(() => {
    fetchMock.resetMocks();
    mockPush.mockReset();
});

describe("getStaticProps", () => {
    const source = faker.random.locale();
    const target = faker.random.locale();
    const query = faker.random.words();

    it("returns empty props on empty params", async () => {
        expect(await getStaticProps({ params: {} })).toStrictEqual({ props: {} });
    });

    it("returns not found on >4 params", async () => {
        const slug = [source, target, query, ""];
        expect(await getStaticProps({ params: { slug } })).toStrictEqual({ notFound: true });
    });

    it("redirects on 1 param", async () => {
        const slug = [query];
        expect(await getStaticProps({ params: { slug } })).toMatchObject({ redirect: expect.any(Object) });
    });

    it("redirects on 2 params", async () => {
        const slug = [target, query];
        expect(await getStaticProps({ params: { slug } })).toMatchObject({ redirect: expect.any(Object) });
    });

    it("returns translation & initial values on 3 params", async () => {
        const translation = faker.random.words();
        const html = htmlRes(translation);
        resolveFetchWith(html);

        const slug = [source, target, query];
        expect(await getStaticProps({ params: { slug } })).toStrictEqual({
            props: {
                translation,
                initial: {
                    source,
                    target,
                    query
                }
            },
            revalidate: expect.any(Number)
        });
    });
});

describe("Page", () => {
    it("switches the page on query change", async () => {
        const { render } = await getPage({
            route: "/"
        });
        render();

        const query = screen.getByRole("textbox", { name: /query/i });
        userEvent.type(query, faker.random.words());

        await waitFor(
            () => expect(Router.push).not.toHaveBeenCalled(),
            { timeout: 250 }
        );
        await waitFor(
            () => expect(Router.push).toHaveBeenCalledTimes(1),
            { timeout: 2500 }
        );
    });

    it("translates & loads initials correctly", async () => {
        const initial = {
            source: "ca",
            target: "es",
            query: encodeURIComponent(faker.random.words())
        };
        const translation = faker.random.words();
        resolveFetchWith(htmlRes(translation));

        const { render } = await getPage({
            route: `/${initial.source}/${initial.target}/${initial.query}`
        });
        render();

        expect(await screen.findByText(translation)).toBeVisible();
        const source = screen.getByRole("combobox", { name: /source/i });
        expect(source).toHaveValue(initial.source);
        const target = screen.getByRole("combobox", { name: /target/i });
        expect(target).toHaveValue(initial.target);
        const query = screen.getByRole("textbox", { name: /query/i });
        expect(query).toHaveValue(initial.query);
    });

    it("parses urlencoding correctly", async () => {
        const initial = {
            source: "zh",
            target: "en",
            query: encodeURIComponent("你好")
        };
        const translation = "Hello";
        resolveFetchWith(htmlRes(translation));

        const { render } = await getPage({
            route: `/${initial.source}/${initial.target}/${initial.query}`
        });
        render();

        expect(await screen.findByText(translation)).toBeVisible();
        const source = screen.getByRole("combobox", { name: /source/i });
        expect(source).toHaveValue(initial.source);
        const target = screen.getByRole("combobox", { name: /target/i });
        expect(target).toHaveValue(initial.target);
        const query = screen.getByRole("textbox", { name: /query/i });
        expect(query).toHaveValue(initial.query);
    });

    it("switches the page on language change", async () => {
        resolveFetchWith(htmlRes(faker.random.words()));

        const { render } = await getPage({
            route: `/auto/en/${faker.random.words()}`
        });
        render();

        const source = screen.getByRole("combobox", { name: /source/i });

        const sourceVal = "eo";
        userEvent.selectOptions(source, sourceVal);
        expect(source).toHaveValue(sourceVal);

        await waitFor(() => expect(Router.push).toHaveBeenCalledTimes(1));
    });

    it("doesn't switch the page on language change on the start page", async () => {
        const { render } = await getPage({
            route: "/"
        });
        render();

        const source = screen.getByRole("combobox", { name: /source/i });

        const sourceVal = "eo";
        userEvent.selectOptions(source, sourceVal);
        expect(source).toHaveValue(sourceVal);

        await waitFor(() => expect(Router.push).not.toHaveBeenCalled());
    });
});
