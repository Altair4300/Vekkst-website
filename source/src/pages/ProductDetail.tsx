import { useParams, Link } from "react-router";
import { ArrowLeft, Loader2 } from "lucide-react";
import { trpc } from "@/providers/trpc";

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const productId = Number(id);

  const { data: product, isLoading } = trpc.product.getById.useQuery(
    { id: productId },
    { enabled: !isNaN(productId) && productId > 0 }
  );

  const { data: relatedProducts } = trpc.product.list.useQuery(
    { category: product?.category || undefined },
    { enabled: !!product?.category }
  );

  const related = (relatedProducts || [])
    .filter((p) => p.id !== productId)
    .slice(0, 4);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-[#E60012]" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h1 className="text-xl md:text-2xl font-bold mb-4">Product Not Found</h1>
        <Link to="/products" className="text-[#E60012]">Back to Portfolio</Link>
      </div>
    );
  }

  return (
    <>
      <section className="section bg-white">
        <div className="container-site">
          <Link to="/products" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-[#E60012] mb-4 md:mb-6 min-h-[44px]">
            <ArrowLeft className="w-4 h-4" /> Back to Portfolio
          </Link>
          <div className="grid md:grid-cols-2 gap-6 md:gap-10">
            {/* Image Gallery */}
            <div className="space-y-3 md:space-y-4">
              <div className="relative">
                <img src={product.image} alt={product.name} className="w-full aspect-square object-cover rounded-lg" onError={(e) => { (e.target as HTMLImageElement).src = "/images/vekkst-logo.webp"; }} />
              </div>
              <div className="grid grid-cols-3 gap-2 md:gap-3">
                <img src={product.image} alt="Front view" className="w-full aspect-square object-cover rounded-lg border-2 border-[#E60012]" onError={(e) => { (e.target as HTMLImageElement).src = "/images/vekkst-logo.webp"; }} />
                <img src={product.image} alt="Back view" className="w-full aspect-square object-cover rounded-lg opacity-70" onError={(e) => { (e.target as HTMLImageElement).src = "/images/vekkst-logo.webp"; }} />
                <img src={product.image} alt="Detail view" className="w-full aspect-square object-cover rounded-lg opacity-70" onError={(e) => { (e.target as HTMLImageElement).src = "/images/vekkst-logo.webp"; }} />
              </div>
            </div>

            {/* Product Info */}
            <div>
              <span className="text-xs text-gray-400 uppercase tracking-wider">{product.category}</span>
              <h1 className="text-xl md:text-2xl font-bold mt-1 mb-4">{product.name}</h1>
              <p className="text-gray-600 mb-6 text-sm leading-relaxed">{product.description || "Premium quality custom garment. Contact us for full customization options including colors, fabrics, prints, and sizing."}</p>

              {/* Customization Options */}
              <div className="bg-gray-50 rounded-lg p-4 md:p-5 mb-6">
                <h3 className="font-semibold mb-3 text-sm">Available Customizations</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2"><span className="text-[#E60012]">✓</span> Custom colors & fabric</li>
                  <li className="flex items-center gap-2"><span className="text-[#E60012]">✓</span> Your own labels & tags</li>
                  <li className="flex items-center gap-2"><span className="text-[#E60012]">✓</span> Custom prints & embroidery</li>
                  <li className="flex items-center gap-2"><span className="text-[#E60012]">✓</span> Size range customization</li>
                  <li className="flex items-center gap-2"><span className="text-[#E60012]">✓</span> Custom packaging</li>
                </ul>
              </div>

              {/* MOQ Info */}
              <div className="flex flex-wrap items-center gap-2 md:gap-4 mb-6 text-sm">
                <div className="bg-green-50 text-green-700 px-3 py-1.5 rounded-full font-medium">MOQ: 60 pcs</div>
                <div className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full font-medium">Sample: 3-7 days</div>
                <div className="bg-purple-50 text-purple-700 px-3 py-1.5 rounded-full font-medium">OEM/ODM</div>
              </div>

              {/* Request Quote Button */}
              <Link
                to={`/quote/${product.id}`}
                className="btn-primary text-sm justify-center w-full sm:w-auto py-4"
              >
                Request Quote for This Style
              </Link>
              <p className="text-xs text-gray-400 mt-2">We'll respond within 24 hours with pricing and timeline.</p>
            </div>
          </div>

          {/* Related Products */}
          {related.length > 0 && (
            <div className="mt-12 md:mt-16">
              <h2 className="text-lg md:text-xl font-bold mb-4 md:mb-6">Related Styles</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
                {related.map((p) => (
                  <Link to={`/product/${p.id}`} key={p.id} className="group bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-shadow">
                    <div className="relative aspect-square">
                      <img src={p.image} alt={p.name} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = "/images/vekkst-logo.webp"; }} />
                      <div className="hidden md:flex absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity items-center justify-center">
                        <span className="bg-white text-gray-800 px-3 py-1.5 rounded text-xs font-medium">View Details</span>
                      </div>
                    </div>
                    <div className="p-3">
                      <h3 className="text-sm font-semibold truncate">{p.name}</h3>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
