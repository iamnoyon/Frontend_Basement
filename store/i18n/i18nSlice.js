import { createSlice } from "@reduxjs/toolkit";

export const SUPPORTED_LOCALES = ["en", "bn"];
export const LOCALE_STORAGE_KEY = "app_locale";
export const LOCALE_COOKIE_NAME = "app_locale";
export const DEFAULT_LOCALE = "en";

export const RTL_LOCALES = [];

const isSupported = (locale) =>
    typeof locale === "string" && SUPPORTED_LOCALES.includes(locale);

const safeStorage = {
    get(key) {
        if (typeof window === "undefined") return null;
        try {
            return window.localStorage.getItem(key);
        } catch {
            return null;
        }
    },
    set(key, value) {
        if (typeof window === "undefined") return;
        try {
            window.localStorage.setItem(key, value);
        } catch {
            // ignore storage access errors
        }
    },
};

const cookieApi = {
    get(name) {
        if (typeof document === "undefined") return null;
        const target = `${name}=`;
        const parts = document.cookie ? document.cookie.split(";") : [];
        for (const raw of parts) {
            const cookie = raw.trim();
            if (cookie.startsWith(target)) {
                return decodeURIComponent(cookie.slice(target.length));
            }
        }
        return null;
    },
    set(name, value, { expires = 365 } = {}) {
        if (typeof document === "undefined") return;
        const maxAge = 60 * 60 * 24 * expires;
        document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAge}; SameSite=Lax`;
    },
};

const initialState = {
    locale: DEFAULT_LOCALE,
};

const i18nSlice = createSlice({
    name: "i18n",
    initialState,
    reducers: {
        setLocale: (state, action) => {
            const next = isSupported(action.payload) ? action.payload : DEFAULT_LOCALE;
            state.locale = next;
            safeStorage.set(LOCALE_STORAGE_KEY, next);
            cookieApi.set(LOCALE_COOKIE_NAME, next, { expires: 365 });
        },
        hydrateLocale: (state) => {
            if (typeof window === "undefined") return;
            const fromStorage = safeStorage.get(LOCALE_STORAGE_KEY);
            const fromCookie = cookieApi.get(LOCALE_COOKIE_NAME);
            const candidate = isSupported(fromStorage)
                ? fromStorage
                : isSupported(fromCookie)
                ? fromCookie
                : DEFAULT_LOCALE;
            state.locale = candidate;
        },
    },
});

export const { setLocale, hydrateLocale } = i18nSlice.actions;

export const selectLocale = (state) => state.i18n.locale;

export default i18nSlice.reducer;