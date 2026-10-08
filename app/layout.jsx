import { Manrope } from "next/font/google";
import "./globals.css";
import ReduxProvider from "@/components/providers/ReduxProvider";
import LocalizationProvider from "@/components/providers/LocalizationProvider";
import { ToastContainer } from "react-toastify";
import SessionProvider from "@/components/providers/SessionProvider";
import { cookies } from "next/headers";
import { DEFAULT_LOCALE, RTL_LOCALES, SUPPORTED_LOCALES } from "@/store/i18n/i18nSlice";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
});

export const metadata = {
    title: "ধামরাই শারদীয় উৎসব ২০২৬ | Dhamrai Map",
    description:
        "Explore the map and locations of Dharmrai Sharadiya Utsav 2026, including unions, roads, and important places.",
};

export default async function RootLayout({ children }) {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get("app_locale")?.value;
  const initialLocale = SUPPORTED_LOCALES.includes(cookieLocale)
    ? cookieLocale
    : DEFAULT_LOCALE;
  const dir = RTL_LOCALES.includes(initialLocale) ? "rtl" : "ltr";

  return (
    <html lang={initialLocale} dir={dir} className={manrope.variable} data-scroll-behavior="smooth">
      <body className={manrope.className}>
        <SessionProvider>
          <ReduxProvider>
            <LocalizationProvider initialLocale={initialLocale}>
              {children}
            </LocalizationProvider>
          </ReduxProvider>
        </SessionProvider>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
        />
      </body>
    </html>
  );
}