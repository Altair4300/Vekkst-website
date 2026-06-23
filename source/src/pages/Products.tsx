import { useState } from "react";
import { Link, useSearchParams } from "react-router";
import { SlidersHorizontal, X, Loader2 } from "lucide-react";
import { trpc } from "@/providers/trpc";
import { usePageContent } from "@/hooks/usePageContent";

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
      <section className="relative h-[200px] overflow-hidden">
        <img src={cms("hero-banner", "/images/showroom.webp")} alt="Products" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute inset-0 flex items-center justify-center text-white">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-1">DESIGN PORTFOLIO</h1>
            <p className="text-sm opacity-80">Browse our styles for inspiration. Request a quote for customization.</p>
          </div>
        </div>
      </section>
      <section className="py-10 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <button onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-2 text-sm font-medium text-[#333] hover:text-[#E60012]">
              <SlidersHorizontal className="w-4 h-4" /> Filters
            </button>
            <span className="text-sm text-gray-500">
              {isLoading ? "Loading..." : `${products?.length || 0} designs`}
            </span>
          </div>

          {showFilters && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Category</label>
                <div className="flex flex-wrap gap-2">
                  {catOptions.map((c) => (
                    <button key={c.value} onClick={() => updateParam("category", c.value)} className={`px-3 py-1.5 rounded-full text-sm ${activeCategory === c.value ? "bg-[#E60012] text-white" : "bg-white border hover:border-[#E60012]"}`}>{c.label}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Season</label>
                <div className="flex flex-wrap gap-2">
                  {seasonOptions.map((s) => (
                    <button key={s.value} onClick={() => updateParam("season", s.value)} className={`px-3 py-1.5 rounded-full text-sm ${activeSeason === s.value ? "bg-[#E60012] text-white" : "bg-white border hover:border-[#E60012]"}`}>{s.label}</button>
                  ))}
                </div>
              </div>
              {hasFilters && (
                <button onClick={() => setSearchParams(new URLSearchParams())} className="flex items-center gap-1 text-sm text-[#E60012]">
                  <X className="w-3 h-3" /> Clear all filters
                </button>
              )}
            </div>
          )}

          {isLoading && (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-[#E60012]" />
            </div>
          )}

          {!isLoading && (!products || products.length === 0) && (
            <div className="text-center py-20 text-gray-500">
              <p className="text-lg mb-2">No products yet</p>
              <p className="text-sm">Products will appear here once uploaded via the admin panel.</p>
            </div>
          )}

          {!isLoading && products && products.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {products.map((p) => (
                <div key={p.id} className="group bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-shadow">
                  <div className="relative aspect-square">
                    <Link to={`/product/${p.id}`}>
                      <img src={p.image} alt={p.name} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = "/images/placeholder.jpg"; }} />
                    </Link>
                    <Link to={`/product/${p.id}`} className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="bg-white text-[#333] px-4 py-2 rounded text-sm font-medium">View Details</span>
                    </Link>
                  </div>
                  <div className="p-3">
                    <span className="text-xs text-gray-400 uppercase">{p.category}</span>
                    <h3 className="text-sm font-semibold mt-1 truncate">{p.name}</h3>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
