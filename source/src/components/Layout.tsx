import { useState } from "react";
import { useNavigate } from "react-router";
import Navbar from "./Navbar";
import Footer from "./Footer";
import QuoteModal from "./QuoteModal";
import { useAuth } from "@/hooks/useAuth";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [quoteProductRef, setQuoteProductRef] = useState<string>("");
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const openQuote = (productRef?: string) => {
    if (!isAuthenticated) {
      navigate("/login?redirect=/quote");
      return;
    }
    setQuoteProductRef(productRef || "");
    setShowQuoteModal(true);
  };

  return (
    <div className="min-h-[100dvh] flex flex-col bg-white overflow-x-hidden">
      <Navbar onQuoteClick={() => openQuote()} />
      <main className="flex-1 pt-[calc(3.5rem+2.5rem)]">{children}</main>
      <Footer />
      {showQuoteModal && (
        <QuoteModal
          productRef={quoteProductRef}
          onClose={() => setShowQuoteModal(false)}
        />
      )}
    </div>
  );
}

export type { LayoutProps };
