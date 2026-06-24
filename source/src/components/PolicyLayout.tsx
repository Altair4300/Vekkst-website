import { Link } from "react-router";
import { ArrowLeft } from "lucide-react";
import { useLanguage } from "@/providers/LanguageProvider";
import { t } from "@/lib/translations";

interface PolicyLayoutProps {
  title: string;
  children: React.ReactNode;
}

export default function PolicyLayout({ title, children }: PolicyLayoutProps) {
  const { lang } = useLanguage();

  return (
    <div className="max-w-4xl mx-auto px-4 pt-[calc(3.5rem+2.5rem+1rem)] pb-12 md:pb-16">
      <Link to="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-amber-600 transition-colors mb-6 md:mb-8 min-h-[44px]">
        <ArrowLeft className="w-4 h-4" /> {t("backToHome", lang)}
      </Link>
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 md:mb-8">{title}</h1>
      <div className="prose prose-gray max-w-none text-gray-600 leading-relaxed space-y-6 text-sm md:text-base">
        {children}
      </div>
    </div>
  );
}
