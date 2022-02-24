import { render, screen, waitFor } from "@tests/reactUtils";
import { htmlRes, resolveFetchWith } from "@tests/commonUtils";
import userEvent from "@testing-library/user-event";
import faker from "faker";
import Page, { getStaticProps } from "@pages/[[...slug]]";
import { localStorageSetMock } from "@mocks/localStorage";
import { routerPushMock } from "@mocks/next";

beforeEach(() => {
    fetchMock.resetMocks();
    routerPushMock.mockReset();
});

describe("getStaticProps", () => {
    const source = "es";
    const target = "ca";
    const query = faker.random.words();

    it("returns home on empty params", async () => {
        expect(await getStaticProps({ params: {} })).toStrictEqual({ props: { home: true } });
    });

    it("returns not found on >=4 params", async () => {
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

    it("returns translation, audio & initial values on 3 params", async () => {
        const translationRes = faker.random.words();
        resolveFetchWith(htmlRes(translationRes));

        const slug = [source, target, query];
        expect(await getStaticProps({ params: { slug } })).toStrictEqual({
            props: {
                translationRes,
                audio: {
                    source: expect.any(Array),
                    target: expect.any(Array)
                },
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
    const translationRes = faker.random.words();
    const randomAudio = Array.from({ length: 10 }, () => faker.datatype.number(100));
    const audio = {
        source: randomAudio,
        target: randomAudio
    };

    it("loads the layout correctly", async () => {
        render(<Page home={true} />);

        expect(screen.getByRole("link", { name: /skip to content/i })).toBeEnabled();
        expect(await screen.findByRole("img", { name: /logo/i })).toBeVisible();
        expect(screen.getByRole("button", { name: /toggle color mode/i })).toBeEnabled();
        expect(screen.getByRole("link", { name: /github/i })).toBeEnabled();
        expect(screen.getByText(/\xA9/)).toBeVisible();
    });

    it("switches the page on translate button click", async () => {
        render(<Page home={true} />);

        const query = screen.getByRole("textbox", { name: /translation query/i });
        userEvent.type(query, faker.random.words());
        const translate = screen.getByRole("button", { name: /translate/i });
        translate.click();

        expect(routerPushMock).toHaveBeenCalledTimes(1);
        expect(screen.getByText(/loading translation/i)).toBeInTheDocument();
    });

    it("doesn't switch the page if nothing has changed", async () => {
        const initial = {
            source: "ca",
            target: "es",
            query: faker.random.words()
        };
        render(<Page translationRes={translationRes} audio={audio} initial={initial} />);

        const translate = screen.getByRole("button", { name: /translate/i });
        translate.click();

        expect(routerPushMock).not.toHaveBeenCalled();
        expect(screen.queryByText(/loading translation/i)).not.toBeInTheDocument();
    });

    it("stores auto state in localStorage", async () => {
        render(<Page home={true} />);

        const switchAuto = screen.getByRole("button", { name: /switch auto/i });

        switchAuto.click();
        await waitFor(() => expect(localStorageSetMock).toHaveBeenLastCalledWith("isauto", "true"));
        switchAuto.click();
        await waitFor(() => expect(localStorageSetMock).toHaveBeenLastCalledWith("isauto", "false"));
    });

    it("switches the page on query change if auto is enabled", async () => {
        render(<Page home={true} />);

        const switchAuto = screen.getByRole("button", { name: /switch auto/i });
        switchAuto.click();
        const query = screen.getByRole("textbox", { name: /translation query/i });
        userEvent.type(query, faker.random.words());

        await waitFor(
            () => {
                expect(routerPushMock).not.toHaveBeenCalled();
                expect(screen.queryByText(/loading translation/i)).not.toBeInTheDocument();
            },
            { timeout: 250 }
        );
        await waitFor(
            () => {
                expect(routerPushMock).toHaveBeenCalledTimes(1);
                expect(screen.getByText(/loading translation/i)).toBeInTheDocument();
            },
            { timeout: 2500 }
        );
    });

    it("switches the page on language change if auto is enabled", async () => {
        const initial = {
            source: "auto",
            target: "en",
            query: faker.random.words()
        };
        render(<Page translationRes={translationRes} audio={audio} initial={initial} />);

        const switchAuto = screen.getByRole("button", { name: /switch auto/i });
        switchAuto.click();

        const source = screen.getByRole("combobox", { name: /source language/i });

        const sourceVal = "eo";
        userEvent.selectOptions(source, sourceVal);
        expect(source).toHaveValue(sourceVal);

        await waitFor(() => expect(routerPushMock).toHaveBeenCalledTimes(1));
        expect(localStorageSetMock).toHaveBeenCalledWith("source", sourceVal);
    });

    it("doesn't switch the page on language change on the start page", async () => {
        render(<Page home={true} />);

        const switchAuto = screen.getByRole("button", { name: /switch auto/i });
        switchAuto.click();

        const source = screen.getByRole("combobox", { name: /source language/i });

        const sourceVal = "eo";
        userEvent.selectOptions(source, sourceVal);
        expect(source).toHaveValue(sourceVal);

        await waitFor(() => expect(routerPushMock).not.toHaveBeenCalled());
    });

    it("switches languages & translations", async () => {
        const initial = {
            source: "es",
            target: "ca",
            query: faker.random.words()
        };
        render(<Page translationRes={translationRes} audio={audio} initial={initial} />);

        const switchAuto = screen.getByRole("button", { name: /switch auto/i });
        switchAuto.click();

        const btnSwitch = screen.getByRole("button", { name: /switch languages/i });
        userEvent.click(btnSwitch);

        expect(screen.getByRole("combobox", { name: /source language/i })).toHaveValue(initial.target);
        expect(screen.getByRole("combobox", { name: /target language/i })).toHaveValue(initial.source);
        expect(screen.getByRole("textbox", { name: /translation query/i })).toHaveValue(translationRes);
        expect(screen.getByRole("textbox", { name: /translation result/i })).toHaveValue(initial.query);

        await waitFor(() => expect(routerPushMock).toHaveBeenCalledTimes(1));
        expect(localStorageSetMock).toHaveBeenLastCalledWith("target", initial.source);
    });

    it("translates & loads initials correctly", async () => {
        const initial = {
            source: "ca",
            target: "es",
            query: faker.random.words()
        };
        render(<Page translationRes={translationRes} audio={audio} initial={initial} />);

        const source = screen.getByRole("combobox", { name: /source language/i });
        expect(source).toHaveValue(initial.source);
        const target = screen.getByRole("combobox", { name: /target language/i });
        expect(target).toHaveValue(initial.target);
        const query = screen.getByRole("textbox", { name: /translation query/i });
        expect(query).toHaveValue(initial.query);
        const translation = screen.getByRole("textbox", { name: /translation result/i });
        expect(translation).toHaveValue(translationRes);
    });

    it("loads audio & clipboard correctly", async () => {
        const initial = {
            source: "eo",
            target: "zh",
            query: faker.random.words()
        };
        render(<Page translationRes={translationRes} audio={audio} initial={initial} />);

        const btnsAudio = screen.getAllByRole("button", { name: /play audio/i });
        btnsAudio.forEach(btn => expect(btn).toBeVisible());
        const btnCopy = screen.getByRole("button", { name: /copy to clipboard/i });
        expect(btnCopy).toBeEnabled();
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
