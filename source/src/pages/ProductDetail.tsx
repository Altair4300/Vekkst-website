import { useParams, Link } from "react-router";
import { ArrowLeft, Loader2 } from "lucide-react";
import { trpc } from "@/providers/trpc";
import { t } from "@/lib/translations";
import { useLanguage } from "@/providers/LanguageProvider";

export default function ProductDetail() {
  const { lang } = useLanguage();
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
        <h1 className="text-xl md:text-2xl font-bold mb-4">{t("productNotFound", lang)}</h1>
        <Link to="/products" className="text-[#E60012]">{t("backToPortfolio", lang)}</Link>
      </div>
    );
  }

  return (
    <>
      <section className="section bg-white">
        <div className="container-site">
          <Link to="/products" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-[#E60012] mb-4 md:mb-6 min-h-[44px]">
            <ArrowLeft className="w-4 h-4" /> {t("backToPortfolio", lang)}
          </Link>
          <div className="grid md:grid-cols-2 gap-6 md:gap-10">
            {/* Image Gallery */}
            <div className="space-y-3 md:space-y-4">
              <div className="relative">
                <img src={product.image} alt={product.name} className="w-full aspect-square object-cover rounded-lg" onError={(e) => { (e.target as HTMLImageElement).src = "/images/vekkst-logo.webp"; }} />
              </div>
              <div className="grid grid-cols-3 gap-2 md:gap-3">
                <img src={product.image} alt={t("frontView", lang)} className="w-full aspect-square object-cover rounded-lg border-2 border-[#E60012]" onError={(e) => { (e.target as HTMLImageElement).src = "/images/vekkst-logo.webp"; }} />
                <img src={product.image} alt={t("backView", lang)} className="w-full aspect-square object-cover rounded-lg opacity-70" onError={(e) => { (e.target as HTMLImageElement).src = "/images/vekkst-logo.webp"; }} />
                <img src={product.image} alt={t("detailView", lang)} className="w-full aspect-square object-cover rounded-lg opacity-70" onError={(e) => { (e.target as HTMLImageElement).src = "/images/vekkst-logo.webp"; }} />
              </div>
            </div>

            {/* Product Info */}
            <div>
              <span className="text-xs text-gray-400 uppercase tracking-wider">{product.category}</span>
              <h1 className="text-xl md:text-2xl font-bold mt-1 mb-4">{product.name}</h1>
              <p className="text-gray-600 mb-6 text-sm leading-relaxed">{product.description || t("premiumQualityDesc", lang)}</p>

              {/* Customization Options */}
              <div className="bg-gray-50 rounded-lg p-4 md:p-5 mb-6">
                <h3 className="font-semibold mb-3 text-sm">{t("availableCustomizations", lang)}</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2"><span className="text-[#E60012]">✓</span> {t("customColorsFabric", lang)}</li>
                  <li className="flex items-center gap-2"><span className="text-[#E60012]">✓</span> {t("yourOwnLabels", lang)}</li>
                  <li className="flex items-center gap-2"><span className="text-[#E60012]">✓</span> {t("customPrintsShort", lang)}</li>
                  <li className="flex items-center gap-2"><span className="text-[#E60012]">✓</span> {t("sizeRangeCustomization", lang)}</li>
                  <li className="flex items-center gap-2"><span className="text-[#E60012]">✓</span> {t("customPackaging", lang)}</li>
                </ul>
              </div>

              {/* MOQ Info */}
              <div className="flex flex-wrap items-center gap-2 md:gap-4 mb-6 text-sm">
                <div className="bg-green-50 text-green-700 px-3 py-1.5 rounded-full font-medium">{t("moq60Pcs", lang)}</div>
                <div className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full font-medium">{t("sampleTimeline", lang)}</div>
                <div className="bg-purple-50 text-purple-700 px-3 py-1.5 rounded-full font-medium">{t("oemOdm", lang)}</div>
              </div>

              {/* Request Quote Button */}
              <Link
                to={`/quote/${product.id}`}
                className="btn-primary text-sm justify-center w-full sm:w-auto py-4"
              >
                {t("requestQuoteStyle", lang)}
              </Link>
              <p className="text-xs text-gray-400 mt-2">{t("respondWithin24Hours", lang)}</p>
            </div>
          </div>

          {/* Related Products */}
          {related.length > 0 && (
            <div className="mt-12 md:mt-16">
              <h2 className="text-lg md:text-xl font-bold mb-4 md:mb-6">{t("relatedStyles", lang)}</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
                {related.map((p) => (
                  <Link to={`/product/${p.id}`} key={p.id} className="group bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-shadow">
                    <div className="relative aspect-square">
                      <img src={p.image} alt={p.name} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = "/images/vekkst-logo.webp"; }} />
                      <div className="hidden md:flex absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity items-center justify-center">
                        <span className="bg-white text-gray-800 px-3 py-1.5 rounded text-xs font-medium">{t("viewDetails", lang)}</span>
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
