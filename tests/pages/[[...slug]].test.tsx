import { render, screen, waitFor } from "../reactUtils";
import { htmlRes, resolveFetchWith } from "../commonUtils";
import userEvent from "@testing-library/user-event";
import Router from "next/router";
import faker from "faker";
import Page, { getStaticProps } from "../../pages/[[...slug]]";

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
    it("loads the layout correctly", async () => {
        render(<Page />);

        expect(screen.getByRole("link", { name: /skip to content/i })).toBeEnabled();
        expect(await screen.findByRole("img", { name: /logo/i })).toBeVisible();
        expect(screen.getByRole("button", { name: /toggle color mode/i })).toBeEnabled();
        expect(screen.getByRole("link", { name: /github/i })).toBeEnabled();
        expect(screen.getByText(/\xA9/)).toBeVisible();
    });

    it("switches the page on query change", async () => {
        render(<Page />)

        const query = screen.getByRole("textbox", { name: /translation query/i });
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
            query: faker.random.words()
        };
        const translationText = faker.random.words();
        render(<Page translation={translationText} initial={initial} />);

        const source = screen.getByRole("combobox", { name: /source language/i });
        expect(source).toHaveValue(initial.source);
        const target = screen.getByRole("combobox", { name: /target language/i });
        expect(target).toHaveValue(initial.target);
        const query = screen.getByRole("textbox", { name: /translation query/i });
        expect(query).toHaveValue(initial.query);
        const translation = screen.getByRole("textbox", { name: /translation result/i });
        expect(translation).toHaveValue(translationText);
    });

    it("switches the page on language change", async () => {
        const initial = {
            source: "auto",
            target: "en",
            query: faker.random.words()
        };
        const translationText = faker.random.words();
        render(<Page translation={translationText} initial={initial} />);

        const source = screen.getByRole("combobox", { name: /source language/i });

        const sourceVal = "eo";
        userEvent.selectOptions(source, sourceVal);
        expect(source).toHaveValue(sourceVal);

        await waitFor(() => expect(Router.push).toHaveBeenCalledTimes(1));
    });

    it("doesn't switch the page on language change on the start page", async () => {
        render(<Page />);

        const source = screen.getByRole("combobox", { name: /source language/i });

        const sourceVal = "eo";
        userEvent.selectOptions(source, sourceVal);
        expect(source).toHaveValue(sourceVal);

        await waitFor(() => expect(Router.push).not.toHaveBeenCalled());
    });

    it("renders error page on status code", async () => {
        const code = faker.random.number({ min: 400, max: 599 });
        render(<Page statusCode={code} />);
        await waitFor(() => expect(screen.getByText(code)).toBeVisible());
    });

    it("shows alert correctly on error", async () => {
        const errorMsg = faker.random.words();
        render(<Page errorMsg={errorMsg} />);

        const alert = screen.getByRole("alert");

        await waitFor(() => expect(alert).toBeVisible());
        expect(alert).toHaveTextContent(/unexpected error/i);
        expect(alert).toHaveTextContent(errorMsg);
    });
});
