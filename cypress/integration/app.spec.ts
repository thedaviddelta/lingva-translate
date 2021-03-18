/// <reference types="cypress" />

import faker from "faker";

beforeEach(() => {
    cy.visit("/");
});

it("switches page correctly on inputs change", () => {
    cy.findByRole("textbox", { name: /translation query/i })
        .type("palabra");
    cy.findByRole("textbox", { name: /translation result/i })
        .as("translation")
        .should("have.value", "word")
        .url()
        .should("include", "/auto/en/palabra");
    cy.findByRole("combobox", { name: /source language/i })
        .select("es")
        .url()
        .should("include", "/es/en/palabra");
    cy.findByRole("combobox", { name: /target language/i })
        .select("ca");
    cy.get("@translation")
        .should("have.value", "paraula")
        .url()
        .should("include", "/es/ca/palabra");
});

it("switches first loaded page on language change", () => {
    const query = faker.random.words();
    cy.visit(`/auto/en/${query}`);

    cy.findByRole("textbox", { name: /translation query/i })
        .should("have.value", query);
    cy.findByRole("combobox", { name: /source language/i })
        .select("eo")
        .url()
        .should("include", `/eo/en/${encodeURIComponent(query)}`);
});

it("doesn't switch initial page on language change", () => {
    cy.findByRole("combobox", { name: /source language/i })
        .select("eo")
        .url()
        .should("not.include", "/eo");
});

it("language switching button is disable on 'auto', but enables when other", () => {
    cy.findByRole("button", { name: /switch languages/i })
        .as("btnSwitch")
        .should("be.disabled");
    cy.findByRole("combobox", { name: /source language/i })
        .as("source")
        .select("eo")
        .get("@btnSwitch")
        .should("be.enabled")
        .click();
    cy.findByRole("combobox", { name: /target language/i })
        .should("have.value", "eo")
        .get("@source")
        .should("have.value", "en");
});

it("toggles color mode on button click", () => {
    const white = "rgb(255, 255, 255)";
    cy.get("body")
        .should("have.css", "background-color", white);
    cy.findByRole("button", { name: /toggle color mode/i })
        .as("toggler")
        .click()
        .get("body")
        .should("not.have.css", "background-color", white);
    cy.get("@toggler")
        .click()
        .get("body")
        .should("have.css", "background-color", white);
});

it("skips to main on 'skip link' click", () => {
    cy.findByRole("link", { name: /skip to content/i })
        .focus()
        .click()
        .url()
        .should("include", "#main");
});

it("shows error on >4 params", () => {
    cy.visit(`/auto/en/translation/other`)
        .findByText(404);
});
