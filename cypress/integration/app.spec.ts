/// <reference types="cypress" />

import faker from "faker";

beforeEach(() => {
    cy.visit("/");
});

it("switches page correctly on inputs change", () => {
    cy.findByRole("textbox", { name: /translation query/i })
        .as("query")
        .type("palabra");
    cy.findByRole("textbox", { name: /translation result/i })
        .as("translation")
        .should("have.value", "word")
        .url()
        .should("include", "/auto/en/palabra");
    cy.findByRole("combobox", { name: /source language/i })
        .as("source")
        .select("es")
        .url()
        .should("include", "/es/en/palabra");
    cy.findByRole("combobox", { name: /target language/i })
        .as("target")
        .select("ca")
        .get("@translation")
        .should("have.value", "paraula")
        .url()
        .should("include", "/es/ca/palabra");
    cy.findByRole("button", { name: /switch languages/i })
        .click()
        .get("@source")
        .should("have.value", "ca")
        .get("@target")
        .should("have.value", "es")
        .get("@query")
        .should("have.value", "paraula")
        .get("@translation")
        .should("have.value", "palabra")
        .url()
        .should("include", "/ca/es/paraula");
});

it("switches first loaded page and back and forth on language change", () => {
    const query = faker.random.words();
    cy.visit(`/auto/en/${query}`);

    cy.findByRole("textbox", { name: /translation query/i })
        .should("have.value", query);
    cy.findByRole("combobox", { name: /source language/i })
        .as("source")
        .select("eo")
        .url()
        .should("include", `/eo/en/${encodeURIComponent(query)}`)
        .get("@source")
        .select("auto")
        .url()
        .should("include", `/auto/en/${encodeURIComponent(query)}`);
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
