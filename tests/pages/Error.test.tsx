import { render, screen } from "@testing-library/react";
import faker from "faker";
import Error from "next/error";

it("renders a not found message on 404 code", () => {
    render(<Error statusCode={404} />);
    expect(screen.getByText(/this page could not be found/i)).toBeVisible();
});

it("renders the correct status code", () => {
    const code = faker.random.number({ min: 100, max: 599 });
    render(<Error statusCode={code} />);
    expect(screen.getByText(code)).toBeVisible();
});
