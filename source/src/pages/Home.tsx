import { useState } from "react";
import { Link } from "react-router";
import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Play, Loader2 } from "lucide-react";
import SmartVideo from "@/components/SmartVideo";
import { trpc } from "@/providers/trpc";
import { usePageContent } from "@/hooks/usePageContent";

/* ─────────────── DATA ─────────────── */

const categories = [
  { name: "Hoodies", img: "/images/hoodies and sweatshirts.webp", hover: "/images/hoodies and sweatshirts.webp", slug: "hoodies" },
  { name: "T-Shirts", img: "/images/t-shirts.webp", hover: "/images/t-shirts.webp", slug: "t-shirts" },
  { name: "Jackets", img: "/images/jackets.webp", hover: "/images/jackets.webp", slug: "jackets" },
  { name: "Shorts", img: "/images/shorts.webp", hover: "/images/shorts.webp", slug: "shorts" },
  { name: "Pants", img: "/images/pants.webp", hover: "/images/pants.webp", slug: "pants" },
  { name: "Tracksuits", img: "/images/tracksuit.webp", hover: "/images/tracksuit.webp", slug: "tracksuits" },
];

const seasons = [
  { name: "Spring", img: "/images/season-spring.webp" },
  { name: "Summer", img: "/images/season-summer.webp" },
  { name: "Autumn", img: "/images/season-autumn.webp" },
  { name: "Winter", img: "/images/season-winter.webp" },
];

const faqs = [
  { q: "Our response time?", a: "We typically respond to all inquiries within 24 hours during business days." },
  { q: "What's your payment terms?", a: "We accept T/T, L/C, and Western Union. 30% deposit, 70% before shipment." },
  { q: "What's the production lead time?", a: "Standard production lead time is 15-25 days depending on order quantity." },
  { q: "What's your sample policy?", a: "Sample lead time is 3-7 days. Sample fee is refundable upon bulk order." },
  { q: "Can I put my design logo on the items?", a: "Yes, we specialize in custom OEM/ODM manufacturing with your own designs and logos." },
];

/* ─────────────── HOME PAGE ─────────────── */

export default function Home() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);
  const [hoveredCat, setHoveredCat] = useState<number | null>(null);

  const { data: portfolioProducts, isLoading: portfolioLoading } = trpc.product.list.useQuery();
  const { cms, cmsMobile } = usePageContent("home");

  return (
    <>
      {/* ═══════ HERO ═══════ */}
      <section className="relative w-full bg-black overflow-hidden">
        <div className="h-[50vh] min-h-[400px] md:h-[720px]">
          {/* Desktop image */}
          <img
            src={cms("hero-banner", "/images/banner.webp")}
            alt="Premium Streetwear Manufacturer"
            className="hidden md:block h-full w-full object-cover"
            decoding="async"
            loading="eager"
          />
          {/* Mobile image — uses mobileContent if set, otherwise falls back to desktop */}
          <img
            src={cmsMobile("hero-banner", "/images/banner.webp")}
            alt="Premium Streetwear Manufacturer"
            className="md:hidden h-full w-full object-cover"
            decoding="async"
            loading="eager"
          />
        </div>
      </section>

      {/* ═══════ CATEGORIES — DARK ═══════ */}
      <section className="py-20 bg-[#0a0a0a] overflow-hidden">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-14">
            <p className="text-sm tracking-[0.35em] text-amber-400 uppercase mb-3">Our Specialties</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white">Popular Categories</h2>
            <div className="w-16 h-0.5 bg-amber-400 mx-auto mt-4" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
            {categories.map((cat, i) => (
              <Link
                to={`/products?category=${cat.slug}`}
                key={cat.slug}
                className="group relative aspect-[16/10] rounded-xl overflow-hidden border border-white/5"
                onMouseEnter={() => setHoveredCat(i)}
                onMouseLeave={() => setHoveredCat(null)}
              >
                <img
                  src={hoveredCat === i ? cat.hover : cat.img}
                  alt={cat.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                <div className="absolute bottom-4 left-5">
                  <span className="text-xs text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 block">View designs &rarr;</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ WHY VEKKST — DARK HTML ═══════ */}
      <section className="py-20 bg-[#0a0a0a] overflow-hidden">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-14">
            <p className="text-base tracking-[0.35em] text-amber-400 uppercase mb-3">Why Us</p>
            <h2 className="text-4xl md:text-5xl font-bold text-white">Why VEKKST</h2>
            <div className="w-16 h-0.5 bg-amber-400 mx-auto mt-4" />
          </div>
          <div className="grid md:grid-cols-5 gap-4">
            {[
              { num: "01", title: "HEAVYWEIGHT EXPERTISE", items: ["400-550 GSM Hoodies", "16+ Print & Embroidery Techniques", "9+ Specialty Washes"], icon: (
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
              )},
              { num: "02", title: "BUILT FOR INDEPENDENT BRANDS", items: ["256 Professionals", "3-7 Day Sampling", "3,600+ m2 Factory", "300K-450K+ PCS / Month"], icon: (
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
              )},
              { num: "03", title: "TRUSTED COMPLIANCE", items: ["TUV Rheinland Verified", "BSCI & AZO FREE", "100% On-Time Delivery", "4.8/5 Rating"], icon: (
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
              )},
              { num: "04", title: "COOPERATION TERMS", items: ["100% OEM/ODM", "MOQ 60 pcs", "15-25 Days Bulk", "Custom Labels & Packaging"], icon: (
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/></svg>
              )},
              { num: "05", title: "GLOBAL STREETWEAR PARTNER", items: ["Serving 1100+ Global Brands", "Fast Communication", "Trend-Driven Development", "Long-Term Brand Growth"], icon: (
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              )},
            ].map((pillar) => (
              <div key={pillar.num} className="bg-[#161616] border border-white/5 rounded-xl p-6 hover:border-amber-400/30 transition-colors">
                <div className="text-amber-400 mb-4">{pillar.icon}</div>
                <div className="text-amber-400 text-sm font-bold mb-2">{pillar.num}</div>
                <h3 className="text-white text-base font-bold mb-4 leading-tight">{pillar.title}</h3>
                <ul className="space-y-2">
                  {pillar.items.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-gray-400">
                      <span className="text-amber-400 mt-0.5">&#10003;</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          {/* Quote/Sample/Bulk bar */}
          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#161616] border border-white/5 rounded-xl p-6 flex items-center gap-4">
              <div className="w-14 h-14 bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">QUOTE IN 24 HOURS</div>
                <div className="text-sm text-gray-500">Fast Response. Clear Solutions.</div>
              </div>
            </div>
            <div className="bg-[#161616] border border-white/5 rounded-xl p-6 flex items-center gap-4">
              <div className="w-14 h-14 bg-purple-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/></svg>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">SAMPLE IN 3-7 DAYS</div>
                <div className="text-sm text-gray-500">Ready to Build Together.</div>
              </div>
            </div>
            <div className="bg-[#161616] border border-white/5 rounded-xl p-6 flex items-center gap-4">
              <div className="w-14 h-14 bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">BULK IN 15-25 DAYS</div>
                <div className="text-sm text-gray-500">Reliable Production Timeline.</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ FACTORY STRENGTH — WHITE BG ═══════ */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-6">
            <p className="text-sm tracking-[0.35em] text-amber-600 uppercase mb-3">Our Facility</p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Factory Strength</h2>
            <div className="w-16 h-0.5 bg-amber-400 mx-auto mt-4" />
          </div>
        </div>
        <div className="max-w-[1920px] mx-auto overflow-hidden w-full">
          {/* Desktop image */}
          <img src={cms("factory-strength", "/images/Factory Strength.webp")} alt="Factory Strength" className="hidden md:block w-full h-auto md:h-[720px] object-cover" decoding="async" loading="lazy" />
          {/* Mobile image */}
          <img src={cmsMobile("factory-strength", "/images/Factory Strength.webp")} alt="Factory Strength" className="md:hidden w-full h-auto object-cover" decoding="async" loading="lazy" />
        </div>
      </section>

      {/* ═══════ CRAFTSMANSHIP — WHITE BG ═══════ */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-6">
            <p className="text-sm tracking-[0.35em] text-amber-600 uppercase mb-3">Techniques</p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Logo Rich Technology</h2>
            <div className="w-16 h-0.5 bg-amber-400 mx-auto mt-4" />
          </div>
        </div>
        <div className="max-w-[1920px] mx-auto overflow-hidden w-full">
          {/* Desktop image */}
          <img src={cms("logo-rich-technology", "/images/Logo Rich Technology.webp")} alt="16+ Printing and Embroidery Techniques" className="hidden md:block w-full h-auto md:h-[720px] object-cover" decoding="async" loading="lazy" />
          {/* Mobile image */}
          <img src={cmsMobile("logo-rich-technology", "/images/Logo Rich Technology.webp")} alt="16+ Printing and Embroidery Techniques" className="md:hidden w-full h-auto object-cover" decoding="async" loading="lazy" />
        </div>
      </section>

      {/* ═══════ FABRIC — WHITE BG ═══════ */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-6">
            <p className="text-sm tracking-[0.35em] text-amber-600 uppercase mb-3">Materials</p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Premium Custom Fabric</h2>
            <div className="w-16 h-0.5 bg-amber-400 mx-auto mt-4" />
          </div>
        </div>
        <div className="max-w-[1920px] mx-auto overflow-hidden w-full">
          {/* Desktop image */}
          <img src={cms("premium-fabric", "/images/Premium Custom Fabric.webp")} alt="Custom Fabric Options" className="hidden md:block w-full h-auto md:h-[720px] object-cover" decoding="async" loading="lazy" />
          {/* Mobile image */}
          <img src={cmsMobile("premium-fabric", "/images/Premium Custom Fabric.webp")} alt="Custom Fabric Options" className="md:hidden w-full h-auto object-cover" decoding="async" loading="lazy" />
        </div>
      </section>

      {/* ═══════ SUPPLY CHAIN — WHITE BG ═══════ */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-6">
            <p className="text-sm tracking-[0.35em] text-amber-600 uppercase mb-3">Process</p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">From Idea to Bulk</h2>
            <div className="w-16 h-0.5 bg-amber-400 mx-auto mt-4" />
          </div>
        </div>
        <div className="max-w-[1920px] mx-auto overflow-hidden w-full">
          {/* Desktop image */}
          <img src={cms("supply-chain", "/images/From Idea to Bulk.webp")} alt="From Idea to Bulk - 8 Step Process" className="hidden md:block w-full h-auto md:h-[720px] object-cover" decoding="async" loading="lazy" />
          {/* Mobile image */}
          <img src={cmsMobile("supply-chain", "/images/From Idea to Bulk.webp")} alt="From Idea to Bulk - 8 Step Process" className="md:hidden w-full h-auto object-cover" decoding="async" loading="lazy" />
        </div>
      </section>

      {/* ═══════ PARTNER BRANDS — WHITE BG ═══════ */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-6">
            <p className="text-sm tracking-[0.35em] text-amber-600 uppercase mb-3">Partners</p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Trusted by 1100+ Brands</h2>
            <div className="w-16 h-0.5 bg-amber-400 mx-auto mt-4" />
          </div>
        </div>
        <div className="max-w-[1920px] mx-auto overflow-hidden w-full">
          {/* Desktop image */}
          <img src={cms("partner-brands", "/images/Trusted by 1100+ Brands.webp")} alt="Trusted by 1100+ Global Streetwear Brands" className="hidden md:block w-full h-auto md:h-[720px] object-cover" decoding="async" loading="lazy" />
          {/* Mobile image */}
          <img src={cmsMobile("partner-brands", "/images/Trusted by 1100+ Brands.webp")} alt="Trusted by 1100+ Global Streetwear Brands" className="md:hidden w-full h-auto object-cover" decoding="async" loading="lazy" />
        </div>
      </section>

      {/* ═══════ CERTIFICATES — WHITE BG ═══════ */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-6">
            <p className="text-sm tracking-[0.35em] text-amber-600 uppercase mb-3">Quality Assurance</p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Certifications & Compliance</h2>
            <div className="w-16 h-0.5 bg-amber-400 mx-auto mt-4" />
          </div>
        </div>
        <div className="max-w-[1920px] mx-auto overflow-hidden w-full">
          {/* Desktop image */}
          <img src={cms("certifications", "/images/Certifications & Compliance.webp")} alt="Certifications and Compliance" className="hidden md:block w-full h-auto md:h-[720px] object-cover" decoding="async" loading="lazy" />
          {/* Mobile image */}
          <img src={cmsMobile("certifications", "/images/Certifications & Compliance.webp")} alt="Certifications and Compliance" className="md:hidden w-full h-auto object-cover" decoding="async" loading="lazy" />
        </div>
      </section>

      {/* ═══════ SEASONS — DARK ═══════ */}
      <section className="py-20 bg-[#0a0a0a] overflow-hidden">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-14">
            <p className="text-sm tracking-[0.35em] text-amber-400 uppercase mb-3">Collections</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white">Select by Season</h2>
            <div className="w-16 h-0.5 bg-amber-400 mx-auto mt-4" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {seasons.map((s) => (
              <Link to={`/products?season=${s.name.toLowerCase()}`} key={s.name} className="group relative aspect-[3/4] rounded-xl overflow-hidden border border-white/5">
                <img src={s.img} alt={s.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <h3 className="text-lg font-bold text-white">{s.name}</h3>
                  <span className="text-xs text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity">Explore &rarr;</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ PORTFOLIO PRODUCTS — DARK ═══════ */}
      <section className="py-20 bg-[#0f0f0f] overflow-hidden">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-14">
            <p className="text-sm tracking-[0.35em] text-amber-400 uppercase mb-3">Portfolio</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white">Design Portfolio</h2>
            <div className="w-16 h-0.5 bg-amber-400 mx-auto mt-4" />
            <p className="text-gray-400 mt-4 text-sm max-w-xl mx-auto">Browse our styles for inspiration. Request a quote for any design.</p>
          </div>

          {portfolioLoading && (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
            </div>
          )}

          {!portfolioLoading && (!portfolioProducts || portfolioProducts.length === 0) && (
            <div className="text-center py-10 text-gray-500">
              <p className="text-lg mb-2">No products yet</p>
              <p className="text-sm">Products will appear here once uploaded via the admin panel.</p>
            </div>
          )}

          {!portfolioLoading && portfolioProducts && portfolioProducts.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {portfolioProducts.slice(0, 8).map((p) => (
                <div key={p.id} className="group bg-[#161616] rounded-xl overflow-hidden border border-white/5 hover:border-amber-400/30 transition-all">
                  <div className="relative aspect-square">
                    <Link to={`/product/${p.id}`}><img src={p.image} alt={p.name} className="w-full h-full object-cover" loading="lazy" onError={(e) => { (e.target as HTMLImageElement).src = "/images/placeholder.webp"; }} /></Link>
                    <Link to={`/product/${p.id}`} className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="bg-amber-400 text-black px-4 py-2 rounded-full text-sm font-medium">View Details</span>
                    </Link>
                  </div>
                  <div className="p-3">
                    <span className="text-xs text-gray-500 uppercase">{p.category}</span>
                    <h3 className="text-sm font-semibold text-white mt-1 truncate">{p.name}</h3>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-10">
            <Link to="/products" className="inline-block border border-amber-400 text-amber-400 hover:bg-amber-400 hover:text-black px-8 py-3 rounded-full font-medium transition-all text-sm">View All Designs</Link>
          </div>
        </div>
      </section>

      {/* ═══════ VIDEO — DARK ═══════ */}
      <section className="py-20 bg-[#0a0a0a] overflow-hidden">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-14">
            <p className="text-sm tracking-[0.35em] text-amber-400 uppercase mb-3">Showcase</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white">Our Factory in Action</h2>
            <div className="w-16 h-0.5 bg-amber-400 mx-auto mt-4" />
          </div>
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <p className="text-gray-300 text-lg leading-relaxed">More than 15 years of experience in menswear manufacturing and international trade.</p>
              <div className="mt-8 space-y-4 text-sm text-gray-400">
                {["Professional design and sampling team", "Advanced production equipment and technology", "Strict quality control system", "Fast delivery and excellent after-sales service"].map((item) => (
                  <p key={item} className="flex items-start gap-3"><span className="text-amber-400 mt-0.5 text-lg">&#10003;</span><span>{item}</span></p>
                ))}
              </div>
              <Link to="/quote" className="inline-flex items-center gap-2 mt-8 bg-amber-400 hover:bg-amber-500 text-black px-8 py-3 rounded-full font-medium transition-colors">
                <Play className="w-4 h-4" /> Request a Factory Tour
              </Link>
            </div>
            <div className="rounded-2xl overflow-hidden shadow-2xl border border-white/5 bg-black">
              <SmartVideo src={cms("factory-tour-1", "/videos/factory-overview-v2.mp4")} className="w-full aspect-video object-cover" poster="/images/choose1.webp" />
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ WHY CHOOSE US (features) — DARK ═══════ */}
      <section className="py-20 bg-[#0a0a0a] overflow-hidden">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-14">
            <p className="text-sm tracking-[0.35em] text-amber-400 uppercase mb-3">Advantages</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white">Why Choose Us</h2>
            <div className="w-16 h-0.5 bg-amber-400 mx-auto mt-4" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Customized design capabilities", icon: "/images/A1.webp", hover: "/images/A2.webp" },
              { label: "Professional QC quality inspection", icon: "/images/B1.webp", hover: "/images/B2.webp" },
              { label: "Flexible supply chain", icon: "/images/C1.webp", hover: "/images/C3.webp" },
              { label: "Global market layout", icon: "/images/D1.webp", hover: "/images/D2.webp" },
              { label: "Digital innovation", icon: "/images/E1.webp", hover: "/images/E2.webp" },
              { label: "Strengthening local services", icon: "/images/F1.webp", hover: "/images/F2.webp" },
              { label: "Sustainable development", icon: "/images/G1.webp", hover: "/images/G2.webp" },
              { label: "Humanistic care and team stability", icon: "/images/H1.webp", hover: "/images/H2.webp" },
            ].map((f, i) => (
              <div
                key={f.label}
                className="rounded-xl overflow-hidden cursor-pointer border border-white/5 hover:border-amber-400/30 transition-all"
                onMouseEnter={() => setHoveredFeature(i)}
                onMouseLeave={() => setHoveredFeature(null)}
              >
                <img src={hoveredFeature === i ? f.hover : f.icon} alt={f.label} className="w-full aspect-square object-cover" loading="lazy" />
                <p className="text-xs text-center text-gray-400 py-3 px-2 bg-[#161616]">{f.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ VIDEO 2 — DARK ═══════ */}
      <section className="py-20 bg-[#0f0f0f] overflow-hidden">
        <div className="max-w-7xl mx-auto px-4">
          <div className="mb-8">
            <p className="text-sm tracking-[0.35em] text-amber-400 uppercase mb-3">Behind the Scenes</p>
            <h2 className="text-4xl font-bold text-white uppercase mb-4">Factory Tour</h2>
            <p className="text-gray-400 max-w-md">See our production process and quality standards in action.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-end justify-center md:justify-start">
              <SmartVideo src={cms("factory-tour-left", "/videos/video-tour.mp4")} className="w-full md:max-w-[360px] aspect-video md:aspect-[9/16] object-cover rounded-2xl shadow-2xl border border-white/5 bg-black" poster="/images/factory-machine.webp" />
            </div>
            <div className="space-y-4">
              <SmartVideo src={cms("factory-tour-2", "/videos/video-factory.mp4")} className="w-full aspect-video object-cover rounded-2xl shadow-2xl border border-white/5 bg-black" poster="/images/showroom.webp" />
              <p className="text-gray-400 text-sm leading-relaxed">
                We strictly select high-quality fabrics, such as breathable and skin-friendly cotton materials, 
                and high-tech functional materials, combined with exquisite workmanship, and strictly control 
                every stitch and every detail.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ FAQ — DARK ═══════ */}
      <section className="py-20 bg-[#0f0f0f] overflow-hidden">
        <div className="max-w-3xl mx-auto px-4">
          <div className="text-center mb-14">
            <p className="text-sm tracking-[0.35em] text-amber-400 uppercase mb-3">Support</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white">Frequently Asked Questions</h2>
            <div className="w-16 h-0.5 bg-amber-400 mx-auto mt-4" />
          </div>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="border border-white/5 rounded-xl bg-[#161616] overflow-hidden">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between p-5 text-left hover:bg-white/5 transition-colors">
                  <span className="font-medium text-white text-sm">{faq.q}</span>
                  {openFaq === i ? <ChevronUp className="w-4 h-4 text-amber-400 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-500 flex-shrink-0" />}
                </button>
                {openFaq === i && <div className="px-5 pb-5 text-sm text-gray-400">{faq.a}</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ CTA — DARK ═══════ */}
      <section className="py-24 bg-gradient-to-br from-[#0a0a0a] via-[#1a1200] to-[#0a0a0a] overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-sm tracking-[0.35em] text-amber-400 uppercase mb-3">Start Today</p>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Ready to Build Your Brand?</h2>
          <p className="text-gray-400 mb-10 max-w-xl mx-auto">Get a free quote within 24 hours. Low MOQ from 60 pieces. Custom samples in 3-7 days.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/quote" className="inline-block bg-amber-400 hover:bg-amber-500 text-black px-10 py-4 rounded-full font-semibold transition-colors">Get a Free Quote</Link>
            <a href="https://wa.me/8613125204154" target="_blank" rel="noopener noreferrer" className="inline-block border border-amber-400 text-amber-400 hover:bg-amber-400 hover:text-black px-10 py-4 rounded-full font-semibold transition-all">WhatsApp Us</a>
          </div>
        </div>
      </section>
    </>
  );
}
