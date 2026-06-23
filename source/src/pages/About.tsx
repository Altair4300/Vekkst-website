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
  const { cms, cmsMobile } = usePageContent("about");

  return (
    <>
      {/* Hero */}
      <section className="relative h-[300px] overflow-hidden">
        {/* Desktop image */}
        <img src="/images/hero-factory.webp" alt="Factory" className="hidden md:block w-full h-full object-cover" />
        {/* Mobile image */}
        <img src="/images/hero-factory.webp" alt="Factory" className="md:hidden w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute inset-0 flex items-center justify-center text-white text-center px-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">ABOUT US</h1>
            <p className="text-sm opacity-80">Dongguan VEKKST Garment Co., Ltd. | 14+ Years of Excellence</p>
          </div>
        </div>
      </section>

      {/* Company Overview */}
      <section className="py-16 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-2xl font-bold mb-4">Dongguan VEKKST Garment Co., Ltd.</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                We are a professional one-stop ODM/OEM manufacturer specializing in custom men's fashion clothing. 
                With over 14 years of experience, we have built a reputation for quality, reliability, and innovation 
                in the garment manufacturing industry.
              </p>
              <p className="text-gray-600 leading-relaxed mb-6">
                Our 5,000m² factory in Dongguan, Guangdong is equipped with state-of-the-art machinery and staffed 
                by 120+ skilled workers. Each season, we develop 2,000+ new styles and serve over 1,100 brands worldwide.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#F5F5F5] rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-[#E60012]">14+</div>
                  <div className="text-xs text-gray-500">Years Experience</div>
                </div>
                <div className="bg-[#F5F5F5] rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-[#E60012]">5,000m²</div>
                  <div className="text-xs text-gray-500">Factory Space</div>
                </div>
                <div className="bg-[#F5F5F5] rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-[#E60012]">120+</div>
                  <div className="text-xs text-gray-500">Staff Members</div>
                </div>
                <div className="bg-[#F5F5F5] rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-[#E60012]">1,100+</div>
                  <div className="text-xs text-gray-500">Partner Brands</div>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <img src="/images/factory-machine.webp" alt="Factory" className="w-full h-56 object-cover rounded-lg" />
              <img src="/images/showroom.webp" alt="Showroom" className="w-full h-56 object-cover rounded-lg" />
            </div>
          </div>
        </div>
      </section>

      {/* Team Photo */}
      <section className="py-16 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold mb-2">Meet Our Team</h2>
            <p className="text-gray-500 text-sm">Over 256 skilled professionals dedicated to delivering premium quality streetwear</p>
          </div>
          <div className="max-w-4xl mx-auto">
            <img src="/images/team-photo.webp" alt="VEKKST Garment Team" className="w-full rounded-2xl shadow-lg" />
          </div>
        </div>
      </section>

      {/* Capabilities */}
      <section className="py-16 bg-[#F5F5F5] overflow-hidden">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold mb-2">Our Capabilities</h2>
            <p className="text-gray-500 text-sm">Everything you need for your clothing brand under one roof</p>
          </div>
          <div className="grid md:grid-cols-2 gap-4 max-w-3xl mx-auto">
            {capabilities.map((cap) => (
              <div key={cap} className="flex items-center gap-3 bg-white rounded-lg p-4">
                <CheckCircle className="w-5 h-5 text-[#E60012] flex-shrink-0" />
                <span className="text-sm text-gray-700">{cap}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-16 bg-white overflow-hidden">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold mb-2">Our Journey</h2>
            <p className="text-gray-500 text-sm">From a small team to a global manufacturing partner</p>
          </div>
          <div className="space-y-8">
            {milestones.map((m, i) => (
              <div key={i} className="flex gap-6 items-start">
                <div className="w-20 flex-shrink-0 text-right">
                  <span className="text-xl font-bold text-[#E60012]">{m.year}</span>
                </div>
                <div className="w-3 h-3 bg-[#E60012] rounded-full mt-2 flex-shrink-0" />
                <div className="flex-1 pb-8 border-b">
                  <h3 className="font-bold text-lg">{m.title}</h3>
                  <p className="text-gray-600 text-sm">{m.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-[#E60012] text-white text-center overflow-hidden">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to Start Your Project?</h2>
          <p className="text-white/80 mb-6 max-w-xl mx-auto">Get a free quote within 24 hours. Low MOQ from 60 pieces. Custom samples in 3-7 days.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/quote" className="bg-white text-[#E60012] px-8 py-3 rounded font-medium hover:bg-gray-100 transition-colors">Get a Free Quote</Link>
            <a href="https://wa.me/8613125204154" target="_blank" rel="noopener noreferrer" className="border-2 border-white text-white px-8 py-3 rounded font-medium hover:bg-white hover:text-[#E60012] transition-colors">WhatsApp Us</a>
          </div>
        </div>
      </section>
    </>
  );
}
