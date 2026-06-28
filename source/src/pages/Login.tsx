import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import { LogIn } from "lucide-react";
import { t } from "@/lib/translations";
import { useLanguage } from "@/providers/LanguageProvider";

export default function Login() {
  const { lang } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";
  const { isAuthenticated } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const utils = trpc.useUtils();

  useEffect(() => {
    if (isAuthenticated) {
      navigate(redirect, { replace: true });
    }
  }, [isAuthenticated, redirect, navigate]);

  const loginMutation = trpc.localAuth.login.useMutation({
    onSuccess: (data) => {
      localStorage.setItem("local_auth_token", data.token);
      utils.invalidate(); // Clear auth cache so navbar updates
      navigate(redirect, { replace: true });
    },
    onError: (err) => setError(err.message),
  });

  if (isAuthenticated) {
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) { setError(t("fillAllFields", lang)); return; }
    loginMutation.mutate({ email, password });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link to="/">
            <img src="/images/vekkst-logo.webp" alt="VEKKST" className="h-10 w-auto mx-auto mb-4" />
          </Link>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">{t("welcomeBack", lang)}</h1>
          <p className="text-gray-500 text-sm mt-1">{t("signInAccount", lang)}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">{error}</div>}
            <div className="space-y-2">
              <Label htmlFor="email">{t("email", lang)}</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required className="min-h-[44px]" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t("password", lang)}</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t("password", lang)} required className="min-h-[44px]" />
            </div>
            <Button type="submit" className="w-full bg-[#E60012] hover:bg-[#c4000f] text-white min-h-[44px]" disabled={loginMutation.isPending}>
              <LogIn className="w-4 h-4 mr-2" /> {loginMutation.isPending ? t("signingIn", lang) : t("signIn", lang)}
            </Button>
          </form>

          <div className="text-center text-sm text-gray-500 mt-4">
            {t("dontHaveAccount", lang)}{" "}
            <Link to={`/register?redirect=${encodeURIComponent(redirect)}`} className="text-[#E60012] hover:underline font-medium">{t("createOne", lang)}</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
