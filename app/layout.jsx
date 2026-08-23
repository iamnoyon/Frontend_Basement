import { Manrope } from "next/font/google";
import "./globals.css";
import ReduxProvider from "@/components/providers/ReduxProvider";
import { ToastContainer } from "react-toastify";
import SessionProvider from "@/components/providers/SessionProvider";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
});

export const metadata = {
  title: "CloudCafe | Restaurant Management Platform",
  description:
    "CloudCafe is a complete restaurant management platform for managing orders, products, sales, customers, and business operations.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={manrope.variable} data-scroll-behavior="smooth">
      <body className={manrope.className}>
        <SessionProvider>
          <ReduxProvider>{children}</ReduxProvider>
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
