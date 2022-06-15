import { render, screen } from "./reactUtils";
import CustomError from "@components/CustomError";

const code = Math.random() * 199 + 400;
const text = "Testing fake error";

it("loads the layout correctly", async () => {
    render(<CustomError statusCode={code} statusText={text} />);

    expect(screen.getByRole("link", { name: /skip to content/i })).toBeEnabled();
    expect(await screen.findByRole("img", { name: /logo/i })).toBeVisible();
    expect(screen.getByRole("button", { name: /toggle color mode/i })).toBeEnabled();
    expect(screen.getByRole("link", { name: /github/i })).toBeEnabled();
    expect(screen.getByText(/\xA9/)).toBeVisible();
});

it("renders the correct status code & text", () => {
    render(<CustomError statusCode={code} statusText={text} />);

    expect(screen.getByText(code)).toBeVisible();
    expect(screen.getByText(text)).toBeVisible();
});
