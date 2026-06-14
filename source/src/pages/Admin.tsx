import { useState, useEffect, useRef } from "react";
import { Link } from "react-router";
import {
  LayoutDashboard, FileText, MessageSquare, Package, Image, LogOut,
  X, Send, Loader2, Plus, Trash2, Edit3, Users, CheckCircle, XCircle, UserPlus, Download
} from "lucide-react";
import { trpc } from "@/providers/trpc";

type Page = "dashboard" | "quotes" | "messages" | "products" | "media" | "team";

function getPermissions(): string[] {
  const perms = localStorage.getItem("admin_permissions") || "";
  return perms.split(",").filter(Boolean);
}
function hasPermission(perm: string): boolean {
  return getPermissions().includes(perm);
}
function isMainAdmin(): boolean {
  const perms = getPermissions();
  return perms.includes("team") || perms.length === 6;
}
function getDefaultPage(): Page {
  const allPages: Page[] = ["dashboard", "quotes", "messages", "products", "media", "team"];
  const perms = getPermissions();
  return allPages.find((p) => perms.includes(p)) || "dashboard";
}

const EMOJIS = ["😀", "😂", "😍", "🙏", "👍", "👎", "🔥", "❤️", "😊", "🎉", "👏", "🤔", "😭", "😎", "🤝", "✅", "📎", "📸", "🎥", "🎁"];

// ─── LOGIN SCREEN ───
function AdminLogin({ onLogin }: { onLogin: (token: string, permissions: string) => void }) {
  const [pw, setPw] = useState("");
  const [email, setEmail] = useState("");
  const [showReg, setShowReg] = useState(false);
  const [error, setError] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [regStep, setRegStep] = useState<"form" | "pending">("form");

  const loginMutation = trpc.adminAuth.login.useMutation();
  const subadminLogin = trpc.subadmin.login.useMutation();

  const handleLogin = async () => {
    if (!pw.trim()) return;
    setError(false);
    setErrorMsg("");
    try {
      // 1. First try adminAuth.login with password only
      const adminResult = await loginMutation.mutateAsync({ password: pw.trim() });
      if (adminResult.success && adminResult.token) {
        localStorage.setItem("admin_auth_token", adminResult.token);
        localStorage.setItem("admin_permissions", adminResult.permissions || "");
        onLogin(adminResult.token, adminResult.permissions || "");
        return;
      }
    } catch {
      // adminAuth.login failed, fall through to subadmin login
    }
    try {
      // 2. If admin login failed, try subadmin.login with email + password
      if (email.trim()) {
        const subResult = await subadminLogin.mutateAsync({ email: email.trim(), password: pw.trim() });
        if (subResult.success && subResult.token) {
          localStorage.setItem("admin_auth_token", subResult.token);
          localStorage.setItem("admin_permissions", subResult.permissions || "");
          onLogin(subResult.token, subResult.permissions || "");
          return;
        } else {
          setError(true);
          setErrorMsg(subResult.error || "Invalid credentials");
        }
      } else {
        setError(true);
        setErrorMsg("Invalid admin password");
      }
    } catch (err: any) {
      setError(true);
      setErrorMsg(err?.message || "Login failed");
    }
  };

  if (showReg) {
    return <SubadminRegister onBack={() => setShowReg(false)} onPending={() => setRegStep("pending")} />;
  }

  if (regStep === "pending") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1a1a2e] to-[#16213e]">
        <div className="bg-white p-10 rounded-xl w-full max-w-sm shadow-2xl text-center">
          <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
          <h2 className="text-lg font-semibold mb-2 text-gray-800">Application Submitted</h2>
          <p className="text-sm text-gray-500 mb-6">Your application is pending approval. You will be notified once approved.</p>
          <button onClick={() => setRegStep("form")} className="text-sm text-[#E60012] hover:underline">Back to login</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1a1a2e] to-[#16213e]">
      <div className="bg-white p-10 rounded-xl w-full max-w-sm shadow-2xl">
        <img src="/images/es-logo.png" alt="ES" className="h-10 mx-auto mb-5" />
        <h1 className="text-center text-xl font-semibold mb-6 text-gray-800">VEKKST Admin Panel</h1>
        <input
          type="email"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setError(false); }}
          placeholder="Email (optional for team members)"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm mb-3 focus:outline-none focus:border-[#E60012]"
        />
        <input
          type="password"
          value={pw}
          onChange={(e) => { setPw(e.target.value); setError(false); }}
          onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          placeholder="Enter admin password"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm mb-4 focus:outline-none focus:border-[#E60012]"
        />
        {error && <p className="text-red-500 text-xs text-center mb-3">{errorMsg || "Incorrect password"}</p>}
        <button
          onClick={handleLogin}
          disabled={loginMutation.isPending || subadminLogin.isPending}
          className="w-full py-3 bg-[#E60012] hover:bg-[#c4000f] disabled:opacity-50 text-white rounded-lg text-sm font-semibold transition-colors"
        >
          {loginMutation.isPending || subadminLogin.isPending ? "Verifying..." : "Sign In"}
        </button>
        <div className="flex flex-col items-center gap-2 mt-4">
          <button onClick={() => setShowReg(true)} className="text-xs text-gray-500 hover:text-[#E60012] flex items-center gap-1">
            <UserPlus className="w-3 h-3" /> Join as Team Member
          </button>
          <Link to="/" className="text-xs text-gray-500 hover:text-[#E60012]">
            Back to Website
          </Link>
        </div>
      </div>
    </div>
  );
}

function SubadminRegister({ onBack, onPending }: { onBack: () => void; onPending: () => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");

  const register = trpc.subadmin.register.useMutation({
    onSuccess: () => onPending(),
    onError: (err) => setError(err.message || "Registration failed"),
  });

  const handleSubmit = () => {
    setError("");
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("All fields are required");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    register.mutate({ name: name.trim(), email: email.trim(), phone: phone.trim() || undefined, password: password.trim() });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1a1a2e] to-[#16213e]">
      <div className="bg-white p-10 rounded-xl w-full max-w-sm shadow-2xl">
        <img src="/images/es-logo.png" alt="ES" className="h-10 mx-auto mb-5" />
        <h1 className="text-center text-xl font-semibold mb-6 text-gray-800">Join as Team Member</h1>
        <div className="space-y-3">
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Full Name" className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#E60012]" />
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#E60012]" />
          <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone (optional)" className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#E60012]" />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password (min 6 chars)" className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#E60012]" />
          <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Confirm Password" className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#E60012]" />
        </div>
        {error && <p className="text-red-500 text-xs text-center mt-3">{error}</p>}
        <button
          onClick={handleSubmit}
          disabled={register.isPending}
          className="w-full mt-4 py-3 bg-[#E60012] hover:bg-[#c4000f] disabled:opacity-50 text-white rounded-lg text-sm font-semibold transition-colors"
        >
          {register.isPending ? "Submitting..." : "Submit Application"}
        </button>
        <button onClick={onBack} className="w-full mt-3 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors">
          Back to Login
        </button>
      </div>
    </div>
  );
}

// ─── SIDEBAR ───
function Sidebar({ page, onNavigate, onLogout, unreadCount }: {
  page: Page; onNavigate: (p: Page) => void; onLogout: () => void; unreadCount: number;
}) {
  const perms = getPermissions();
  const allNavItems: { id: Page; label: string; icon: React.ReactNode }[] = [
    { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-[18px] h-[18px]" /> },
    { id: "quotes", label: "Quotes", icon: <FileText className="w-[18px] h-[18px]" /> },
    { id: "messages", label: "Messages", icon: <MessageSquare className="w-[18px] h-[18px]" /> },
    { id: "products", label: "Products", icon: <Package className="w-[18px] h-[18px]" /> },
    { id: "media", label: "Media", icon: <Image className="w-[18px] h-[18px]" /> },
    { id: "team", label: "Team", icon: <Users className="w-[18px] h-[18px]" /> },
  ];
  const navItems = allNavItems.filter((item) => perms.includes(item.id));

  return (
    <div className="w-64 bg-[#1a1a2e] text-white fixed top-0 left-0 bottom-0 flex flex-col z-50">
      <div className="p-5 border-b border-white/10 flex items-center gap-3">
        <img src="/images/es-logo.png" alt="ES" className="h-8" />
        <span className="font-semibold text-base">VEKKST Admin</span>
      </div>
      <nav className="p-3 flex-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm mb-1 transition-colors relative ${
              page === item.id ? "bg-[#E60012] text-white" : "text-white/70 hover:bg-white/5 hover:text-white"
            }`}
          >
            {item.icon}
            <span>{item.label}</span>
            {item.id === "messages" && unreadCount > 0 && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 bg-[#E60012] text-white text-[11px] px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                {unreadCount}
              </span>
            )}
          </button>
        ))}
      </nav>
      <div className="p-4 border-t border-white/10">
        <button
          onClick={onLogout}
          className="w-full py-2.5 bg-white/10 hover:bg-white/20 rounded-md text-sm flex items-center justify-center gap-2 transition-colors"
        >
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </div>
    </div>
  );
}

// ─── STAT CARD ───
function StatCard({ label, value, color }: { label: string; value: number | string; color: string }) {
  const colorMap: Record<string, string> = {
    red: "text-[#E60012]",
    blue: "text-blue-600",
    green: "text-emerald-600",
    gray: "text-gray-600",
  };
  return (
    <div className="bg-white p-5 rounded-xl border border-gray-200">
      <p className="text-[13px] text-gray-500 mb-1.5">{label}</p>
      <p className={`text-2xl font-bold ${colorMap[color] || "text-gray-800"}`}>{value}</p>
    </div>
  );
}

// ─── BADGE ───
function StatusBadge({ status }: { status: string }) {
  const config: Record<string, string> = {
    new: "bg-amber-100 text-amber-800",
    processing: "bg-blue-100 text-blue-800",
    quoted: "bg-purple-100 text-purple-800",
    accepted: "bg-emerald-100 text-emerald-800",
    declined: "bg-red-100 text-red-800",
    pending: "bg-amber-100 text-amber-800",
    approved: "bg-emerald-100 text-emerald-800",
  };
  return (
    <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-medium ${config[status] || config.new}`}>
      {status}
    </span>
  );
}

// ─── DASHBOARD ───
function DashboardPage() {
  const { data: stats } = trpc.admin.stats.useQuery();
  const { data: quotes } = trpc.admin.quoteList.useQuery();
  const { data: conversations } = trpc.message.listConversations.useQuery();

  const recentQuotes = quotes?.slice(0, 5) || [];
  const unreadCount = conversations?.reduce((s, c) => s + (c.unreadCount || 0), 0) || 0;

  return (
    <div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Quotes" value={stats?.totalQuotes || 0} color="red" />
        <StatCard label="Products" value={stats?.totalProducts || 0} color="blue" />
        <StatCard label="Customers" value={stats?.totalCustomers || 0} color="gray" />
        <StatCard label="Unread Messages" value={unreadCount} color={unreadCount > 0 ? "red" : "green"} />
        <StatCard label="New Quotes" value={quotes?.filter(q => q.status === "new").length || 0} color="red" />
        <StatCard label="Accepted" value={quotes?.filter(q => q.status === "accepted").length || 0} color="green" />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-[15px] font-semibold">Recent Quotes</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider bg-gray-50">
                <th className="px-4 py-3">Quote ID</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {recentQuotes.map((q) => (
                <tr key={q.id} className="border-t border-gray-50 hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium">{q.quoteId}</td>
                  <td className="px-4 py-3 text-sm">{q.name}</td>
                  <td className="px-4 py-3 text-sm">{q.productType || "-"}</td>
                  <td className="px-4 py-3"><StatusBadge status={q.status || "new"} /></td>
                  <td className="px-4 py-3 text-sm text-gray-500">{new Date(q.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
              {recentQuotes.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400 text-sm">No quotes yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── QUOTES PAGE ───
interface QuoteItem {
  id: number; quoteId: string; name: string; email: string;
  company: string | null; phone: string | null; productType: string | null;
  quantity: string | null; fabric: string | null; sizeRange: string | null;
  deadline: string | null; requirements: string | null;
  status: string | null; createdAt: Date;
}

function QuotesPage() {
  const { data: quotes, refetch } = trpc.admin.quoteList.useQuery();
  const updateQuote = trpc.admin.updateQuote.useMutation({ onSuccess: () => refetch() });
  const [viewing, setViewing] = useState<QuoteItem | null>(null);

  return (
    <div>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="text-[15px] font-semibold">All Quote Requests ({quotes?.length || 0})</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider bg-gray-50">
                <th className="px-4 py-3">Quote ID</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Qty</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {quotes?.map((q) => (
                <tr key={q.id} className="border-t border-gray-50 hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium">{q.quoteId}</td>
                  <td className="px-4 py-3 text-sm">{q.name}</td>
                  <td className="px-4 py-3 text-sm">{q.email}</td>
                  <td className="px-4 py-3 text-sm">{q.productType || "-"}</td>
                  <td className="px-4 py-3 text-sm">{q.quantity || "-"}</td>
                  <td className="px-4 py-3"><StatusBadge status={q.status || "new"} /></td>
                  <td className="px-4 py-3 text-sm text-gray-500">{new Date(q.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => setViewing(q)} className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-md text-xs font-medium transition-colors">
                      View
                    </button>
                  </td>
                </tr>
              ))}
              {(!quotes || quotes.length === 0) && (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-400 text-sm">No quotes yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quote Detail Modal */}
      {viewing && (
        <div className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-4" onClick={() => setViewing(null)}>
          <div className="bg-white rounded-xl w-full max-w-lg max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-[15px] font-semibold">Quote Details</h3>
              <button onClick={() => setViewing(null)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-5 space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-gray-50"><span className="text-gray-500">Quote ID</span><span className="font-medium">{viewing.quoteId}</span></div>
              <div className="flex justify-between py-2 border-b border-gray-50"><span className="text-gray-500">Name</span><span className="font-medium">{viewing.name}</span></div>
              <div className="flex justify-between py-2 border-b border-gray-50"><span className="text-gray-500">Email</span><span className="font-medium">{viewing.email}</span></div>
              <div className="flex justify-between py-2 border-b border-gray-50"><span className="text-gray-500">Company</span><span className="font-medium">{viewing.company || "-"}</span></div>
              <div className="flex justify-between py-2 border-b border-gray-50"><span className="text-gray-500">Phone</span><span className="font-medium">{viewing.phone || "-"}</span></div>
              <div className="flex justify-between py-2 border-b border-gray-50"><span className="text-gray-500">Product</span><span className="font-medium">{viewing.productType || "-"}</span></div>
              <div className="flex justify-between py-2 border-b border-gray-50"><span className="text-gray-500">Quantity</span><span className="font-medium">{viewing.quantity || "-"}</span></div>
              <div className="flex justify-between py-2 border-b border-gray-50"><span className="text-gray-500">Fabric</span><span className="font-medium">{viewing.fabric || "-"}</span></div>
              <div className="flex justify-between py-2 border-b border-gray-50"><span className="text-gray-500">Size Range</span><span className="font-medium">{viewing.sizeRange || "-"}</span></div>
              <div className="flex justify-between py-2 border-b border-gray-50"><span className="text-gray-500">Deadline</span><span className="font-medium">{viewing.deadline || "-"}</span></div>
              <div className="flex justify-between py-2 border-b border-gray-50"><span className="text-gray-500">Status</span><StatusBadge status={viewing.status || "new"} /></div>
              {viewing.requirements && (
                <div className="pt-2">
                  <p className="font-medium mb-1">Requirements:</p>
                  <p className="text-gray-600 text-sm">{viewing.requirements}</p>
                </div>
              )}
              <div className="pt-4 border-t border-gray-100">
                <p className="font-medium text-sm mb-2">Update Status</p>
                <div className="flex gap-2">
                  <select
                    id="status-update"
                    defaultValue={viewing.status || "new"}
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  >
                    <option value="new">New</option>
                    <option value="processing">Processing</option>
                    <option value="quoted">Quoted</option>
                    <option value="accepted">Accepted</option>
                    <option value="declined">Declined</option>
                  </select>
                  <button
                    onClick={() => {
                      const status = (document.getElementById("status-update") as HTMLSelectElement)?.value;
                      if (status) updateQuote.mutate({ id: viewing.id, status: status as "new" | "processing" | "quoted" | "accepted" | "declined" });
                      setViewing(null);
                    }}
                    className="px-4 py-2 bg-[#E60012] hover:bg-[#c4000f] text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    Update
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── MESSAGES PAGE ───
function MessagesPage() {
  const { data: conversations, refetch } = trpc.message.listConversations.useQuery();
  const [activeQuoteId, setActiveQuoteId] = useState<string | null>(null);
  const [activeName, setActiveName] = useState("");
  const [text, setText] = useState("");
  const [uploading, setUploading] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const emojiRef = useRef<HTMLDivElement>(null);

  const { data: messages } = trpc.message.getByQuoteId.useQuery(
    { quoteId: activeQuoteId! },
    { enabled: !!activeQuoteId, refetchInterval: 5000 }
  );

  const sendMsg = trpc.message.send.useMutation({
    onSuccess: () => {
      setText("");
      refetch();
    },
  });
  const deleteMsg = trpc.message.deleteAdminMessage.useMutation({
    onSuccess: () => refetch(),
  });
  const uploadImage = trpc.media.uploadImage.useMutation();
  const uploadVideo = trpc.media.uploadVideo.useMutation();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeQuoteId) return;
    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (ev) => {
        const isVideo = file.type.startsWith("video/");
        const data = String(ev.target?.result);
        const result = isVideo
          ? await uploadVideo.mutateAsync({ data, filename: file.name, category: "general" })
          : await uploadImage.mutateAsync({ data, filename: file.name, category: "general" });

        sendMsg.mutate({
          quoteId: activeQuoteId,
          sender: "admin",
          senderName: localStorage.getItem("admin_name") || "Admin",
          message: file.name,
          type: isVideo ? "video" : "image",
          fileUrl: result.url,
        });
      };
      reader.readAsDataURL(file);
    } catch {
      alert("Upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleEmoji = (emoji: string) => {
    setText((prev) => prev + emoji);
    setShowEmoji(false);
  };

  // Close emoji picker when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (emojiRef.current && !emojiRef.current.contains(e.target as Node)) {
        setShowEmoji(false);
      }
    }
    if (showEmoji) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showEmoji]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden flex" style={{ height: "calc(100vh - 140px)" }}>
      {/* Sidebar */}
      <div className="w-72 border-r border-gray-200 overflow-y-auto">
        <div className="px-4 py-3 border-b border-gray-100 font-semibold text-sm">
          Conversations ({conversations?.length || 0})
        </div>
        {conversations?.map((c) => (
          <button
            key={c.quoteId}
            onClick={() => { setActiveQuoteId(c.quoteId); setActiveName(c.quoteName); }}
            className={`w-full text-left px-4 py-3 border-b border-gray-50 transition-colors ${
              activeQuoteId === c.quoteId ? "bg-red-50 border-l-[3px] border-l-[#E60012]" : "hover:bg-gray-50"
            } ${c.unreadCount > 0 ? "font-semibold" : ""}`}
          >
            <div className="flex justify-between items-center">
              <span className="text-[13px] truncate flex-1">{c.quoteName}</span>
              {c.unreadCount > 0 && (
                <span className="bg-[#E60012] text-white text-[10px] px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                  {c.unreadCount}
                </span>
              )}
            </div>
            <p className="text-[11px] text-gray-400 mt-1 truncate">
              {c.quoteId} &middot; {c.latestMessage?.message?.substring(0, 40) || "No messages"}
            </p>
          </button>
        ))}
        {(!conversations || conversations.length === 0) && (
          <div className="p-8 text-center text-gray-400 text-sm">No conversations yet</div>
        )}
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-gray-50">
        {activeQuoteId ? (
          <>
            <div className="px-5 py-3 bg-white border-b border-gray-200">
              <strong className="text-sm">{activeName}</strong>
              <span className="text-gray-400 text-xs ml-2">{activeQuoteId}</span>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages && messages.length > 0 ? (
                messages.map((m) => (
                  <div key={m.id} className={`flex ${m.sender === "admin" ? "justify-end" : "justify-start"}`}>
                    <div className={`relative max-w-[70%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      m.sender === "admin" ? "bg-[#E60012] text-white rounded-br-md" : "bg-white border border-gray-200 text-gray-800 rounded-bl-md"
                    }`}>
                      {/* Delete button (admin can delete any message) */}
                      <button
                        onClick={() => {
                          if (confirm("Delete this message?")) {
                            deleteMsg.mutate({ id: m.id });
                          }
                        }}
                        className="absolute -top-2 -right-2 w-5 h-5 bg-white rounded-full shadow-sm border border-gray-200 text-gray-400 hover:text-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
                        title="Delete message"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                      {/* File content */}
                      {m.type === "image" && m.fileUrl && (
                        <div className="relative">
                          <img src={m.fileUrl} alt="Shared image" className="rounded-lg mb-1 max-w-full max-h-[200px] object-contain" />
                          <a
                            href={m.fileUrl}
                            download={m.message}
                            className="absolute bottom-1 right-1 w-6 h-6 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                            title="Download image"
                          >
                            <Download className="w-3 h-3" />
                          </a>
                        </div>
                      )}
                      {m.type === "video" && m.fileUrl && (
                        <div className="relative">
                          <video src={m.fileUrl} controls className="rounded-lg mb-1 max-w-full max-h-[200px]" />
                          <a
                            href={m.fileUrl}
                            download={m.message}
                            className="absolute bottom-1 right-1 w-6 h-6 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                            title="Download video"
                          >
                            <Download className="w-3 h-3" />
                          </a>
                        </div>
                      )}
                      <p>{m.message}</p>
                      <p className={`text-[10px] mt-1 flex items-center gap-1 ${m.sender === "admin" ? "text-white/70" : "text-gray-400"}`}>
                        {m.senderName || (m.sender === "admin" ? "Admin" : "Customer")} &middot; {new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        {m.sender === "customer" && m.read === "1" && (
                          <span className="text-emerald-500">✓</span>
                        )}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-400 text-sm">
                  <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p>No messages yet. Start the conversation!</p>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!text.trim() || !activeQuoteId) return;
                sendMsg.mutate({ quoteId: activeQuoteId, sender: "admin", senderName: localStorage.getItem("admin_name") || "Admin", message: text.trim(), type: "text" });
              }}
              className="px-4 py-3 bg-white border-t border-gray-200 flex gap-2"
            >
              <input
                type="file"
                accept="image/*,video/*"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileUpload}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors"
                title="Send image or video"
              >
                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Image className="w-4 h-4" />}
              </button>
              {/* Emoji picker */}
              <div className="relative" ref={emojiRef}>
                <button
                  type="button"
                  onClick={() => setShowEmoji(!showEmoji)}
                  className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors text-lg"
                  title="Emoji"
                >
                  😊
                </button>
                {showEmoji && (
                  <div className="absolute bottom-12 left-0 bg-white rounded-xl shadow-lg border border-gray-200 p-3 grid grid-cols-5 gap-2 w-[220px] z-50">
                    {EMOJIS.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => handleEmoji(emoji)}
                        className="w-8 h-8 hover:bg-gray-100 rounded-lg flex items-center justify-center text-lg transition-colors"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 px-4 py-2.5 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#E60012]/20"
              />
              <button
                type="submit"
                disabled={!text.trim() || sendMsg.isPending || uploading}
                className="px-5 py-2.5 bg-[#E60012] hover:bg-[#c4000f] disabled:opacity-40 text-white rounded-full text-sm font-medium transition-colors flex items-center gap-1"
              >
                {sendMsg.isPending || uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Send
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
            Select a conversation to start chatting
          </div>
        )}
      </div>
    </div>
  );
}

// ─── PRODUCTS PAGE ───
function ProductsPage() {
  const { data: products, refetch } = trpc.product.list.useQuery();
  const createProduct = trpc.product.create.useMutation({ onSuccess: () => { refetch(); setEditing(null); } });
  const updateProduct = trpc.product.update.useMutation({ onSuccess: () => { refetch(); setEditing(null); } });
  const deleteProduct = trpc.product.delete.useMutation({ onSuccess: () => refetch() });
  const uploadImage = trpc.media.uploadImage.useMutation();

  const [editing, setEditing] = useState<{
    id?: number; name: string; slug: string; category: string;
    season: string; image: string; sizes: string; badge: string; description: string;
  } | null>(null);

  interface ProductItem {
    id: number; name: string; slug: string; category: string;
    season: string | null; description: string | null;
    image: string; badge: string | null; sizes: string | null;
  }

  const openAdd = () => setEditing({ name: "", slug: "", category: "", season: "", image: "", sizes: "", badge: "", description: "" });
  const openEdit = (p: ProductItem) => setEditing({
    id: p.id, name: p.name, slug: p.slug, category: p.category,
    season: p.season || "", image: p.image, sizes: p.sizes || "",
    badge: p.badge || "", description: p.description || "",
  });

  const handleSave = () => {
    if (!editing?.name || !editing?.slug || !editing?.category || !editing?.image) {
      alert("Name, slug, category, and image are required");
      return;
    }
    const data = { ...editing, season: editing.season || undefined, sizes: editing.sizes || undefined, badge: editing.badge || undefined, description: editing.description || undefined };
    if (editing.id) {
      updateProduct.mutate({ id: editing.id, ...data });
    } else {
      createProduct.mutate(data);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editing) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const result = await uploadImage.mutateAsync({ data: String(ev.target?.result), filename: file.name, category: editing.category || "general" });
        setEditing({ ...editing, image: result.url });
      } catch { alert("Upload failed"); }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <h3 className="text-base font-semibold">All Products ({products?.length || 0})</h3>
        <button onClick={openAdd} className="px-4 py-2 bg-[#E60012] hover:bg-[#c4000f] text-white rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors">
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {products?.map((p) => (
          <div key={p.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <img src={p.image} alt={p.name} className="w-full h-44 object-cover" onError={(e) => { (e.target as HTMLImageElement).src = "/images/placeholder.jpg"; }} />
            <div className="p-3">
              <p className="text-[13px] font-semibold truncate">{p.name}</p>
              <p className="text-[11px] text-gray-400 capitalize">{p.category}{p.season ? ` · ${p.season}` : ""}</p>
            </div>
            <div className="px-3 py-2 border-t border-gray-50 flex gap-2">
              <button onClick={() => openEdit(p)} className="flex-1 px-2 py-1.5 bg-gray-100 hover:bg-gray-200 rounded text-xs font-medium flex items-center justify-center gap-1 transition-colors">
                <Edit3 className="w-3 h-3" /> Edit
              </button>
              <button onClick={() => { if (confirm("Delete this product?")) deleteProduct.mutate({ id: p.id }); }} className="flex-1 px-2 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded text-xs font-medium flex items-center justify-center gap-1 transition-colors">
                <Trash2 className="w-3 h-3" /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>
      {(!products || products.length === 0) && (
        <div className="text-center py-12 text-gray-400 text-sm">No products. Add your first product!</div>
      )}

      {/* Product Modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-4" onClick={() => setEditing(null)}>
          <div className="bg-white rounded-xl w-full max-w-lg max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-[15px] font-semibold">{editing.id ? "Edit Product" : "Add Product"}</h3>
              <button onClick={() => setEditing(null)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Name *</label>
                <input type="text" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#E60012]" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Slug *</label>
                <input type="text" value={editing.slug} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} placeholder="e.g. oversized-hoodie" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#E60012]" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Category *</label>
                  <select value={editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#E60012]">
                    <option value="">Select</option>
                    <option value="hoodies">Hoodies</option>
                    <option value="t-shirts">T-Shirts</option>
                    <option value="jackets">Jackets</option>
                    <option value="shorts">Shorts</option>
                    <option value="pants">Pants</option>
                    <option value="tracksuits">Tracksuits</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Season</label>
                  <select value={editing.season} onChange={(e) => setEditing({ ...editing, season: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#E60012]">
                    <option value="">Select</option>
                    <option value="spring">Spring</option>
                    <option value="summer">Summer</option>
                    <option value="autumn">Autumn</option>
                    <option value="winter">Winter</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Image URL *</label>
                <input type="text" value={editing.image} onChange={(e) => setEditing({ ...editing, image: e.target.value })} placeholder="/images/your-image.jpg" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#E60012]" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Or Upload Image</label>
                <label className="block border-2 border-dashed border-gray-200 rounded-lg p-6 text-center cursor-pointer hover:border-[#E60012] hover:bg-red-50 transition-colors">
                  <span className="text-gray-400 text-sm">Click to upload image</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                </label>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Sizes</label>
                <input type="text" value={editing.sizes} onChange={(e) => setEditing({ ...editing, sizes: e.target.value })} placeholder="S, M, L, XL, 2XL" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#E60012]" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Badge</label>
                <input type="text" value={editing.badge} onChange={(e) => setEditing({ ...editing, badge: e.target.value })} placeholder="New, Hot, Sale" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#E60012]" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Description</label>
                <textarea value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} rows={3} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#E60012] resize-y" />
              </div>
            </div>
            <div className="px-5 py-4 border-t border-gray-100 flex justify-end gap-2">
              <button onClick={() => setEditing(null)} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors">Cancel</button>
              <button onClick={handleSave} className="px-4 py-2 bg-[#E60012] hover:bg-[#c4000f] text-white rounded-lg text-sm font-medium transition-colors">
                {editing.id ? "Update" : "Add"} Product
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── MEDIA PAGE ───
function MediaPage() {
  const [tab, setTab] = useState<"videos" | "images">("videos");
  const [category, setCategory] = useState("general");
  const { data: videos, refetch: refetchVideos } = trpc.media.listVideos.useQuery({ category });
  const { data: images, refetch: refetchImages } = trpc.media.listImages.useQuery({ category });
  const uploadVideo = trpc.media.uploadVideo.useMutation({ onSuccess: () => refetchVideos() });
  const uploadImage = trpc.media.uploadImage.useMutation({ onSuccess: () => refetchImages() });
  const deleteFile = trpc.media.deleteFile.useMutation({
    onSuccess: () => { refetchVideos(); refetchImages(); },
  });

  const categories = [
    { label: "General", value: "general" },
    { label: "Hoodies", value: "hoodies" },
    { label: "T-Shirts", value: "t-shirts" },
    { label: "Jackets", value: "jackets" },
    { label: "Shorts", value: "shorts" },
    { label: "Pants", value: "pants" },
    { label: "Tracksuits", value: "tracksuits" },
  ];

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: "video" | "image") => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        if (type === "video") {
          await uploadVideo.mutateAsync({ data: String(ev.target?.result), filename: file.name, category });
        } else {
          await uploadImage.mutateAsync({ data: String(ev.target?.result), filename: file.name, category });
        }
      } catch { alert("Upload failed"); }
    };
    reader.readAsDataURL(file);
  };

  const items = tab === "videos" ? (videos || []) : (images || []);

  return (
    <div>
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg mb-5 w-fit">
        <button onClick={() => setTab("videos")} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${tab === "videos" ? "bg-white text-gray-800 shadow-sm" : "text-gray-500"}`}>
          Videos ({videos?.length || 0})
        </button>
        <button onClick={() => setTab("images")} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${tab === "images" ? "bg-white text-gray-800 shadow-sm" : "text-gray-500"}`}>
          Images ({images?.length || 0})
        </button>
      </div>

      <div className="flex gap-3 mb-5 items-center">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#E60012]"
          >
            {categories.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="block border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:border-[#E60012] hover:bg-red-50 transition-colors">
            <span className="text-gray-400 text-sm">Click to upload {tab === "videos" ? "video" : "image"} to <strong>{category}</strong></span>
            <input type="file" accept={tab === "videos" ? "video/*" : "image/*"} className="hidden" onChange={(e) => handleUpload(e, tab === "videos" ? "video" : "image")} />
          </label>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map((item) => (
          <div key={item.url} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {tab === "videos" ? (
              <video src={item.url} controls preload="metadata" className="w-full h-44 object-cover bg-black" />
            ) : (
              <img src={item.url} alt={item.name} className="w-full h-44 object-cover" />
            )}
            <div className="px-3 py-2 flex justify-between items-center">
              <div className="min-w-0">
                <span className="text-xs text-gray-500 truncate block">{item.name}</span>
                <span className="text-[10px] text-gray-400 uppercase">{item.category}</span>
              </div>
              <button onClick={() => { if (confirm("Delete?")) deleteFile.mutate({ path: item.url }); }} className="p-1 hover:bg-red-50 text-red-500 rounded transition-colors">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
      {items.length === 0 && (
        <div className="text-center py-12 text-gray-400 text-sm">No {tab} in <strong>{category}</strong> yet. Upload your first {tab === "videos" ? "video" : "image"}!</div>
      )}
    </div>
  );
}

// ─── TEAM PAGE ───
function TeamPage() {
  const { data: subadmins, refetch } = trpc.subadmin.list.useQuery();
  const approveMutation = trpc.subadmin.approve.useMutation({ onSuccess: () => refetch() });
  const deleteMutation = trpc.subadmin.delete.useMutation({ onSuccess: () => refetch() });
  const updatePermissionsMutation = trpc.subadmin.updatePermissions.useMutation({ onSuccess: () => refetch() });

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editPerms, setEditPerms] = useState<string[]>([]);

  const allPerms = [
    { id: "dashboard", label: "Dashboard" },
    { id: "quotes", label: "Quotes" },
    { id: "messages", label: "Messages" },
    { id: "products", label: "Products" },
    { id: "media", label: "Media" },
    { id: "team", label: "Team" },
  ];

  const pending = subadmins?.filter((s) => s.status === "pending") || [];
  const approved = subadmins?.filter((s) => s.status === "approved") || [];

  const openEditPerms = (s: any) => {
    setEditingId(s.id);
    setEditPerms((s.permissions || "").split(",").filter(Boolean));
  };

  const togglePerm = (perm: string) => {
    setEditPerms((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
    );
  };

  const savePerms = () => {
    if (editingId !== null) {
      updatePermissionsMutation.mutate({ id: editingId, permissions: editPerms });
      setEditingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <StatCard label="Pending Members" value={pending.length} color="red" />
        <StatCard label="Approved Members" value={approved.length} color="green" />
      </div>

      {/* Pending Subadmins */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="text-[15px] font-semibold">Pending Applications ({pending.length})</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider bg-gray-50">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pending.map((s) => (
                <tr key={s.id} className="border-t border-gray-50 hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium">{s.name}</td>
                  <td className="px-4 py-3 text-sm">{s.email}</td>
                  <td className="px-4 py-3 text-sm">{s.phone || "-"}</td>
                  <td className="px-4 py-3"><StatusBadge status={s.status} /></td>
                  <td className="px-4 py-3 text-sm text-gray-500">{new Date(s.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => approveMutation.mutate({ id: s.id })}
                        disabled={approveMutation.isPending}
                        className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-md text-xs font-medium flex items-center gap-1 transition-colors"
                      >
                        <CheckCircle className="w-3 h-3" /> Approve
                      </button>
                      <button
                        onClick={() => { if (confirm("Reject this application?")) deleteMutation.mutate({ id: s.id }); }}
                        disabled={deleteMutation.isPending}
                        className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-md text-xs font-medium flex items-center gap-1 transition-colors"
                      >
                        <XCircle className="w-3 h-3" /> Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {pending.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400 text-sm">No pending applications</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Approved Subadmins */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="text-[15px] font-semibold">Approved Team Members ({approved.length})</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider bg-gray-50">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Permissions</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {approved.map((s) => (
                <tr key={s.id} className="border-t border-gray-50 hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium">{s.name}</td>
                  <td className="px-4 py-3 text-sm">{s.email}</td>
                  <td className="px-4 py-3 text-sm">{s.phone || "-"}</td>
                  <td className="px-4 py-3 text-sm">
                    {(s.permissions || "").split(",").filter(Boolean).join(", ") || "None"}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{new Date(s.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditPerms(s)}
                        className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-md text-xs font-medium flex items-center gap-1 transition-colors"
                      >
                        <Edit3 className="w-3 h-3" /> Edit Permissions
                      </button>
                      <button
                        onClick={() => { if (confirm("Delete this team member?")) deleteMutation.mutate({ id: s.id }); }}
                        disabled={deleteMutation.isPending}
                        className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-md text-xs font-medium flex items-center gap-1 transition-colors"
                      >
                        <Trash2 className="w-3 h-3" /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {approved.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400 text-sm">No approved team members yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Permissions Modal */}
      {editingId !== null && (
        <div className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-4" onClick={() => setEditingId(null)}>
          <div className="bg-white rounded-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-[15px] font-semibold">Update Permissions</h3>
              <button onClick={() => setEditingId(null)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-5 space-y-3">
              {allPerms.map((perm) => (
                <label key={perm.id} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editPerms.includes(perm.id)}
                    onChange={() => togglePerm(perm.id)}
                    className="w-4 h-4 accent-[#E60012]"
                  />
                  <span className="text-sm">{perm.label}</span>
                </label>
              ))}
            </div>
            <div className="px-5 py-4 border-t border-gray-100 flex justify-end gap-2">
              <button onClick={() => setEditingId(null)} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors">Cancel</button>
              <button
                onClick={savePerms}
                disabled={updatePermissionsMutation.isPending}
                className="px-4 py-2 bg-[#E60012] hover:bg-[#c4000f] text-white rounded-lg text-sm font-medium transition-colors"
              >
                {updatePermissionsMutation.isPending ? "Updating..." : "Update Permissions"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── MAIN ADMIN PAGE ───
export default function Admin() {
  const [token, setToken] = useState(() =>
    localStorage.getItem("admin_auth_token")
  );
  const [page, setPage] = useState<Page>(() => getDefaultPage());

  const { data: conversations } = trpc.message.listConversations.useQuery(undefined, {
    enabled: !!token,
    refetchInterval: 10000,
  });
  const unreadCount = conversations?.reduce((s, c) => s + (c.unreadCount || 0), 0) || 0;

  const handleLogin = (newToken: string, newPermissions: string) => {
    setToken(newToken);
    localStorage.setItem("admin_permissions", newPermissions);
    const firstPage = getDefaultPage();
    setPage(firstPage);
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_auth_token");
    localStorage.removeItem("admin_permissions");
    localStorage.removeItem("admin_auth"); // Clear old auth too
    setToken(null);
  };

  // Validate page against permissions
  useEffect(() => {
    if (token && !hasPermission(page)) {
      const firstPage = getDefaultPage();
      setPage(firstPage);
    }
  }, [token, page]);

  if (!token) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  const permittedPage = hasPermission(page) ? page : getDefaultPage();
  const pageComponents: Record<Page, React.ComponentType> = {
    dashboard: DashboardPage,
    quotes: QuotesPage,
    messages: MessagesPage,
    products: ProductsPage,
    media: MediaPage,
    team: TeamPage,
  };
  const ActiveComponent = pageComponents[permittedPage];

  return (
    <div className="min-h-screen bg-gray-100">
      <Sidebar page={permittedPage} onNavigate={setPage} onLogout={handleLogout} unreadCount={unreadCount} />
      <div className="ml-64">
        <div className="sticky top-0 z-40 bg-white px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold capitalize">{permittedPage}</h2>
          <span className="text-sm text-gray-500">VEKKST Admin</span>
        </div>
        <div className="p-6">
          <ActiveComponent />
        </div>
      </div>
    </div>
  );
}
