import { useState } from "react";
import { Link } from "react-router";
import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Play, Loader2 } from "lucide-react";
import { t } from "@/lib/translations";
import { useLanguage } from "@/providers/LanguageProvider";
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

/* ─────────────── HOME PAGE ─────────────── */

export default function Home() {
  const { lang } = useLanguage();
  const faqs = [
    { q: t("faq1Q", lang), a: t("faq1A", lang) },
    { q: t("faq2Q", lang), a: t("faq2A", lang) },
    { q: t("faq3Q", lang), a: t("faq3A", lang) },
    { q: t("faq4Q", lang), a: t("faq4A", lang) },
    { q: t("faq5Q", lang), a: t("faq5A", lang) },
  ];
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);
  const [hoveredCat, setHoveredCat] = useState<number | null>(null);

  const { data: portfolioProducts, isLoading: portfolioLoading } = trpc.product.list.useQuery();
  const { cms } = usePageContent("home");

  return (
    <>
      {/* ═══════ HERO ═══════ */}
      <section className="relative w-full bg-black">
        <img
          src={cms("hero-banner", "/images/banner.webp")}
          alt={t("heroAlt", lang)}
          className="w-full h-auto block"
          decoding="async"
          loading="eager"
          fetchpriority="high"
        />
      </section>

      {/* ═══════ CATEGORIES ═══════ */}
      <section className="section bg-[#0a0a0a]">
        <div className="container-site">
          <div className="text-center mb-8 md:mb-14">
            <p className="section-subtitle text-amber-400 mb-3">{t("ourSpecialties", lang)}</p>
            <h2 className="section-title text-white">{t("popularCategories", lang)}</h2>
            <div className="w-16 h-0.5 bg-amber-400 mx-auto mt-4" />
          </div>
          <div className="grid-products">
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
                  <span className="text-xs text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 block">
                    {t("viewDesigns", lang)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ WHY VEKKST ═══════ */}
      <section className="section bg-[#0a0a0a]">
        <div className="container-site">
          <div className="text-center mb-8 md:mb-14">
            <p className="section-subtitle text-amber-400 mb-3">{t("whyUs", lang)}</p>
            <h2 className="section-title text-white">{t("whyVekkst", lang)}</h2>
            <div className="w-16 h-0.5 bg-amber-400 mx-auto mt-4" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { num: "01", title: t("pillar1Title", lang), items: [t("pillar1Item1", lang), t("pillar1Item2", lang), t("pillar1Item3", lang)] },
              { num: "02", title: t("pillar2Title", lang), items: [t("pillar2Item1", lang), t("pillar2Item2", lang), t("pillar2Item3", lang), t("pillar2Item4", lang)] },
              { num: "03", title: t("pillar3Title", lang), items: [t("pillar3Item1", lang), t("pillar3Item2", lang), t("pillar3Item3", lang), t("pillar3Item4", lang)] },
              { num: "04", title: t("pillar4Title", lang), items: [t("pillar4Item1", lang), t("pillar4Item2", lang), t("pillar4Item3", lang), t("pillar4Item4", lang)] },
              { num: "05", title: t("pillar5Title", lang), items: [t("pillar5Item1", lang), t("pillar5Item2", lang), t("pillar5Item3", lang), t("pillar5Item4", lang)] },
            ].map((pillar) => (
              <div key={pillar.num} className="card-dark p-5 md:p-6 hover:border-amber-400/30 transition-colors">
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
          <div className="mt-8 md:mt-10 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="card-dark p-6 flex items-center gap-4">
              <div className="w-12 h-12 md:w-14 md:h-14 bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 md:w-8 md:h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              </div>
              <div>
                <div className="text-xl md:text-2xl font-bold text-white">{t("quoteIn24Hours", lang)}</div>
                <div className="text-sm text-gray-500">{t("fastResponseClearSolutions", lang)}</div>
              </div>
            </div>
            <div className="card-dark p-6 flex items-center gap-4">
              <div className="w-12 h-12 md:w-14 md:h-14 bg-purple-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 md:w-8 md:h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/></svg>
              </div>
              <div>
                <div className="text-xl md:text-2xl font-bold text-white">{t("sampleIn3to7Days", lang)}</div>
                <div className="text-sm text-gray-500">{t("readyToBuildTogether", lang)}</div>
              </div>
            </div>
            <div className="card-dark p-6 flex items-center gap-4">
              <div className="w-12 h-12 md:w-14 md:h-14 bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 md:w-8 md:h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
              </div>
              <div>
                <div className="text-xl md:text-2xl font-bold text-white">{t("bulkIn15to25Days", lang)}</div>
                <div className="text-sm text-gray-500">{t("reliableProductionTimeline", lang)}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ FACTORY STRENGTH (title only, no subtitle) ═══════ */}
      <section className="section bg-gray-50">
        <div className="container-site">
          <div className="text-center mb-6">
            <h2 className="section-title text-gray-900">Factory Strength</h2>
            <div className="w-16 h-0.5 bg-amber-400 mx-auto mt-4" />
          </div>
        </div>
        <div className="full-bleed">
          <img
            src={cms("factory-strength", "/images/factory-strength.webp")}
            alt="Factory Strength"
            className="w-full h-auto md:h-[720px] object-cover"
            decoding="async"
            loading="lazy"
          />
        </div>
      </section>

      {/* ═══════ CRAFTSMANSHIP ═══════ */}
      <section className="section bg-white">
        <div className="container-site">
          <div className="text-center mb-6">
            <p className="section-subtitle text-amber-600 mb-3">{t("techniques", lang)}</p>
            <h2 className="section-title text-gray-900">{t("logoRichTechnology", lang)}</h2>
            <div className="w-16 h-0.5 bg-amber-400 mx-auto mt-4" />
          </div>
        </div>
        <div className="full-bleed">
          <img
            src={cms("logo-rich-technology", "/images/Logo Rich Technology.webp")}
            alt={t("logoRichTechnology", lang)}
            className="w-full h-auto md:h-[720px] object-cover"
            decoding="async"
            loading="lazy"
          />
        </div>
      </section>

      {/* ═══════ FABRIC ═══════ */}
      <section className="section bg-gray-50">
        <div className="container-site">
          <div className="text-center mb-6">
            <p className="section-subtitle text-amber-600 mb-3">{t("materials", lang)}</p>
            <h2 className="section-title text-gray-900">{t("premiumCustomFabric", lang)}</h2>
            <div className="w-16 h-0.5 bg-amber-400 mx-auto mt-4" />
          </div>
        </div>
        <div className="full-bleed">
          <img
            src={cms("premium-fabric", "/images/Premium Custom Fabric.webp")}
            alt={t("premiumCustomFabric", lang)}
            className="w-full h-auto md:h-[720px] object-cover"
            decoding="async"
            loading="lazy"
          />
        </div>
      </section>

      {/* ═══════ SUPPLY CHAIN ═══════ */}
      <section className="section bg-white">
        <div className="container-site">
          <div className="text-center mb-6">
            <p className="section-subtitle text-amber-600 mb-3">{t("process", lang)}</p>
            <h2 className="section-title text-gray-900">{t("fromIdeaToBulk", lang)}</h2>
            <div className="w-16 h-0.5 bg-amber-400 mx-auto mt-4" />
          </div>
        </div>
        <div className="full-bleed">
          <img
            src={cms("process-8steps", "/images/from-idea-to-bulk.webp")}
            alt={t("fromIdeaToBulk", lang)}
            className="w-full h-auto md:h-[720px] object-cover"
            decoding="async"
            loading="lazy"
          />
        </div>
      </section>

      {/* ═══════ PARTNER BRANDS ═══════ */}
      <section className="section bg-white">
        <div className="container-site">
          <div className="text-center mb-6">
            <p className="section-subtitle text-amber-600 mb-3">{t("partners", lang)}</p>
            <h2 className="section-title text-gray-900">{t("trustedByBrands", lang)}</h2>
            <div className="w-16 h-0.5 bg-amber-400 mx-auto mt-4" />
          </div>
        </div>
        <div className="full-bleed">
          <img
            src={cms("partner-brands", "/images/Trusted by 1100+ Brands.webp")}
            alt={t("trustedByBrands", lang)}
            className="w-full h-auto md:h-[720px] object-cover"
            decoding="async"
            loading="lazy"
          />
        </div>
      </section>

      {/* ═══════ CERTIFICATES ═══════ */}
      <section className="section bg-gray-50">
        <div className="container-site">
          <div className="text-center mb-6">
            <p className="section-subtitle text-amber-600 mb-3">{t("qualityAssurance", lang)}</p>
            <h2 className="section-title text-gray-900">{t("certificationsCompliance", lang)}</h2>
            <div className="w-16 h-0.5 bg-amber-400 mx-auto mt-4" />
          </div>
        </div>
        <div className="full-bleed">
          <img
            src={cms("certifications", "/images/Certifications & Compliance.webp")}
            alt={t("certificationsCompliance", lang)}
            className="w-full h-auto md:h-[720px] object-cover"
            decoding="async"
            loading="lazy"
          />
        </div>
      </section>

      {/* ═══════ SEASONS ═══════ */}
      <section className="section bg-[#0a0a0a]">
        <div className="container-site">
          <div className="text-center mb-8 md:mb-14">
            <p className="section-subtitle text-amber-400 mb-3">{t("collections", lang)}</p>
            <h2 className="section-title text-white">{t("selectBySeason", lang)}</h2>
            <div className="w-16 h-0.5 bg-amber-400 mx-auto mt-4" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
            {seasons.map((s) => (
              <Link to={`/products?season=${s.name.toLowerCase()}`} key={s.name} className="group relative aspect-[3/4] rounded-xl overflow-hidden border border-white/5">
                <img src={s.img} alt={s.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <h3 className="text-lg font-bold text-white">{s.name}</h3>
                  <span className="text-xs text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity">{t("explore", lang)}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ PORTFOLIO PRODUCTS ═══════ */}
      <section className="section bg-[#0f0f0f]">
        <div className="container-site">
          <div className="text-center mb-8 md:mb-14">
            <p className="section-subtitle text-amber-400 mb-3">{t("portfolio", lang)}</p>
            <h2 className="section-title text-white">{t("designPortfolio", lang)}</h2>
            <div className="w-16 h-0.5 bg-amber-400 mx-auto mt-4" />
            <p className="text-gray-400 mt-4 text-sm max-w-xl mx-auto">
              {t("browseStyles", lang)}
            </p>
          </div>

          {portfolioLoading && (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
            </div>
          )}

          {!portfolioLoading && (!portfolioProducts || portfolioProducts.length === 0) && (
            <div className="text-center py-10">
              <p className="text-lg mb-2 font-medium text-gray-300">{t("collectionCurated", lang)}</p>
              <p className="text-sm text-gray-500 mb-6">{t("collectionAddedSoon", lang)}</p>
              <Link
                to="/quote"
                className="inline-flex items-center gap-2 bg-amber-400 text-black px-6 py-3 rounded-md font-semibold hover:bg-amber-300 transition-colors"
              >
                {t("requestAQuote", lang)}
              </Link>
            </div>
          )}

          {!portfolioLoading && portfolioProducts && portfolioProducts.length > 0 && (
            <div className="grid-products">
              {portfolioProducts.slice(0, 8).map((p) => (
                <div key={p.id} className="group card-dark hover:border-amber-400/30 transition-all">
                  <div className="relative aspect-square">
                    <Link to={`/product/${p.id}`}>
                      <img
                        src={p.image}
                        alt={p.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        onError={(e) => { (e.target as HTMLImageElement).src = "/images/vekkst-logo.webp"; }}
                      />
                    </Link>
                    <Link to={`/product/${p.id}`} className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="btn-primary text-xs py-2 px-4">{t("viewDetails", lang)}</span>
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
            <Link to="/products" className="btn-secondary">
              {t("viewAllDesigns", lang)}
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════ WHY CHOOSE US ═══════ */}
      <section className="section bg-[#0a0a0a]">
        <div className="container-site">
          <div className="text-center mb-8 md:mb-14">
            <p className="section-subtitle text-amber-400 mb-3">Advantages</p>
            <h2 className="section-title text-white">Why Choose Us</h2>
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

      {/* ═══════ VIDEO - Our Factory in Action ═══════ */}
      <section className="section bg-[#0a0a0a]">
        <div className="container-site">
          <div className="text-center mb-8 md:mb-14">
            <p className="section-subtitle text-amber-400 mb-3">{t("showcase", lang)}</p>
            <h2 className="section-title text-white">{t("ourFactoryInAction", lang)}</h2>
            <div className="w-16 h-0.5 bg-amber-400 mx-auto mt-4" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 items-center">
            <div className="space-y-4">
              <p className="text-gray-300 text-lg leading-relaxed">
                {t("moreThan15YearsFull", lang)}
              </p>
              <div className="mt-8 space-y-4 text-sm text-gray-400">
                {[t("factoryFeature1", lang), t("factoryFeature2", lang), t("factoryFeature3", lang), t("factoryFeature4", lang)].map((item) => (
                  <p key={item} className="flex items-start gap-3">
                    <span className="text-amber-400 mt-0.5 text-lg">&#10003;</span>
                    <span>{item}</span>
                  </p>
                ))}
              </div>
              <Link to="/quote" className="btn-primary mt-6">
                <Play className="w-4 h-4" /> {t("requestFactoryTour", lang)}
              </Link>
            </div>
            <div className="rounded-2xl overflow-hidden shadow-2xl border border-white/5 bg-black">
              <SmartVideo
                src={cms("company-overview-video", "/videos/Company-overview-fixed.mp4")}
                className="w-full aspect-video object-cover"
                poster="/images/choose1.webp"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ VIDEO 2 - Factory Tour ═══════ */}
      <section className="section bg-[#0f0f0f]">
        <div className="container-site">
          <div className="mb-6 md:mb-8">
            <p className="section-subtitle text-amber-400 mb-3">{t("behindTheScenes", lang)}</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white uppercase mb-4">{t("factoryTour", lang)}</h2>
            <p className="text-gray-400 max-w-md">{t("seeProductionProcess", lang)}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-end justify-center md:justify-start">
              <SmartVideo
                src={cms("factory-tour-1", "/videos/Factory-tour-h264.mp4")}
                className="w-full md:max-w-[360px] aspect-video md:aspect-[9/16] object-cover rounded-2xl shadow-2xl border border-white/5 bg-black"
                poster="/images/factory-machine.webp"
              />
            </div>
            <div className="space-y-4">
              <SmartVideo
                src={cms("factory-tour-2", "/videos/video-factory.mp4")}
                className="w-full aspect-video object-cover rounded-2xl shadow-2xl border border-white/5 bg-black"
                poster="/images/showroom.webp"
              />
              <p className="text-gray-400 text-sm leading-relaxed">
                {t("fabricQualityDesc", lang)}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ FAQ ═══════ */}
      <section className="section bg-[#0f0f0f]">
        <div className="container-site max-w-3xl">
          <div className="text-center mb-8 md:mb-14">
            <p className="section-subtitle text-amber-400 mb-3">{t("support", lang)}</p>
            <h2 className="section-title text-white">{t("faq", lang)}</h2>
            <div className="w-16 h-0.5 bg-amber-400 mx-auto mt-4" />
          </div>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="border border-white/5 rounded-xl bg-[#161616] overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-4 md:p-5 text-left hover:bg-white/5 transition-colors"
                >
                  <span className="font-medium text-white text-sm md:text-base">{faq.q}</span>
                  {openFaq === i ? (
                    <ChevronUp className="w-4 h-4 md:w-5 md:h-5 text-amber-400 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 md:w-5 md:h-5 text-gray-500 flex-shrink-0" />
                  )}
                </button>
                {openFaq === i && <div className="px-4 md:px-5 pb-4 md:pb-5 text-sm text-gray-400">{faq.a}</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ CTA ═══════ */}
      <section className="section bg-gradient-to-br from-[#0a0a0a] via-[#1a1200] to-[#0a0a0a]">
        <div className="container-site text-center">
          <p className="section-subtitle text-amber-400 mb-3">{t("startToday", lang)}</p>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">{t("readyToBuildBrand", lang)}</h2>
          <p className="text-gray-400 mb-10 max-w-xl mx-auto">
            {t("getFreeQuote24Hours", lang)}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/quote" className="btn-primary text-base py-4 px-10">
              {t("getFreeQuote", lang)}
            </Link>
            <a
              href="https://wa.me/8613125204154"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary text-base py-4 px-10"
            >
              {t("whatsappUs", lang)}
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
