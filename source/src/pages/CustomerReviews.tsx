import { Link } from "react-router";
import Layout from "@/components/Layout";
import { Star, ArrowLeft } from "lucide-react";

/* ─────────────── CUSTOMER REVIEWS DATA ─────────────── */

const reviews = [
  {
    id: 1,
    name: "Alexander",
    country: "USA",
    rating: 5,
    text: "I was instantly attracted to this sweatshirt after putting it on! It completely exceeded my expectations! Now it has become a must-have item for my daily outfit. Friends all asked me for the link. I really recommend it!",
    img: "/images/fb1.png",
    product: "Premium Sweatshirt",
  },
  {
    id: 2,
    name: "Ethan",
    country: "Mexico",
    rating: 5,
    text: "This sweatshirt has completely conquered me! It feels delicate, comfortable, and breathable. The color does not fade after washing. Very good quality!",
    img: "/images/fb2.png",
    product: "Heavyweight Hoodie",
  },
  {
    id: 3,
    name: "Marco Rossi",
    country: "Italy",
    rating: 5,
    text: "The style is loose and stylish, and it is very suitable for both jeans and sweatpants. I wore it to a friend's party, and several people asked for the link! The quality is good, and I will buy it again next time!",
    img: "/images/p7.png",
    product: "Streetwear Set",
  },
  {
    id: 4,
    name: "Henry",
    country: "USA",
    rating: 5,
    text: "The men's denim shorts I bought have a loose fit and are comfortable, the elastic waistband is fitted, the material is durable and breathable, and the details are perfect. I highly recommend!",
    img: "/images/fb3.png",
    product: "Denim Shorts",
  },
];

/* ─────────────── CUSTOMER REVIEWS PAGE ─────────────── */

export default function CustomerReviews() {
  return (
    <Layout>
      {/* Hero Header */}
      <section className="pt-[160px] pb-16 bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-4">
          <Link to="/" className="inline-flex items-center gap-2 text-amber-400 hover:text-amber-300 transition-colors mb-8">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to Home</span>
          </Link>
          <div className="text-center">
            <p className="text-sm tracking-[0.35em] text-amber-400 uppercase mb-3">Testimonials</p>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Customer Reviews</h1>
            <div className="w-16 h-0.5 bg-amber-400 mx-auto mt-4 mb-6" />
            <p className="text-gray-400 max-w-2xl mx-auto">
              See what our clients say about working with VEKKST. Real feedback from real brands worldwide.
            </p>
          </div>
        </div>
      </section>

      {/* Reviews Grid */}
      <section className="py-20 bg-[#0f0f0f]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="bg-[#161616] border border-white/5 rounded-2xl overflow-hidden hover:border-amber-400/30 transition-all"
              >
                <div className="aspect-video bg-[#0a0a0a]">
                  <img
                    src={review.img}
                    alt={`${review.name}'s review`}
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).src = "/images/placeholder.jpg"; }}
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-amber-400/20 rounded-full flex items-center justify-center">
                      <span className="text-amber-400 font-bold text-lg">{review.name.charAt(0)}</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-white">{review.name}</h3>
                      <p className="text-sm text-gray-500">{review.country}</p>
                    </div>
                    <div className="ml-auto flex gap-0.5">
                      {Array.from({ length: review.rating }).map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-400 text-sm leading-relaxed mb-4">{review.text}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-amber-400 bg-amber-400/10 px-3 py-1 rounded-full">{review.product}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-[#0a0a0a] via-[#1a1200] to-[#0a0a0a]">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-sm tracking-[0.35em] text-amber-400 uppercase mb-3">Join Our Clients</p>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Ready to Build Your Brand?</h2>
          <p className="text-gray-400 mb-10 max-w-xl mx-auto">
            Get a free quote within 24 hours. Low MOQ from 60 pieces. Custom samples in 3-7 days.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/quote"
              className="inline-block bg-amber-400 hover:bg-amber-500 text-black px-10 py-4 rounded-full font-semibold transition-colors"
            >
              Get a Free Quote
            </Link>
            <a
              href="https://wa.me/8613125204154"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block border border-amber-400 text-amber-400 hover:bg-amber-400 hover:text-black px-10 py-4 rounded-full font-semibold transition-all"
            >
              WhatsApp Us
            </a>
          </div>
        </div>
      </section>
    </Layout>
  );
}
