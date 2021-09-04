// LocalStorage throws an error if all browser cookies are disabled

export function localGetItem(key: string) {
    try {
        return localStorage.getItem(key);
    } catch (e) {
        return null;
    }
}

export function localSetItem(key: string, value: string) {
    try {
        localStorage.setItem(key, value);
    } catch (e) { }
}
