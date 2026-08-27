import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { getSession } from "@/lib/auth";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  const isCustomer = session?.role === "customer";

  return (
    <>
      <Navbar isLoggedIn={isCustomer} />
      {children}
      <Footer />
    </>
  );
}