import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import { t } from "@/lib/translations";
import { useLanguage } from "@/providers/LanguageProvider";

export default function NotFound() {
  const { lang } = useLanguage();
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center max-w-md">
        <img src="/images/vekkst-logo.webp" alt="VEKKST" className="h-12 w-auto mx-auto mb-6 opacity-30" />
        <h1 className="text-6xl font-bold text-[#333] mb-2">404</h1>
        <h2 className="text-xl font-semibold text-[#333] mb-3">{t("pageNotFound", lang)}</h2>
        <p className="text-gray-500 mb-6">{t("pageNotFoundDesc", lang)}</p>
        <Button asChild className="bg-[#E60012] hover:bg-[#c4000f] text-white">
          <Link to="/"><Home className="w-4 h-4 mr-2" /> {t("backToHome", lang)}</Link>
        </Button>
      </div>
    </div>
  );
}
