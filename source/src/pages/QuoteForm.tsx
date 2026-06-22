import { useState, useRef } from "react";
import { Link, useParams, useNavigate } from "react-router";
import { Check, Loader2, ArrowLeft, MessageCircle, Facebook, Instagram, Image } from "lucide-react";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";

export default function QuoteForm() {
  const { productRef } = useParams<{ productRef?: string }>();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"choose" | "form" | "success">("choose");
  const [resultQuoteId, setResultQuoteId] = useState("");
  const [form, setForm] = useState({
    name: "", email: "", company: "", phone: "", productType: "",
    quantity: "", fabric: "", sizeRange: "", deadline: "", requirements: "",
  });
  const [uploadedFiles, setUploadedFiles] = useState<{ url: string; name: string; type: "image" | "video" }[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const submitQuote = trpc.quote.submit.useMutation({
    onSuccess: (data) => {
      setResultQuoteId(data.quoteId);
      setMode("success");
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
  });

  const uploadImage = trpc.media.uploadImage.useMutation();
  const uploadVideo = trpc.media.uploadVideo.useMutation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email) return;
    const designFiles = uploadedFiles.length > 0 ? JSON.stringify(uploadedFiles.map(f => f.url)) : undefined;
    submitQuote.mutate({ ...form, productRef: productRef || undefined, designFiles });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const newFiles: { url: string; name: string; type: "image" | "video" }[] = [];
      for (const file of Array.from(files)) {
        const isVideo = file.type.startsWith("video/");
        const data = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (ev) => resolve(String(ev.target?.result));
          reader.readAsDataURL(file);
        });
        const result = isVideo
          ? await uploadVideo.mutateAsync({ data, filename: file.name, category: "general" })
          : await uploadImage.mutateAsync({ data, filename: file.name, category: "general" });
        newFiles.push({ url: result.url, name: file.name, type: isVideo ? "video" : "image" });
      }
      setUploadedFiles((prev) => [...prev, ...newFiles]);
    } catch {
      alert("Upload failed. Please try again.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Auth gate: redirect to login if not authenticated
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#E60012]" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 py-16 px-4">
        <div className="max-w-lg mx-auto text-center">
          <Link to="/">
            <img src="/images/vekkst-logo.webp" alt="VEKKST" className="h-10 w-auto mx-auto mb-6" />
          </Link>
          <h1 className="text-2xl font-bold text-[#333] mb-3">Sign In Required</h1>
          <p className="text-gray-500 mb-8">Please sign in or create an account to request a free quote. This helps us ensure you're a serious buyer and allows you to track your quote.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to={`/login?redirect=${encodeURIComponent("/quote")}`} className="inline-block bg-[#E60012] hover:bg-[#c4000f] text-white px-8 py-3 rounded-full font-semibold transition-colors">
              Sign In
            </Link>
            <Link to={`/register?redirect=${encodeURIComponent("/quote")}`} className="inline-block border border-[#E60012] text-[#E60012] hover:bg-[#E60012] hover:text-white px-8 py-3 rounded-full font-semibold transition-all">
              Create Account
            </Link>
          </div>
          <Link to="/" className="inline-block mt-6 text-sm text-gray-500 hover:text-[#E60012]">
            &larr; Back to Home
          </Link>
        </div>
      </div>
    );
  }

  if (mode === "success") {
    return (
      <>
        <div className="min-h-screen bg-gray-50 py-16 px-4">
          <div className="max-w-lg mx-auto text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold mb-3">Thank You!</h1>
            <p className="text-gray-600 mb-6">Your quote request has been received. Our team will respond within 24 hours.</p>
            <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
              <p className="text-sm text-gray-500 mb-1">Your Quote ID</p>
              <p className="text-3xl font-bold text-amber-600">{resultQuoteId}</p>
              <p className="text-xs text-gray-400 mt-2">Save this ID to track your quote</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/track-quote" className="inline-block bg-amber-400 hover:bg-amber-500 text-black px-6 py-3 rounded-lg font-medium text-sm">Track Your Quote</Link>
              <Link to="/products" className="inline-block border border-gray-300 hover:border-amber-400 text-gray-700 px-6 py-3 rounded-lg font-medium text-sm">Browse More Designs</Link>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 py-10 px-4">
        <div className="max-w-3xl mx-auto">
          <Link to="/" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-amber-600 mb-6">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>

          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            {/* Header */}
            <div className="bg-[#0a0a0a] text-white p-6">
              <h1 className="text-2xl font-bold">Get a Free Quote</h1>
              <p className="text-gray-400 text-sm mt-1">Choose how you want to reach us</p>
            </div>

            {productRef && (
              <div className="bg-blue-50 border-b border-blue-100 px-6 py-3">
                <p className="text-sm text-blue-700">Requesting quote for product: <strong>#{productRef}</strong></p>
              </div>
            )}

            {/* ─── CHOOSE MODE ─── */}
            {mode === "choose" && (
              <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Option 1: Form */}
                  <button
                    onClick={() => setMode("form")}
                    className="flex flex-col items-center text-center p-8 border-2 border-gray-200 rounded-xl hover:border-amber-400 hover:bg-amber-50 transition-all group"
                  >
                    <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-amber-200 transition-colors">
                      <MessageCircle className="w-8 h-8 text-amber-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Fill Out Form</h3>
                    <p className="text-sm text-gray-500">Send detailed requirements and we'll respond within 24 hours</p>
                    <span className="mt-4 text-amber-600 text-sm font-medium group-hover:underline">Get Started &rarr;</span>
                  </button>

                  {/* Option 2: Social */}
                  <div className="flex flex-col items-center text-center p-8 border-2 border-gray-200 rounded-xl">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                      <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Chat With Us</h3>
                    <div className="flex flex-col gap-3 w-full">
                      <a href="https://wa.me/8613125204154" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg font-medium transition-colors">
                        <MessageCircle className="w-5 h-5" /> WhatsApp
                      </a>
                      <a href="https://www.facebook.com/profile.php?id=61583584470131" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition-colors">
                        <Facebook className="w-5 h-5" /> Facebook
                      </a>
                      <a href="https://www.instagram.com/vekkstgarment/" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 hover:opacity-90 text-white py-3 rounded-lg font-medium transition-opacity">
                        <Instagram className="w-5 h-5" /> Instagram
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ─── FORM MODE ─── */}
            {mode === "form" && (
              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div><label className="block text-sm font-medium mb-1.5">Full Name *</label><input required type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-amber-400" placeholder="John Smith" /></div>
                  <div><label className="block text-sm font-medium mb-1.5">Email *</label><input required type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-amber-400" placeholder="you@company.com" /></div>
                  <div><label className="block text-sm font-medium mb-1.5">Company</label><input type="text" value={form.company} onChange={e => setForm({...form, company: e.target.value})} className="w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-amber-400" placeholder="Your brand" /></div>
                  <div><label className="block text-sm font-medium mb-1.5">Phone / WhatsApp</label><input type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-amber-400" placeholder="+86 134 2474 5515" /></div>
                  <div><label className="block text-sm font-medium mb-1.5">Product Type</label>
                    <select value={form.productType} onChange={e => setForm({...form, productType: e.target.value})} className="w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-amber-400">
                      <option value="">Select type</option><option value="hoodies">Hoodies</option><option value="t-shirts">T-Shirts</option><option value="jackets">Jackets</option><option value="shorts">Shorts</option><option value="pants">Pants</option><option value="tracksuits">Tracksuits</option><option value="other">Other</option>
                    </select>
                  </div>
                  <div><label className="block text-sm font-medium mb-1.5">Quantity</label><input type="text" value={form.quantity} onChange={e => setForm({...form, quantity: e.target.value})} className="w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-amber-400" placeholder="e.g. 500 pcs" /></div>
                  <div><label className="block text-sm font-medium mb-1.5">Fabric</label><input type="text" value={form.fabric} onChange={e => setForm({...form, fabric: e.target.value})} className="w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-amber-400" placeholder="e.g. 100% Cotton, 280gsm" /></div>
                  <div><label className="block text-sm font-medium mb-1.5">Size Range</label><input type="text" value={form.sizeRange} onChange={e => setForm({...form, sizeRange: e.target.value})} className="w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-amber-400" placeholder="e.g. XS-3XL" /></div>
                  <div className="md:col-span-2"><label className="block text-sm font-medium mb-1.5">Deadline</label><input type="date" value={form.deadline} onChange={e => setForm({...form, deadline: e.target.value})} className="w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-amber-400" /></div>
                  <div className="md:col-span-2"><label className="block text-sm font-medium mb-1.5">Special Requirements</label><textarea value={form.requirements} onChange={e => setForm({...form, requirements: e.target.value})} rows={4} className="w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-amber-400 resize-none" placeholder="Custom labels, packaging, printing method, etc." /></div>
                </div>

                {/* Design File Upload — v5 */}
                <div className="md:col-span-2 mt-4">
                  <label className="block text-sm font-medium mb-1.5">Design Files (Images or Videos) — v5</label>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*,video/*"
                    multiple
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="w-full border-2 border-dashed border-gray-300 hover:border-amber-400 rounded-lg px-4 py-4 flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-amber-600 transition-colors"
                  >
                    {uploading ? <Loader2 className="w-5 h-5 animate-spin text-amber-500" /> : <Image className="w-5 h-5" />}
                    {uploading ? "Uploading..." : "Click to upload design images or videos"}
                  </button>
                  <p className="text-xs text-gray-400 mt-1">Upload your design files, mood boards, reference images, or product videos. Max 50MB per file. (Build v6)</p>

                  {/* Uploaded files preview */}
                  {uploadedFiles.length > 0 && (
                    <div className="mt-3 grid grid-cols-4 md:grid-cols-6 gap-2">
                      {uploadedFiles.map((file, i) => (
                        <div key={i} className="relative group">
                          {file.type === "image" ? (
                            <img src={file.url} alt={file.name} className="w-full h-20 object-cover rounded-lg border" />
                          ) : (
                            <div className="w-full h-20 bg-gray-100 rounded-lg border flex items-center justify-center">
                              <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 24 24"><path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4zM14 13h-3v3H9v-3H6v-2h3V8h2v3h3v2z"/></svg>
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={() => removeFile(i)}
                            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Remove"
                          >
                            ×
                          </button>
                          <p className="text-[10px] text-gray-500 mt-0.5 truncate max-w-full">{file.name}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {productRef && <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700">Referencing product: <strong>#{productRef}</strong></div>}
                <button type="submit" disabled={submitQuote.isPending || uploading} className="w-full bg-amber-400 hover:bg-amber-500 text-black py-3.5 rounded-lg font-medium transition-colors disabled:opacity-50 text-base">{submitQuote.isPending || uploading ? <span className="flex items-center justify-center gap-2"><Loader2 className="w-5 h-5 animate-spin" /> Submitting...</span> : "Submit Quote Request"}</button>
                <button type="button" onClick={() => setMode("choose")} className="w-full text-sm text-gray-500 hover:text-gray-700 py-2 text-center">&larr; Back to options</button>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
