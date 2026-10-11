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

const SITE_TITLE = "ধামরাই শারদীয় উৎসব ২০২৬ | Dhamrai Map";
const SITE_DESCRIPTION =
  "Explore the map and locations of Dhamrai Sharadiya Utsav 2026, including unions, roads, and important places.";
// Public address of this site. Facebook/WhatsApp need absolute URLs for the shared link and preview image.
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://dhamrai.systems.bd";

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  alternates: { canonical: "/" },
  // Link previews on Facebook, WhatsApp, Messenger, LinkedIn, etc. The preview image is app/opengraph-image.jpg
  // (1200x630, alt text in opengraph-image.alt.txt); Next.js adds it to og:image / twitter:image.
  openGraph: {
    type: "website",
    url: "/",
    siteName: "Dhamrai Map",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    locale: "bn_BD",
    alternateLocale: ["en_US"],

    images: [
      {
        url: `${SITE_URL}/durga.jpg`,
        width: 200,
        height: 200,
        type: 'image/jpeg',
        alt: 'Dhamrai Map',
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  icons: {
    icon: "/durga_icon.ico",
    shortcut: "/durga_icon.ico",
  },
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