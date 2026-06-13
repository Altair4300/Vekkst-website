import { useState } from "react";
import { Link, useLocation } from "react-router";
import { Menu, X, Globe } from "lucide-react";

interface NavbarProps {
  onQuoteClick: () => void;
}

const navLinks = [
  { label: "HOME", path: "/" },
  { label: "ABOUT US", path: "/about" },
  { label: "PRODUCT", path: "/products" },
  { label: "TRACK QUOTE", path: "/track-quote" },
];

export default function Navbar({ onQuoteClick }: NavbarProps) {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [lang, setLang] = useState<"EN" | "CN">("EN");

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
            <img src="/images/es-logo.png" alt="ES" className="h-8 w-auto" />
            <span className="text-lg font-bold tracking-wider text-white">VEKKST</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
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
            <button
              onClick={() => setLang(lang === "EN" ? "CN" : "EN")}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-amber-400 transition-colors"
            >
              <Globe className="w-3.5 h-3.5" />
              {lang}
            </button>
            <button
              onClick={onQuoteClick}
              className="bg-amber-400 hover:bg-amber-500 text-black text-xs font-semibold px-5 py-2 rounded-full transition-colors"
            >
              Get Free Quote
            </button>
            <Link to="/login" className="text-xs font-medium text-gray-400 hover:text-white transition-colors">
              Sign In
            </Link>
          </div>

          {/* Mobile Hamburger */}
          <button className="md:hidden text-white" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-[#0a0a0a] border-t border-white/5 shadow-lg">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map((link) => (
              <Link key={link.path} to={link.path} onClick={() => setMobileOpen(false)}
                className={`block py-2 text-sm font-medium ${isActive(link.path) ? "text-amber-400" : "text-gray-400"}`}>
                {link.label}
              </Link>
            ))}
            <div className="pt-2 border-t border-white/5 mt-2 space-y-2">
              <button onClick={() => { onQuoteClick(); setMobileOpen(false); }} className="w-full bg-amber-400 text-black text-sm font-semibold py-2.5 rounded-full">
                Get Free Quote
              </button>
              <Link to="/login" onClick={() => setMobileOpen(false)} className="block text-sm text-center text-gray-500">Sign In</Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
