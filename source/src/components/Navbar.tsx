import { useState } from "react";
import { Link, useLocation } from "react-router";
import { Menu, X, Globe } from "lucide-react";
import { useLanguage } from "@/providers/LanguageProvider";
import { languages, t, type Language } from "@/lib/translations";

interface NavbarProps {
  onQuoteClick: () => void;
}

const navLinks = (language: Language) => [
  { label: t("home", language).toUpperCase(), path: "/" },
  { label: t("about", language).toUpperCase(), path: "/about" },
  { label: t("products", language).toUpperCase(), path: "/products" },
  { label: t("customerReviews", language).toUpperCase(), path: "/customer-reviews" },
  { label: t("trackQuote", language).toUpperCase(), path: "/track-quote" },
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
    <nav className="fixed top-8 left-0 right-0 bg-[#0a0a0a]/95 backdrop-blur-sm border-b border-white/5 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <img src="/images/vekkst-logo.webp" alt="VEKKST" className="h-12 w-auto" />
            <span className="text-lg font-bold tracking-wider text-white">VEKKST</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {links.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-xs font-medium tracking-wider transition-colors ${isActive(link.path) ? "text-amber-400" : "text-gray-400 hover:text-white"}`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Side */}
          <div className="hidden md:flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Globe className="w-3.5 h-3.5 text-gray-500" />
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value as Language)}
                className="bg-transparent text-xs text-gray-500 hover:text-amber-400 transition-colors border-none focus:outline-none cursor-pointer"
              >
                {languages.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.flag} {l.name}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={onQuoteClick}
              className="bg-amber-400 hover:bg-amber-500 text-black text-xs font-semibold px-5 py-2 rounded-full transition-colors"
            >
              {t("getFreeQuote", lang)}
            </button>
            <Link to="/login" className="text-xs font-medium text-gray-400 hover:text-white transition-colors">
              {t("signIn", lang)}
            </Link>
          </div>

          {/* Mobile Hamburger */}
          <button className="md:hidden text-white p-3 -mr-3 min-h-[48px] min-w-[48px] flex items-center justify-center" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-[#0a0a0a] border-t border-white/5 shadow-lg">
          <div className="px-4 py-3 space-y-1">
            {links.map((link) => (
              <Link key={link.path} to={link.path} onClick={() => setMobileOpen(false)}
                className={`block py-3 min-h-[48px] flex items-center text-sm font-medium ${isActive(link.path) ? "text-amber-400" : "text-gray-400"}`}>
                {link.label}
              </Link>
            ))}
            <div className="pt-2 border-t border-white/5 mt-2 space-y-2">
              {/* Mobile Language Selector */}
              <div className="flex items-center gap-2 px-1 py-2">
                <Globe className="w-4 h-4 text-gray-500" />
                <select
                  value={lang}
                  onChange={(e) => setLang(e.target.value as Language)}
                  className="bg-[#161616] text-gray-400 text-sm border border-white/10 rounded-lg px-2 py-1.5 focus:outline-none focus:border-amber-400"
                >
                  {languages.map((l) => (
                    <option key={l.code} value={l.code}>
                      {l.flag} {l.name}
                    </option>
                  ))}
                </select>
              </div>
              <button onClick={() => { onQuoteClick(); setMobileOpen(false); }} className="w-full bg-amber-400 text-black text-sm font-semibold py-2.5 rounded-full">
                {t("getFreeQuote", lang)}
              </button>
              <Link to="/login" onClick={() => setMobileOpen(false)} className="block text-sm text-center text-gray-500">{t("signIn", lang)}</Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
