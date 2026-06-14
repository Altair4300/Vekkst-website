import { useState, useEffect, useRef } from "react";
import { Link } from "react-router";
import {
  LayoutDashboard, FileText, MessageSquare, Package, Image, LogOut,
  X, Send, Loader2, Plus, Trash2, Edit3
} from "lucide-react";
import { trpc } from "@/providers/trpc";

type Page = "dashboard" | "quotes" | "messages" | "products" | "media";

// ─── LOGIN SCREEN ───
function AdminLogin({ onLogin }: { onLogin: (token: string) => void }) {
  const [pw, setPw] = useState("");
  const [error, setError] = useState(false);
  const loginMutation = trpc.adminAuth.login.useMutation({
    onSuccess: (data) => {
      if (data.success && data.token) {
        localStorage.setItem("admin_auth_token", data.token);
        onLogin(data.token);
      } else {
        setError(true);
      }
    },
    onError: () => setError(true),
  });

  const handleLogin = () => {
    if (!pw.trim()) return;
    loginMutation.mutate({ password: pw });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1a1a2e] to-[#16213e]">
      <div className="bg-white p-10 rounded-xl w-full max-w-sm shadow-2xl">
        <img src="/images/es-logo.png" alt="ES" className="h-10 mx-auto mb-5" />
        <h1 className="text-center text-xl font-semibold mb-6 text-gray-800">VEKKST Admin Panel</h1>
        <input
          type="password"
          value={pw}
          onChange={(e) => { setPw(e.target.value); setError(false); }}
          onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          placeholder="Enter admin password"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm mb-4 focus:outline-none focus:border-[#E60012]"
        />
        {error && <p className="text-red-500 text-xs text-center mb-3">Incorrect password</p>}
        <button
          onClick={handleLogin}
          disabled={loginMutation.isPending}
          className="w-full py-3 bg-[#E60012] hover:bg-[#c4000f] disabled:opacity-50 text-white rounded-lg text-sm font-semibold transition-colors"
        >
          {loginMutation.isPending ? "Verifying..." : "Sign In"}
        </button>
        <Link to="/" className="block text-center text-xs text-gray-500 mt-4 hover:text-[#E60012]">
          Back to Website
        </Link>
      </div>
    </div>
  );
}

// ─── SIDEBAR ───
function Sidebar({ page, onNavigate, onLogout, unreadCount }: {
  page: Page; onNavigate: (p: Page) => void; onLogout: () => void; unreadCount: number;
}) {
  const navItems: { id: Page; label: string; icon: React.ReactNode }[] = [
    { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-[18px] h-[18px]" /> },
    { id: "quotes", label: "Quotes", icon: <FileText className="w-[18px] h-[18px]" /> },
    { id: "messages", label: "Messages", icon: <MessageSquare className="w-[18px] h-[18px]" /> },
    { id: "products", label: "Products", icon: <Package className="w-[18px] h-[18px]" /> },
    { id: "media", label: "Media", icon: <Image className="w-[18px] h-[18px]" /> },
  ];

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
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
                    <div className={`max-w-[70%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      m.sender === "admin" ? "bg-[#E60012] text-white rounded-br-md" : "bg-white border border-gray-200 text-gray-800 rounded-bl-md"
                    }`}>
                      <p>{m.message}</p>
                      <p className={`text-[10px] mt-1 ${m.sender === "admin" ? "text-white/70" : "text-gray-400"}`}>
                        {m.sender === "admin" ? "You" : m.senderName || "Customer"} &middot; {new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
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
                sendMsg.mutate({ quoteId: activeQuoteId, sender: "admin", senderName: "Admin", message: text.trim() });
              }}
              className="px-4 py-3 bg-white border-t border-gray-200 flex gap-2"
            >
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 px-4 py-2.5 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#E60012]/20"
              />
              <button
                type="submit"
                disabled={!text.trim() || sendMsg.isPending}
                className="px-5 py-2.5 bg-[#E60012] hover:bg-[#c4000f] disabled:opacity-40 text-white rounded-full text-sm font-medium transition-colors flex items-center gap-1"
              >
                {sendMsg.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
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

// ─── MAIN ADMIN PAGE ───
export default function Admin() {
  const [token, setToken] = useState(() =>
    localStorage.getItem("admin_auth_token")
  );
  const [page, setPage] = useState<Page>("dashboard");

  const { data: conversations } = trpc.message.listConversations.useQuery(undefined, {
    enabled: !!token,
    refetchInterval: 10000,
  });
  const unreadCount = conversations?.reduce((s, c) => s + (c.unreadCount || 0), 0) || 0;

  const handleLogin = (newToken: string) => setToken(newToken);
  const handleLogout = () => {
    localStorage.removeItem("admin_auth_token");
    localStorage.removeItem("admin_auth"); // Clear old auth too
    setToken(null);
  };

  if (!token) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  const pageComponents: Record<Page, React.ComponentType> = {
    dashboard: DashboardPage,
    quotes: QuotesPage,
    messages: MessagesPage,
    products: ProductsPage,
    media: MediaPage,
  };
  const ActiveComponent = pageComponents[page];

  return (
    <div className="min-h-screen bg-gray-100">
      <Sidebar page={page} onNavigate={setPage} onLogout={handleLogout} unreadCount={unreadCount} />
      <div className="ml-64">
        <div className="sticky top-0 z-40 bg-white px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold capitalize">{page}</h2>
          <span className="text-sm text-gray-500">VEKKST Admin</span>
        </div>
        <div className="p-6">
          <ActiveComponent />
        </div>
      </div>
    </div>
  );
}
