import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import { LogIn } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";
  const { isAuthenticated } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const loginMutation = trpc.localAuth.login.useMutation({
    onSuccess: (data) => {
      localStorage.setItem("local_auth_token", data.token);
      window.location.href = redirect;
    },
    onError: (err) => setError(err.message),
  });

  if (isAuthenticated) {
    navigate(redirect);
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) { setError("Please fill in all fields"); return; }
    loginMutation.mutate({ email, password });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/">
            <img src="/images/vekkst-logo.webp" alt="VEKKST" className="h-10 w-auto mx-auto mb-4" />
          </Link>
          <h1 className="text-2xl font-bold text-[#333]">Welcome Back</h1>
          <p className="text-gray-500 text-sm mt-1">Sign in to your account</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded">{error}</div>}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" required />
            </div>
            <Button type="submit" className="w-full bg-[#E60012] hover:bg-[#c4000f] text-white" disabled={loginMutation.isPending}>
              <LogIn className="w-4 h-4 mr-2" /> {loginMutation.isPending ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="text-center text-sm text-gray-500">
            Don't have an account?{" "}
            <Link to={`/register?redirect=${encodeURIComponent(redirect)}`} className="text-[#E60012] hover:underline font-medium">Create one</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
