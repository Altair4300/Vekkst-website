import { useState } from "react";
import { Link } from "react-router";
import { Search, Loader2, Package, Clock, CheckCircle, XCircle, FileText } from "lucide-react";
import Layout from "@/components/Layout";
import ChatWidget from "@/components/ChatWidget";
import { trpc } from "@/providers/trpc";

const statusConfig: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  new: { label: "New", color: "bg-yellow-100 text-yellow-700", icon: Package },
  processing: { label: "Processing", color: "bg-blue-100 text-blue-700", icon: Clock },
  quoted: { label: "Quoted", color: "bg-purple-100 text-purple-700", icon: FileText },
  accepted: { label: "Accepted", color: "bg-green-100 text-green-700", icon: CheckCircle },
  declined: { label: "Declined", color: "bg-red-100 text-red-700", icon: XCircle },
};

export default function TrackQuote() {
  const [email, setEmail] = useState("");
  const [quoteId, setQuoteId] = useState("");
  const [searched, setSearched] = useState(false);

  const { data: quote, isLoading, error } = trpc.quote.track.useQuery(
    { email, quoteId },
    { enabled: searched && !!email && !!quoteId }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && quoteId) setSearched(true);
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-8">
            <Link to="/">
              <img src="/images/vekkst-logo.png" alt="VEKKST" className="h-40 w-auto mx-auto mb-4" />
            </Link>
            <h1 className="text-2xl font-bold text-[#333]">Track Your Quote</h1>
            <p className="text-gray-500 text-sm mt-1">Enter your email and Quote ID to check the status</p>
          </div>

          {/* Search Form */}
          <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setSearched(false); }}
                    placeholder="you@company.com"
                    className="w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#E60012]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Quote ID</label>
                  <input
                    type="text"
                    value={quoteId}
                    onChange={(e) => { setQuoteId(e.target.value.toUpperCase()); setSearched(false); }}
                    placeholder="e.g. Q250611-A3B2"
                    className="w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#E60012] uppercase"
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-[#E60012] hover:bg-[#c4000f] text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Search className="w-4 h-4" /> Track Quote</>}
              </button>
            </form>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-4 rounded-lg mb-6 text-center">
              {error.message}
            </div>
          )}

          {/* Quote Details */}
          {searched && !isLoading && quote && (
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-gray-500">Quote ID</p>
                    <p className="text-xl font-bold">{quote.quoteId}</p>
                  </div>
                  {(() => {
                    const statusKey = quote.status ?? "new";
                    const s = statusConfig[statusKey] || statusConfig.new;
                    const Icon = s.icon;
                    return (
                      <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${s.color}`}>
                        <Icon className="w-4 h-4" /> {s.label}
                      </span>
                    );
                  })()}
                </div>

                {/* Progress Steps */}
                <div className="flex items-center justify-between mt-6">
                  {["new", "processing", "quoted", "accepted"].map((step, idx) => {
                    const stepConfig = statusConfig[step];
                    const stepIdx = ["new", "processing", "quoted", "accepted"].indexOf(quote.status ?? "new");
                    const isActive = idx <= stepIdx;
                    return (
                      <div key={step} className="flex flex-col items-center gap-1 flex-1">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${isActive ? "bg-[#E60012] text-white" : "bg-gray-200 text-gray-400"}`}>
                          {idx < stepIdx ? "✓" : idx + 1}
                        </div>
                        <span className={`text-xs ${isActive ? "text-[#E60012] font-medium" : "text-gray-400"}`}>{stepConfig.label}</span>
                        {idx < 3 && <div className={`absolute h-0.5 w-full top-4 left-1/2 -z-10 ${isActive ? "bg-[#E60012]" : "bg-gray-200"}`} style={{ transform: "translateX(50%)" }} />}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Quote Info */}
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><p className="text-gray-500">Name</p><p className="font-medium">{quote.name}</p></div>
                  <div><p className="text-gray-500">Email</p><p className="font-medium">{quote.email}</p></div>
                  {quote.company && <div><p className="text-gray-500">Company</p><p className="font-medium">{quote.company}</p></div>}
                  {quote.productType && <div><p className="text-gray-500">Product Type</p><p className="font-medium capitalize">{quote.productType}</p></div>}
                  {quote.quantity && <div><p className="text-gray-500">Quantity</p><p className="font-medium">{quote.quantity}</p></div>}
                  {quote.fabric && <div><p className="text-gray-500">Fabric</p><p className="font-medium">{quote.fabric}</p></div>}
                </div>

                {/* Admin Response */}
                {(quote.quotePrice || quote.quoteTimeline || quote.adminNotes) && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
                    <h3 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" /> Our Response
                    </h3>
                    {quote.quotePrice && <p className="text-sm text-green-700"><strong>Quote Price:</strong> {quote.quotePrice}</p>}
                    {quote.quoteTimeline && <p className="text-sm text-green-700"><strong>Timeline:</strong> {quote.quoteTimeline}</p>}
                    {quote.quoteMou && <p className="text-sm text-green-700"><strong>MOQ:</strong> {quote.quoteMou}</p>}
                    {quote.adminNotes && <p className="text-sm text-green-700 mt-2"><strong>Notes:</strong> {quote.adminNotes}</p>}
                  </div>
                )}

                <p className="text-xs text-gray-400 text-center pt-4">
                  Submitted on {new Date(quote.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          )}

          {/* Help */}
          <div className="text-center mt-8 text-sm text-gray-500">
            <p>Need help? Contact us on <a href="https://wa.me/8613125204154" className="text-[#E60012]">WhatsApp</a> or email <a href="mailto:Info@vekkst.com" className="text-[#E60012]">Info@vekkst.com</a></p>
          </div>
        </div>

        {/* Chat Widget - appears when quote is found */}
        {searched && !isLoading && quote && (
          <ChatWidget
            quoteId={quote.quoteId}
            email={email}
            customerName={quote.name}
          />
        )}
      </div>
    </Layout>
  );
}
