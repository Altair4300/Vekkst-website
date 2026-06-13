import { useParams, Link } from "react-router";
import { ArrowLeft } from "lucide-react";
import Layout from "@/components/Layout";

const allProducts = [
  { id: 1, name: "Oversized Black Pink Hoodie", category: "hoodies", img: "/images/p1.png", desc: "Premium oversized hoodie featuring bold black and pink color blocking. Made from heavyweight cotton fleece with front zipper closure. Fully customizable with your own branding, labels, and colorways." },
  { id: 2, name: "Grey Pattern Embroidered Hoodie", category: "hoodies", img: "/images/p2.png", desc: "Intricate floral pattern embroidery on premium grey cotton blend. Features kangaroo pocket and adjustable drawstring hood. Available for OEM customization with your own embroidery designs." },
  { id: 3, name: "Paint Splatter Bomber Jacket", category: "jackets", img: "/images/p3.png", desc: "Stylish bomber jacket with unique paint splatter design on lightweight nylon. Features ribbed collar, cuffs, and hem. Perfect for streetwear brands looking for a statement piece." },
  { id: 4, name: "Color Block Windbreaker", category: "jackets", img: "/images/p4.png", desc: "Retro-inspired color block windbreaker with teal, pink, and yellow panels. Water-resistant polyester with adjustable hood. Custom color combinations available for bulk orders." },
  { id: 5, name: "Retro Color Block Jacket", category: "jackets", img: "/images/p5.png", desc: "Vintage-style color block jacket with blue, red, and yellow panels. Features stand collar, zip front, and side pockets. Ideal for 90s-inspired fashion lines." },
  { id: 6, name: "Dragon Print Flared Pants", category: "pants", img: "/images/p6.png", desc: "Eye-catching flared pants with vibrant dragon and flame print. Made from comfortable stretch cotton. Custom prints and silhouettes available for your brand." },
  { id: 7, name: "Gothic Letter Denim Shorts", category: "shorts", img: "/images/p7.png", desc: "Premium denim shorts with gothic letter embroidery and distressed details. Mid-rise fit with classic 5-pocket styling. Wash and distress levels fully customizable." },
  { id: 8, name: "Distressed Graffiti Tee", category: "t-shirts", img: "/images/p8.png", desc: "Oversized boxy fit t-shirt with vintage wash and distressed edges. Bold graphic print on heavyweight cotton. Perfect canvas for your brand's artwork and logos." },
];

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const product = allProducts.find((p) => p.id === Number(id));

  if (!product) return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
        <Link to="/products" className="text-[#E60012]">Back to Portfolio</Link>
      </div>
    </Layout>
  );

  const related = allProducts.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4);

  return (
    <Layout>
      <section className="py-10 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <Link to="/products" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-[#E60012] mb-6">
            <ArrowLeft className="w-4 h-4" /> Back to Portfolio
          </Link>
          <div className="grid md:grid-cols-2 gap-10">
            {/* Image Gallery */}
            <div className="space-y-4">
              <div className="relative">
                <img src={product.img} alt={product.name} className="w-full aspect-square object-cover rounded-lg" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <img src={product.img} alt="Front view" className="w-full aspect-square object-cover rounded-lg border-2 border-[#E60012]" />
                <img src={product.img} alt="Back view" className="w-full aspect-square object-cover rounded-lg opacity-70" />
                <img src={product.img} alt="Detail view" className="w-full aspect-square object-cover rounded-lg opacity-70" />
              </div>
            </div>

            {/* Product Info */}
            <div>
              <span className="text-xs text-gray-400 uppercase tracking-wider">{product.category}</span>
              <h1 className="text-2xl font-bold mt-1 mb-4">{product.name}</h1>
              <p className="text-gray-600 mb-6 text-sm leading-relaxed">{product.desc}</p>

              {/* Customization Options */}
              <div className="bg-[#F5F5F5] rounded-lg p-5 mb-6">
                <h3 className="font-semibold mb-3 text-sm">Available Customizations</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2"><span className="text-[#E60012]">&#10003;</span> Custom colors & fabric</li>
                  <li className="flex items-center gap-2"><span className="text-[#E60012]">&#10003;</span> Your own labels & tags</li>
                  <li className="flex items-center gap-2"><span className="text-[#E60012]">&#10003;</span> Custom prints & embroidery</li>
                  <li className="flex items-center gap-2"><span className="text-[#E60012]">&#10003;</span> Size range customization</li>
                  <li className="flex items-center gap-2"><span className="text-[#E60012]">&#10003;</span> Custom packaging</li>
                </ul>
              </div>

              {/* MOQ Info */}
              <div className="flex items-center gap-4 mb-6 text-sm">
                <div className="bg-green-50 text-green-700 px-3 py-1.5 rounded-full font-medium">MOQ: 60 pcs</div>
                <div className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full font-medium">Sample: 3-7 days</div>
                <div className="bg-purple-50 text-purple-700 px-3 py-1.5 rounded-full font-medium">OEM/ODM</div>
              </div>

              {/* Request Quote Button */}
              <Link
                to={`/quote/${product.id}`}
                className="inline-flex items-center gap-2 bg-[#E60012] hover:bg-[#c4000f] text-white px-8 py-4 rounded-lg font-medium transition-colors text-base"
              >
                Request Quote for This Style
              </Link>
              <p className="text-xs text-gray-400 mt-2">We'll respond within 24 hours with pricing and timeline.</p>
            </div>
          </div>

          {/* Related Products */}
          {related.length > 0 && (
            <div className="mt-16">
              <h2 className="text-xl font-bold mb-6">Related Styles</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                {related.map((p) => (
                  <Link to={`/product/${p.id}`} key={p.id} className="group bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-shadow">
                    <div className="relative aspect-square">
                      <img src={p.img} alt={p.name} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="bg-white text-[#333] px-3 py-1.5 rounded text-xs font-medium">View Details</span>
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
    </Layout>
  );
}
