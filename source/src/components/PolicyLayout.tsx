import { Link } from "react-router";
import { ArrowLeft } from "lucide-react";
import Layout from "./Layout";
import { useLanguage } from "@/providers/LanguageProvider";
import { t } from "@/lib/translations";

interface PolicyLayoutProps {
  title: string;
  children: React.ReactNode;
}

export default function PolicyLayout({ title, children }: PolicyLayoutProps) {
  const { lang } = useLanguage();

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-16">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-amber-600 transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" /> {t("backToHome", lang)}
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mb-8">{title}</h1>
        <div className="prose prose-gray max-w-none text-gray-600 leading-relaxed space-y-6">
          {children}
        </div>
      </div>
    </Layout>
  );
}
