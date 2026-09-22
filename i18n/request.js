import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";

export const SUPPORTED_LOCALES = ["en", "bn"];
export const DEFAULT_LOCALE = "en";
const NAMESPACES = ["landingPage"];

export default getRequestConfig(async () => {
    const cookieStore = await cookies();
    const requested = cookieStore.get("app_locale")?.value;
    const locale = SUPPORTED_LOCALES.includes(requested)
        ? requested
        : DEFAULT_LOCALE;

    const entries = await Promise.all(
        NAMESPACES.map(async (namespace) => {
            const mod = await import(`@/messages/${locale}/${namespace}.json`);
            return [namespace, mod.default];
        })
    );

    return {
        locale,
        messages: Object.fromEntries(entries),
    };
});