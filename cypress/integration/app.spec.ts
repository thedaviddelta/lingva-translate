/// <reference types="cypress" />

import faker from "faker";

beforeEach(() => {
    cy.visit("/");
});

it("switches page correctly on inputs change", () => {
    cy.findByRole("textbox", { name: /query/i })
        .type("palabra");
    cy.findByText("word")
        .url()
        .should("include", "/auto/en/palabra");
    cy.findByRole("combobox", { name: /source/i })
        .select("es")
        .url()
        .should("include", "/es/en/palabra");
    cy.findByRole("combobox", { name: /target/i })
        .select("ca");
    cy.findByText("paraula")
        .url()
        .should("include", "/es/ca/palabra");
});

it("switches first loaded page on language change", () => {
    const query = faker.random.words();
    cy.visit(`/auto/en/${query}`);

    cy.findByRole("textbox", { name: /query/i })
        .should("have.value", query);
    cy.findByRole("combobox", { name: /source/i })
        .select("eo")
        .url()
        .should("include", `/eo/en/${encodeURIComponent(query)}`);
});

it("doesn't switch initial page on language change", () => {
    cy.findByRole("combobox", { name: /source/i })
        .select("eo")
        .url()
        .should("not.include", "/eo");
});

it("language switching button is disable on 'auto', but enables when other", () => {
    cy.findByRole("button", { name: /switch languages/i })
        .as("btnSwitch")
        .should("be.disabled");
    cy.findByRole("combobox", { name: /source/i })
        .as("source")
        .select("eo")
        .get("@btnSwitch")
        .should("be.enabled")
        .click();
    cy.findByRole("combobox", { name: /target/i })
        .should("have.value", "eo")
        .get("@source")
        .should("have.value", "en");
});
