import { render, screen, waitFor, act } from "./reactUtils";
import userEvent from "@testing-library/user-event";
import { localStorageSetMock } from "@mocks/localStorage";
import { routerMock } from "@mocks/next";
import {
    fullInfoMock,
    simpleInfoMock,
    pronunciationInfoMock,
    translationMock,
    audioMock,
    initialMock,
    initialAutoMock
} from "@mocks/data";
import Page, { ResponseType } from "@pages/[[...slug]]";

beforeEach(() => {
    routerMock.push.mockReset();
});

it("loads the layout correctly", async () => {
    render(<Page type={ResponseType.HOME} />);

    expect(screen.getByRole("link", { name: /skip to content/i })).toBeEnabled();
    expect(await screen.findByRole("img", { name: /logo/i })).toBeVisible();
    expect(screen.getByRole("button", { name: /toggle color mode/i })).toBeEnabled();
    expect(screen.getByRole("link", { name: /github/i })).toBeEnabled();
    expect(screen.getByText(/\xA9/)).toBeVisible();
});

it("switches the page on translate button click", async () => {
    const user = userEvent.setup();
    render(<Page type={ResponseType.HOME} />);

    const query = screen.getByRole("textbox", { name: /translation query/i });
    await waitFor(() => user.type(query, "Random query"));
    const translate = screen.getByRole("button", { name: /translate/i });
    await waitFor(() => user.click(translate));

    expect(routerMock.push).toHaveBeenCalledTimes(1);
    expect(screen.getByText(/loading translation/i)).toBeInTheDocument();
});

it("doesn't switch the page if nothing has changed", async () => {
    const user = userEvent.setup();
    render(<Page type={ResponseType.SUCCESS} initial={initialMock} translation={translationMock} info={simpleInfoMock} audio={audioMock} />);

    const translate = screen.getByRole("button", { name: /translate/i });
    await waitFor(() => user.click(translate));

    expect(routerMock.push).not.toHaveBeenCalled();
    expect(screen.queryByText(/loading translation/i)).not.toBeInTheDocument();
});

it("stores auto state in localStorage", async () => {
    const user = userEvent.setup();
    render(<Page type={ResponseType.HOME} />);

    const switchAuto = screen.getByRole("button", { name: /switch auto/i });

    await waitFor(() => user.click(switchAuto));
    expect(localStorageSetMock).toHaveBeenLastCalledWith("isauto", "true");
    await waitFor(() => user.click(switchAuto));
    expect(localStorageSetMock).toHaveBeenLastCalledWith("isauto", "false");
});

it("switches the page on query change if auto is enabled", async () => {
    jest.useFakeTimers();

    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    render(<Page type={ResponseType.HOME} />);

    const switchAuto = screen.getByRole("button", { name: /switch auto/i });
    await waitFor(() => user.click(switchAuto));
    const query = screen.getByRole("textbox", { name: /translation query/i });
    await waitFor(() => user.type(query, "Random query"));

    await waitFor(() => expect(routerMock.push).not.toHaveBeenCalled());
    expect(screen.queryByText(/loading translation/i)).not.toBeInTheDocument();

    act(() => {
        jest.advanceTimersByTime(1000);
    });

    await waitFor(() => expect(routerMock.push).toHaveBeenCalledTimes(1));
    expect(screen.getByText(/loading translation/i)).toBeInTheDocument();

    jest.useRealTimers();
});

it("switches the page on language change if auto is enabled", async () => {
    const user = userEvent.setup();
    render(<Page type={ResponseType.SUCCESS} translation={translationMock} initial={initialAutoMock} info={simpleInfoMock} audio={audioMock} />);

    const switchAuto = screen.getByRole("button", { name: /switch auto/i });
    await waitFor(() => user.click(switchAuto));

    const source = screen.getByRole("combobox", { name: /source language/i });

    const sourceVal = "eo";
    await waitFor(() => user.selectOptions(source, sourceVal));
    expect(source).toHaveValue(sourceVal);

    await waitFor(() => expect(routerMock.push).toHaveBeenCalledTimes(1));
    expect(localStorageSetMock).toHaveBeenCalledWith("source", sourceVal);
});

it("doesn't switch the page on language change on the start page", async () => {
    const user = userEvent.setup();
    render(<Page type={ResponseType.HOME} />);

    const switchAuto = screen.getByRole("button", { name: /switch auto/i });
    await waitFor(() => user.click(switchAuto));

    const source = screen.getByRole("combobox", { name: /source language/i });

    const sourceVal = "eo";
    await waitFor(() => user.selectOptions(source, sourceVal));
    expect(source).toHaveValue(sourceVal);

    await waitFor(() => expect(routerMock.push).not.toHaveBeenCalled());
});

it("switches languages & translations", async () => {
    const user = userEvent.setup();
    render(<Page type={ResponseType.SUCCESS} translation={translationMock} initial={initialMock} info={fullInfoMock} audio={audioMock} />);

    const switchAuto = screen.getByRole("button", { name: /switch auto/i });
    await waitFor(() => user.click(switchAuto));

    const btnSwitch = screen.getByRole("button", { name: /switch languages/i });
    await waitFor(() => user.click(btnSwitch));

    expect(screen.getByRole("combobox", { name: /source language/i })).toHaveValue(initialMock.target);
    expect(screen.getByRole("combobox", { name: /target language/i })).toHaveValue(initialMock.source);
    expect(screen.getByRole("textbox", { name: /translation query/i })).toHaveValue(translationMock);
    expect(screen.getByRole("textbox", { name: /translation result/i })).toHaveValue(initialMock.query);

    await waitFor(() => expect(routerMock.push).toHaveBeenCalledTimes(1));
    expect(localStorageSetMock).toHaveBeenLastCalledWith("target", initialMock.source);
});

it("switches auto with detected language", async () => {
    const user = userEvent.setup();
    render(<Page type={ResponseType.SUCCESS} translation={translationMock} initial={initialAutoMock} info={fullInfoMock} audio={audioMock} />);

    const btnSwitch = screen.getByRole("button", { name: /switch languages/i });
    await waitFor(() => user.click(btnSwitch));

    expect(screen.getByRole("combobox", { name: /source language/i })).toHaveValue(initialAutoMock.target);
    expect(screen.getByRole("combobox", { name: /target language/i })).toHaveValue(fullInfoMock.detectedSource);
    expect(screen.getByRole("textbox", { name: /translation query/i })).toHaveValue(translationMock);
    expect(screen.getByRole("textbox", { name: /translation result/i })).toHaveValue(initialAutoMock.query);
});

it("corrently shows query & translation pronunciations", async () => {
    render(<Page type={ResponseType.SUCCESS} translation={translationMock} initial={initialMock} info={pronunciationInfoMock} audio={audioMock} />);

    expect(screen.getByRole("combobox", { name: /source language/i })).toHaveValue(initialMock.source);
    expect(screen.getByRole("combobox", { name: /target language/i })).toHaveValue(initialMock.target);
    expect(screen.getByRole("textbox", { name: /translation query/i })).toHaveValue(initialMock.query);
    expect(screen.getByRole("textbox", { name: /translation result/i })).toHaveValue(translationMock);

    expect(screen.getByText(pronunciationInfoMock.pronunciation.query!)).toBeVisible();
    expect(screen.getByText(pronunciationInfoMock.pronunciation.translation!)).toBeVisible();
});

it("translates & loads initials correctly", async () => {
    render(<Page type={ResponseType.SUCCESS} translation={translationMock} initial={initialMock} info={fullInfoMock} audio={audioMock} />);

    const source = screen.getByRole("combobox", { name: /source language/i });
    expect(source).toHaveValue(initialMock.source);
    const target = screen.getByRole("combobox", { name: /target language/i });
    expect(target).toHaveValue(initialMock.target);
    const query = screen.getByRole("textbox", { name: /translation query/i });
    expect(query).toHaveValue(initialMock.query);
    const translation = screen.getByRole("textbox", { name: /translation result/i });
    expect(translation).toHaveValue(translationMock);
});

it("loads audio & clipboard correctly", async () => {
    render(<Page type={ResponseType.SUCCESS} translation={translationMock} initial={initialMock} info={simpleInfoMock} audio={audioMock} />);

    const btnsAudio = screen.getAllByRole("button", { name: /play audio/i });
    btnsAudio.forEach(btn => expect(btn).toBeVisible());
    const btnCopy = screen.getByRole("button", { name: /copy to clipboard/i });
    expect(btnCopy).toBeEnabled();
});

it("shows alert correctly on error", async () => {
    const errorMsg = "Random error";
    render(<Page type={ResponseType.ERROR} initial={initialMock} errorMsg={errorMsg} />);

    const alert = screen.getByRole("alert");

    await waitFor(() => expect(alert).toBeVisible());
    expect(alert).toHaveTextContent(/unexpected error/i);
    expect(alert).toHaveTextContent(errorMsg);
});
