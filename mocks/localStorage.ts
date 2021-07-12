Object.defineProperty(window, "localStorage", {
    value: {
        getItem: jest.fn(() => null),
        setItem: jest.fn(() => null)
    },
    writable: true
});

export const localStorageSetMock = window.localStorage.setItem;
