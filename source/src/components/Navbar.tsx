import { useState } from "react";
import { Link, useLocation } from "react-router";
import { Menu, X, Globe, ChevronDown } from "lucide-react";
import { useLanguage } from "@/providers/LanguageProvider";
import { languages, t, type Language } from "@/lib/translations";

interface NavbarProps {
  onQuoteClick: () => void;
}

const navLinks = (language: Language) => [
  { label: t("home", language), path: "/" },
  { label: t("about", language), path: "/about" },
  { label: t("products", language), path: "/products" },
  { label: t("customerReviews", language), path: "/customer-reviews" },
  { label: t("trackQuote", language), path: "/track-quote" },
];

export default function Navbar({ onQuoteClick }: NavbarProps) {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { lang, setLang } = useLanguage();
  const links = navLinks(lang);

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50">
      {/* Top bar */}
      <div className="bg-[#0a0a0a] border-b border-white/5">
        <div className="container-site">
          <div className="flex items-center justify-between h-10">
            <div className="flex items-center gap-4 text-xs text-gray-400">
              <span className="hidden sm:inline">info@vekkst.com</span>
              <span className="hidden sm:inline">|</span>
              <span>+86 134 2474 5515</span>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value as Language)}
                className="bg-transparent text-xs text-gray-400 border-none focus:outline-none cursor-pointer"
              >
                {languages.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.flag} {l.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main nav */}
      <div className="bg-[#0a0a0a]/95 backdrop-blur-md border-b border-white/5">
        <div className="container-site">
          <div className="flex items-center justify-between h-14">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 shrink-0">
              <img
                src="/images/vekkst-logo.webp"
                alt="VEKKST"
                className="h-8 w-auto md:h-10"
              />
              <span className="text-lg font-bold tracking-wider text-white hidden sm:inline">
                VEKKST
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-1">
              {links.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive(link.path)
                      ? "text-amber-400 bg-white/5"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Desktop CTA */}
            <div className="hidden lg:flex items-center gap-3">
              <button
                onClick={onQuoteClick}
                className="btn-primary text-xs py-2 px-4"
              >
                {t("getFreeQuote", lang)}
              </button>
              <Link
                to="/login"
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                {t("signIn", lang)}
              </Link>
            </div>

            {/* Mobile Hamburger - 48px touch target */}
            <button
              className="lg:hidden flex items-center justify-center w-12 h-12 text-white"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu - Full screen overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 top-[calc(3.5rem+2.5rem)] bg-[#0a0a0a]/98 backdrop-blur-lg z-40 overflow-y-auto">
          <div className="container-site py-6">
            <div className="space-y-1">
              {links.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileOpen(false)}
                  className={`block py-4 px-4 rounded-lg text-base font-medium transition-colors ${
                    isActive(link.path)
                      ? "text-amber-400 bg-white/5"
                      : "text-gray-300 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <div className="mt-6 pt-6 border-t border-white/10 space-y-4">
              <button
                onClick={() => {
                  onQuoteClick();
                  setMobileOpen(false);
                }}
                className="btn-primary w-full py-4"
              >
                {t("getFreeQuote", lang)}
              </button>
              <Link
                to="/login"
                onClick={() => setMobileOpen(false)}
                className="block text-center text-sm text-gray-400 py-3"
              >
                {t("signIn", lang)}
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
