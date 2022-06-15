const nextJest = require("next/jest");

const createJestConfig = nextJest({
    dir: "./"
});

module.exports = createJestConfig({
    testEnvironment: "jest-environment-jsdom",
    moduleNameMapper: {
        "^@(components|hooks|mocks|pages|public|tests|utils|theme)(.*)$": "<rootDir>/$1$2"
    },
    testPathIgnorePatterns: [
        '<rootDir>/cypress/'
    ],
    setupFilesAfterEnv: [
        "<rootDir>/tests/setupTests.ts"
    ]
});
