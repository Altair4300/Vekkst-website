import { Link } from "react-router";
import { CheckCircle } from "lucide-react";
import { usePageContent } from "@/hooks/usePageContent";

const capabilities = [
  "Custom Design & Sampling (3-7 day turnaround)",
  "OEM/ODM Full Production Service",
  "Screen Print, DTG, Embroidery, Sublimation",
  "Custom Labels, Hang Tags & Packaging",
  "Quality Control at Every Stage",
  "Low MOQ Starting from 60 pcs",
  "Worldwide Shipping & Logistics",
  "Dedicated Account Manager",
];

const milestones = [
  { year: "2008", title: "Company Founded", desc: "Started with 7 passionate team members in Dongguan." },
  { year: "2012", title: "Expansion", desc: "Expanded to 5,000m² factory and added new production lines." },
  { year: "2016", title: "Global Reach", desc: "Began exporting to Europe, North America, and Australia." },
  { year: "2018", title: "OEM/ODM Launch", desc: "Launched full OEM/ODM services for global fashion brands." },
  { year: "2020", title: "Digital Upgrade", desc: "Invested in digital printing and automated cutting systems." },
  { year: "2024", title: "1,100+ Brands", desc: "Partnered with over 1,100 brands worldwide." },
];

export default function About() {
  const { cms } = usePageContent("about");

  return (
    <>
      {/* ── Hero ── */}
      <section className="relative h-[40vh] md:h-[50vh] min-h-[240px] max-h-[500px] overflow-hidden">
        <img src={cms("hero-banner", "/images/hero-factory.webp")} alt="Factory" width="1280" height="500" className="w-full h-full object-cover" fetchpriority="high" loading="eager" decoding="async" />
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute inset-0 flex items-center justify-center text-white text-center px-4">
          <div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2">ABOUT US</h1>
            <p className="text-sm md:text-base opacity-80">Dongguan VEKKST Garment Co., Ltd. | 14+ Years of Excellence</p>
          </div>
        </div>
      </section>

      {/* ── Company Overview ── */}
      <section className="section bg-white">
        <div className="container-site">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
            {/* Text */}
            <div className="order-2 md:order-1">
              <h2 className="section-title mb-4">Dongguan VEKKST Garment Co., Ltd.</h2>
              <p className="text-gray-600 leading-relaxed mb-4 text-sm md:text-base">
                We are a professional one-stop ODM/OEM manufacturer specializing in custom men's fashion clothing.
                With over 14 years of experience, we have built a reputation for quality, reliability, and innovation
                in the garment manufacturing industry.
              </p>
              <p className="text-gray-600 leading-relaxed mb-6 text-sm md:text-base">
                Our 5,000m² factory in Dongguan, Guangdong is equipped with state-of-the-art machinery and staffed
                by 120+ skilled workers. Each season, we develop 2,000+ new styles and serve over 1,100 brands worldwide.
              </p>
              {/* Stats grid - 2x2 on mobile, 2x2 on desktop (same, responsive) */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: "14+", label: "Years Experience" },
                  { value: "5,000m²", label: "Factory Space" },
                  { value: "120+", label: "Staff Members" },
                  { value: "1,100+", label: "Partner Brands" },
                ].map((stat) => (
                  <div key={stat.label} className="bg-gray-50 rounded-lg p-3 md:p-4 text-center">
                    <div className="text-xl md:text-2xl font-bold text-[#E60012]">{stat.value}</div>
                    <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
            {/* Images */}
            <div className="order-1 md:order-2 space-y-3 md:space-y-4">
              <img src={cms("factory-image", "/images/factory-machine.webp")} alt="Factory" width="600" height="224" className="w-full h-48 md:h-56 object-cover rounded-lg" loading="lazy" decoding="async" />
              <img src={cms("showroom-image", "/images/showroom.webp")} alt="Showroom" width="600" height="224" className="w-full h-48 md:h-56 object-cover rounded-lg" loading="lazy" decoding="async" />
            </div>
          </div>
        </div>
      </section>

      {/* ── Team Photo ── */}
      <section className="section bg-white">
        <div className="container-site">
          <div className="text-center mb-8">
            <h2 className="section-title mb-2">Meet Our Team</h2>
            <p className="text-gray-500 text-sm max-w-xl mx-auto">Over 256 skilled professionals dedicated to delivering premium quality streetwear</p>
          </div>
          <div className="max-w-4xl mx-auto">
            <img src={cms("team-photo", "/images/team-photo.webp")} alt="VEKKST Garment Team" width="896" height="504" className="w-full rounded-xl shadow-lg" loading="lazy" decoding="async" />
          </div>
        </div>
      </section>

      {/* ── Capabilities ── */}
      <section className="section bg-gray-50">
        <div className="container-site">
          <div className="text-center mb-8">
            <h2 className="section-title mb-2">Our Capabilities</h2>
            <p className="text-gray-500 text-sm max-w-xl mx-auto">Everything you need for your clothing brand under one roof</p>
          </div>
          <div className="grid md:grid-cols-2 gap-3 max-w-3xl mx-auto">
            {capabilities.map((cap) => (
              <div key={cap} className="flex items-center gap-3 bg-white rounded-lg p-3 md:p-4">
                <CheckCircle className="w-5 h-5 text-[#E60012] flex-shrink-0" />
                <span className="text-sm text-gray-700">{cap}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Timeline ── */}
      <section className="section bg-white">
        <div className="container-site">
          <div className="text-center mb-10">
            <h2 className="section-title mb-2">Our Journey</h2>
            <p className="text-gray-500 text-sm max-w-xl mx-auto">From a small team to a global manufacturing partner</p>
          </div>
          <div className="max-w-4xl mx-auto space-y-6">
            {milestones.map((m, i) => (
              <div key={i} className="flex gap-4 md:gap-6 items-start">
                <div className="w-16 md:w-20 flex-shrink-0 text-right">
                  <span className="text-lg md:text-xl font-bold text-[#E60012]">{m.year}</span>
                </div>
                <div className="w-3 h-3 bg-[#E60012] rounded-full mt-2 flex-shrink-0" />
                <div className="flex-1 pb-6 border-b border-gray-200">
                  <h3 className="font-bold text-base md:text-lg">{m.title}</h3>
                  <p className="text-gray-600 text-sm">{m.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-12 md:py-16 bg-[#E60012] text-white text-center">
        <div className="container-site">
          <h2 className="text-xl md:text-2xl lg:text-3xl font-bold mb-3">Ready to Start Your Project?</h2>
          <p className="text-white/80 mb-6 max-w-xl mx-auto text-sm md:text-base">Get a free quote within 24 hours. Low MOQ from 60 pieces. Custom samples in 3-7 days.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <Link to="/quote" className="btn-primary text-sm">Get a Free Quote</Link>
            <a href="https://wa.me/8613125204154" target="_blank" rel="noopener noreferrer" className="btn-primary bg-white/10 border border-white/30 text-sm">WhatsApp Us</a>
          </div>
        </div>
      </section>
    </>
  );
}
