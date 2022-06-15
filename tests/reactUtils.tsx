import { FC, ReactElement, PropsWithChildren } from "react";
import { render, RenderOptions } from "@testing-library/react";
import { ChakraProvider } from "@chakra-ui/react";
import theme from "@theme";
import { Layout } from "@components";
import { RouterProviderMock } from "@mocks/next";

// Jest JSDOM bug
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
    })),
});

const Providers: FC<PropsWithChildren> = ({ children }) => (
    <RouterProviderMock>
        <ChakraProvider theme={theme}>
            <Layout>
                {children}
            </Layout>
        </ChakraProvider>
    </RouterProviderMock>
);

const customRender = (
    ui: ReactElement,
    options?: Omit<RenderOptions, "queries">
) => render(ui, { wrapper: Providers, ...options });

export * from "@testing-library/react";
export { customRender as render };
