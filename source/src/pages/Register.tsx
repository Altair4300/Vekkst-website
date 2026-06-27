import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import { UserPlus } from "lucide-react";
import { t } from "@/lib/translations";
import { useLanguage } from "@/providers/LanguageProvider";

export default function Register() {
  const { lang } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";
  const { isAuthenticated } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const registerMutation = trpc.localAuth.register.useMutation({
    onSuccess: (data) => {
      localStorage.setItem("local_auth_token", data.token);
      window.location.href = redirect;
    },
    onError: (err) => setError(err.message),
  });

  if (isAuthenticated) {
    navigate(redirect, { replace: true });
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name || !email || !password) { setError(t("fillAllFields", lang)); return; }
    if (password.length < 6) { setError(t("passwordMinLength", lang)); return; }
    if (password !== confirmPassword) { setError(t("passwordsNotMatch", lang)); return; }
    registerMutation.mutate({ name, email, phone: phone || undefined, password });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link to="/">
            <img src="/images/vekkst-logo.webp" alt="VEKKST" className="h-10 w-auto mx-auto mb-4" />
          </Link>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">{t("createAccount", lang)}</h1>
          <p className="text-gray-500 text-sm mt-1">{t("joinUsToday", lang)}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">{error}</div>}
            <div className="space-y-2">
              <Label htmlFor="name">{t("fullName", lang)} *</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" required className="min-h-[44px]" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{t("email", lang)} *</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required className="min-h-[44px]" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">{t("phone", lang)}</Label>
              <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 234 567 890" className="min-h-[44px]" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t("password", lang)} *</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t("passwordMinLength", lang)} required className="min-h-[44px]" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm">{t("confirmPassword", lang)} *</Label>
              <Input id="confirm" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder={t("passwordsNotMatch", lang)} required className="min-h-[44px]" />
            </div>
            <Button type="submit" className="w-full bg-[#E60012] hover:bg-[#c4000f] text-white min-h-[44px]" disabled={registerMutation.isPending}>
              <UserPlus className="w-4 h-4 mr-2" /> {registerMutation.isPending ? t("creatingAccount", lang) : t("createAccount", lang)}
            </Button>
          </form>

          <div className="text-center text-sm text-gray-500 mt-4">
            {t("alreadyHaveAccount", lang)}{" "}
            <Link to={`/login?redirect=${encodeURIComponent(redirect)}`} className="text-[#E60012] hover:underline font-medium">{t("signInLink", lang)}</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
