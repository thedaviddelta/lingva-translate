import { render, screen } from "../reactUtils";
import faker from "faker";
import CustomError from "../../components/CustomError";

it("loads the layout correctly", async () => {
    render(<CustomError statusCode={404} />);

    expect(screen.getByRole("link", { name: /skip to content/i })).toBeEnabled();
    expect(await screen.findByRole("img", { name: /logo/i })).toBeVisible();
    expect(screen.getByRole("button", { name: /toggle color mode/i })).toBeEnabled();
    expect(screen.getByRole("link", { name: /github/i })).toBeEnabled();
    expect(screen.getByText(/\xA9/)).toBeVisible();
});

it("renders a not found message on 404 code", () => {
    render(<CustomError statusCode={404} />);
    expect(screen.getByText(/this page could not be found/i)).toBeVisible();
});

it("renders the correct status code", () => {
    const code = faker.random.number({ min: 400, max: 599 });
    render(<CustomError statusCode={code} />);
    expect(screen.getByText(code)).toBeVisible();
});
