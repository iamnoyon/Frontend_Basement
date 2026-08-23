import "../globals.css";
import AdminLayout from "@/components/layouts/AdminLayout";
import ReduxProvider from "@/components/providers/ReduxProvider";
import SessionSync from "@/components/providers/SessionSync";
import "@/components/Receipt/ReceiptPrint.css";

export const metadata = {
  title: "CloudCafe | Restaurant Management Platform",
  description:
    "CloudCafe is a complete restaurant management platform for managing orders, products, sales, customers, and business operations.",
};

export default function AdminRootLayout({
    children,
}) {
    return (
        <ReduxProvider>
            <SessionSync />
            <AdminLayout>
                {children}
            </AdminLayout>
        </ReduxProvider>
    );
}
