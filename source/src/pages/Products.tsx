import { useState } from "react";
import { Link, useSearchParams } from "react-router";
import { SlidersHorizontal, X, Loader2 } from "lucide-react";
import { trpc } from "@/providers/trpc";
import { usePageContent } from "@/hooks/usePageContent";
import { t } from "@/lib/translations";
import { useLanguage } from "@/providers/LanguageProvider";

const catOptions = [
  { label: "All", value: "" },
  { label: "Hoodies", value: "hoodies" },
  { label: "T-Shirts", value: "t-shirts" },
  { label: "Jackets", value: "jackets" },
  { label: "Shorts", value: "shorts" },
  { label: "Pants", value: "pants" },
  { label: "Tracksuits", value: "tracksuits" },
];

const seasonOptions = [
  { label: "All", value: "" },
  { label: "Spring", value: "spring" },
  { label: "Summer", value: "summer" },
  { label: "Autumn", value: "autumn" },
  { label: "Winter", value: "winter" },
];

export default function Products() {
  const { lang } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const activeCategory = searchParams.get("category") || "";
  const activeSeason = searchParams.get("season") || "";

  const { data: products, isLoading } = trpc.product.list.useQuery({
    category: activeCategory || undefined,
    season: activeSeason || undefined,
  });

  const updateParam = (key: string, value: string) => {
    const sp = new URLSearchParams(searchParams);
    if (value) sp.set(key, value);
    else sp.delete(key);
    setSearchParams(sp);
  };

  const hasFilters = activeCategory || activeSeason;

  const { getSection } = usePageContent("products");
  const cms = (key: string, fallback: string) => getSection(key)?.content || fallback;

  return (
    <>
      {/* ── Hero ── */}
      <section className="relative h-[35vh] md:h-[40vh] min-h-[200px] max-h-[400px] overflow-hidden">
        <img src={cms("hero-banner", "/images/showroom.webp")} alt={t("products", lang)} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute inset-0 flex items-center justify-center text-white px-4">
          <div className="text-center">
            <h1 className="text-2xl md:text-3xl font-bold mb-1">{t("designPortfolio", lang)}</h1>
            <p className="text-sm opacity-80 max-w-md mx-auto">{t("browseStyles", lang)}</p>
          </div>
        </div>
      </section>

      {/* ── Products Grid ── */}
      <section className="section bg-white">
        <div className="container-site">
          {/* Filter bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-[#E60012] min-h-[44px] px-3"
            >
              <SlidersHorizontal className="w-4 h-4" /> {t("filters", lang)}
              {hasFilters && <span className="w-2 h-2 bg-[#E60012] rounded-full" />}
            </button>
            <span className="text-sm text-gray-500">
              {isLoading ? t("loading", lang) : `${products?.length || 0} ${t("designs", lang)}`}
            </span>
          </div>

          {/* Filter panel */}
          {showFilters && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">{t("category", lang)}</label>
                <div className="flex flex-wrap gap-2">
                  {catOptions.map((c) => (
                    <button
                      key={c.value}
                      onClick={() => updateParam("category", c.value)}
                      className={`px-3 py-1.5 rounded-full text-sm min-h-[36px] transition-colors ${
                        activeCategory === c.value
                          ? "bg-[#E60012] text-white"
                          : "bg-white border border-gray-200 hover:border-[#E60012]"
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">{t("season", lang)}</label>
                <div className="flex flex-wrap gap-2">
                  {seasonOptions.map((s) => (
                    <button
                      key={s.value}
                      onClick={() => updateParam("season", s.value)}
                      className={`px-3 py-1.5 rounded-full text-sm min-h-[36px] transition-colors ${
                        activeSeason === s.value
                          ? "bg-[#E60012] text-white"
                          : "bg-white border border-gray-200 hover:border-[#E60012]"
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
              {hasFilters && (
                <button
                  onClick={() => setSearchParams(new URLSearchParams())}
                  className="flex items-center gap-1 text-sm text-[#E60012] min-h-[44px]"
                >
                  <X className="w-3 h-3" /> {t("clearAllFilters", lang)}
                </button>
              )}
            </div>
          )}

          {/* Loading */}
          {isLoading && (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-[#E60012]" />
            </div>
          )}

          {/* Empty state */}
          {!isLoading && (!products || products.length === 0) && (
            <div className="text-center py-20">
              <p className="text-lg mb-2 font-medium">{t("collectionCurated", lang)}</p>
              <p className="text-sm text-gray-500 mb-6">{t("collectionAddedSoon", lang)}</p>
              <Link
                to="/quote"
                className="inline-flex items-center gap-2 bg-[#E60012] text-white px-6 py-3 rounded-md font-medium hover:bg-red-700 transition-colors"
              >
                {t("requestAQuote", lang)}
              </Link>
            </div>
          )}

          {/* Product grid - 2 cols mobile, 3 tablet, 4 desktop */}
          {!isLoading && products && products.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-5">
              {products.map((p) => (
                <Link
                  key={p.id}
                  to={`/product/${p.id}`}
                  className="group bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-shadow"
                >
                  <div className="relative aspect-square">
                    <img
                      src={p.image}
                      alt={p.name}
                      className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).src = "/images/vekkst-logo.webp"; }}
                    />
                    {/* Desktop hover overlay - hidden on mobile */}
                    <div className="hidden md:flex absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity items-center justify-center">
                      <span className="bg-white text-gray-800 px-4 py-2 rounded-full text-sm font-medium">{t("viewDetails", lang)}</span>
                    </div>
                    {/* Mobile: show a small badge instead of hover */}
                    <div className="md:hidden absolute bottom-2 right-2 bg-white/90 text-gray-800 px-2 py-1 rounded text-xs font-medium">
                      {t("viewArrow", lang)}
                    </div>
                  </div>
                  <div className="p-3">
                    <span className="text-xs text-gray-400 uppercase">{p.category}</span>
                    <h3 className="text-sm font-semibold mt-1 truncate">{p.name}</h3>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
