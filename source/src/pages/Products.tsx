import { useState } from "react";
import { Link, useSearchParams } from "react-router";
import { SlidersHorizontal, X } from "lucide-react";
import Layout from "@/components/Layout";

const allProducts = [
  { id: 1, name: "Oversized Black Pink Hoodie", category: "hoodies", img: "/images/p1.png" },
  { id: 2, name: "Grey Pattern Embroidered Hoodie", category: "hoodies", img: "/images/p2.png" },
  { id: 3, name: "Paint Splatter Bomber Jacket", category: "jackets", img: "/images/p3.png" },
  { id: 4, name: "Color Block Windbreaker", category: "jackets", img: "/images/p4.png" },
  { id: 5, name: "Retro Color Block Jacket", category: "jackets", img: "/images/p5.png" },
  { id: 6, name: "Dragon Print Flared Pants", category: "pants", img: "/images/p6.png" },
  { id: 7, name: "Gothic Letter Denim Shorts", category: "shorts", img: "/images/p7.png" },
  { id: 8, name: "Distressed Graffiti Tee", category: "t-shirts", img: "/images/p8.png" },
  { id: 9, name: "Maroon Zip-Up Hoodie", category: "hoodies", img: "/images/cat-hoodies.png" },
  { id: 10, name: "Black Graphic Oversized Tee", category: "t-shirts", img: "/images/cat-tshirts.png" },
  { id: 11, name: "White Paint Splatter Jacket", category: "jackets", img: "/images/cat-jackets.png" },
  { id: 12, name: "Denim Embroidered Shorts", category: "shorts", img: "/images/cat-shorts.png" },
  { id: 13, name: "Yellow Graffiti Baggy Pants", category: "pants", img: "/images/cat-pants.png" },
  { id: 14, name: "Grey VEKKST Tracksuit Set", category: "tracksuits", img: "/images/cat-tracksuits.png" },
  { id: 15, name: "Pink Black DRVN Hoodie", category: "hoodies", img: "/images/season-spring.png" },
  { id: 16, name: "Blue Gradient Tee", category: "t-shirts", img: "/images/season-summer.png" },
];

const catOptions = [{ label: "All", value: "" }, { label: "Hoodies", value: "hoodies" }, { label: "T-Shirts", value: "t-shirts" }, { label: "Jackets", value: "jackets" }, { label: "Shorts", value: "shorts" }, { label: "Pants", value: "pants" }, { label: "Tracksuits", value: "tracksuits" }];

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const activeCategory = searchParams.get("category") || "";

  const filtered = allProducts.filter((p) => {
    if (activeCategory && p.category !== activeCategory) return false;
    return true;
  });

  const updateParam = (key: string, value: string) => {
    const sp = new URLSearchParams(searchParams);
    if (value) sp.set(key, value); else sp.delete(key);
    setSearchParams(sp);
  };

  return (
    <Layout>
      <section className="relative h-[200px] overflow-hidden">
        <img src="/images/showroom.jpg" alt="Products" className="w-full h-full object-cover" />
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
            <span className="text-sm text-gray-500">{filtered.length} designs</span>
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
              {activeCategory && (
                <button onClick={() => setSearchParams(new URLSearchParams())} className="flex items-center gap-1 text-sm text-[#E60012]">
                  <X className="w-3 h-3" /> Clear all filters
                </button>
              )}
            </div>
          )}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {filtered.map((p) => (
              <div key={p.id} className="group bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-shadow">
                <div className="relative aspect-square">
                  <Link to={`/product/${p.id}`}><img src={p.img} alt={p.name} className="w-full h-full object-cover" /></Link>
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
        </div>
      </section>
    </Layout>
  );
}
