import { Link } from "react-router";
import { CheckCircle } from "lucide-react";
import { t } from "@/lib/translations";
import { useLanguage } from "@/providers/LanguageProvider";
import { usePageContent } from "@/hooks/usePageContent";

export default function About() {
  const { lang } = useLanguage();
  const { cms } = usePageContent("about");

  const capabilities = [
    t("capability1", lang),
    t("capability2", lang),
    t("capability3", lang),
    t("capability4", lang),
    t("capability5", lang),
    t("capability6", lang),
    t("capability7", lang),
    t("capability8", lang),
  ];

  const milestones = [
    { year: t("milestone1Year", lang), title: t("milestone1Title", lang), desc: t("milestone1Desc", lang) },
    { year: t("milestone2Year", lang), title: t("milestone2Title", lang), desc: t("milestone2Desc", lang) },
    { year: t("milestone3Year", lang), title: t("milestone3Title", lang), desc: t("milestone3Desc", lang) },
    { year: t("milestone4Year", lang), title: t("milestone4Title", lang), desc: t("milestone4Desc", lang) },
    { year: t("milestone5Year", lang), title: t("milestone5Title", lang), desc: t("milestone5Desc", lang) },
    { year: t("milestone6Year", lang), title: t("milestone6Title", lang), desc: t("milestone6Desc", lang) },
  ];

  return (
    <>
      {/* ── Hero ── */}
      <section className="relative h-[40vh] md:h-[50vh] min-h-[240px] max-h-[500px] overflow-hidden">
        <img src={cms("hero-banner", "/images/hero-factory.webp")} alt="Factory" width="1280" height="500" className="w-full h-full object-cover" fetchpriority="high" loading="eager" decoding="async" />
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute inset-0 flex items-center justify-center text-white text-center px-4">
          <div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2">{t("aboutUs", lang)}</h1>
            <p className="text-sm md:text-base opacity-80">Dongguan VEKKST Garment Co., Ltd. | {t("yearsExcellence", lang)}</p>
          </div>
        </div>
      </section>

      {/* ── Company Overview ── */}
      <section className="section bg-white">
        <div className="container-site">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
            {/* Text */}
            <div className="order-2 md:order-1">
              <h2 className="section-title mb-4">{t("aboutUs", lang)}</h2>
              <p className="text-gray-600 leading-relaxed mb-4 text-sm md:text-base">
                {t("aboutIntroP1", lang)}
              </p>
              <p className="text-gray-600 leading-relaxed mb-6 text-sm md:text-base">
                {t("aboutIntroP2", lang)}
              </p>
              {/* Stats grid - 2x2 on mobile, 2x2 on desktop (same, responsive) */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: "14+", label: t("yearsExperience", lang) },
                  { value: "5,000m²", label: t("factorySpace", lang) },
                  { value: "120+", label: t("staffMembers", lang) },
                  { value: "1,100+", label: t("partnerBrands", lang) },
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
            <h2 className="section-title mb-2">{t("meetOurTeam", lang)}</h2>
            <p className="text-gray-500 text-sm max-w-xl mx-auto">{t("meetOurTeamDesc", lang)}</p>
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
            <h2 className="section-title mb-2">{t("ourCapabilities", lang)}</h2>
            <p className="text-gray-500 text-sm max-w-xl mx-auto">{t("ourCapabilitiesDesc", lang)}</p>
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
            <h2 className="section-title mb-2">{t("ourJourney", lang)}</h2>
            <p className="text-gray-500 text-sm max-w-xl mx-auto">{t("ourJourneyDesc", lang)}</p>
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
          <h2 className="text-xl md:text-2xl lg:text-3xl font-bold mb-3">{t("readyToStartProject", lang)}</h2>
          <p className="text-white/80 mb-6 max-w-xl mx-auto text-sm md:text-base">{t("getFreeQuote24Hours", lang)}</p>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <Link to="/quote" className="btn-primary text-sm">{t("getFreeQuote", lang)}</Link>
            <a href="https://wa.me/8613125204154" target="_blank" rel="noopener noreferrer" className="btn-primary bg-white/10 border border-white/30 text-sm">{t("whatsapp", lang)}</a>
          </div>
        </div>
      </section>
    </>
  );
}
