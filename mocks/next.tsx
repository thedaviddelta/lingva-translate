import { FC, PropsWithChildren } from "react";
import { RouterContext } from "next/dist/shared/lib/router-context";

export const routerMock = {
    basePath: "",
    pathname: "/",
    route: "/",
    asPath: "/",
    query: {},
    push: jest.fn().mockResolvedValue(true),
    replace: jest.fn().mockResolvedValue(true),
    reload: jest.fn(),
    back: jest.fn(),
    prefetch: jest.fn().mockResolvedValue(undefined),
    beforePopState: jest.fn(),
    events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
    },
    isFallback: false,
    isLocaleDomain: false,
    isReady: false,
    isPreview: false
};

export const RouterProviderMock: FC<PropsWithChildren> = ({ children }) => (
    <RouterContext.Provider value={routerMock}>
        {children}
    </RouterContext.Provider>
);
