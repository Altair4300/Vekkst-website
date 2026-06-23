import { useState } from "react";
import TopBar from "./TopBar";
import Navbar from "./Navbar";
import Footer from "./Footer";
import QuoteModal from "./QuoteModal";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [quoteProductRef, setQuoteProductRef] = useState<string>("");

  const openQuote = (productRef?: string) => {
    setQuoteProductRef(productRef || "");
    setShowQuoteModal(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white overflow-x-hidden">
      <TopBar />
      <Navbar onQuoteClick={() => openQuote()} />
      <main className="flex-1 pt-[112px]">{children}</main>
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
