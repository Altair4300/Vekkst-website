import { useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { FileText, User, LogOut, Loader2 } from "lucide-react";

const statusColors: Record<string, string> = {
  new: "bg-yellow-100 text-yellow-700",
  processing: "bg-blue-100 text-blue-700",
  quoted: "bg-purple-100 text-purple-700",
  accepted: "bg-green-100 text-green-700",
  declined: "bg-red-100 text-red-700",
};

const statusLabels: Record<string, string> = {
  new: "New",
  processing: "Processing",
  quoted: "Quoted",
  accepted: "Accepted",
  declined: "Declined",
};

export default function Account() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/login", { replace: true });
    }
  }, [authLoading, isAuthenticated, navigate]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#E60012]" />
      </div>
    );
  }

  if (!isAuthenticated || !user) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-6 md:py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-6 md:mb-8">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">My Account</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your profile and quote history</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {/* Profile Card */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border p-4 md:p-6 space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-[#E60012] rounded-full flex items-center justify-center mx-auto mb-3">
                  <User className="w-8 h-8 md:w-10 md:h-10 text-white" />
                </div>
                <h2 className="font-semibold text-base md:text-lg">{user.name}</h2>
                <p className="text-sm text-gray-500">{user.email}</p>
                {user.phone && <p className="text-sm text-gray-500">{user.phone}</p>}
              </div>

              <div className="space-y-2">
                <Link to="/quote" className="flex items-center gap-3 p-3 bg-[#E60012] text-white rounded-lg text-sm font-medium hover:bg-[#c4000f] transition-colors min-h-[44px]">
                  <FileText className="w-4 h-4" /> Request New Quote
                </Link>
                <Link to="/track-quote" className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg text-sm hover:bg-gray-100 transition-colors min-h-[44px]">
                  <FileText className="w-4 h-4 text-[#E60012]" /> Track a Quote
                </Link>
              </div>

              <Button onClick={logout} variant="outline" className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 min-h-[44px]">
                <LogOut className="w-4 h-4 mr-2" /> Logout
              </Button>
            </div>
          </div>

          {/* Quote History */}
          <div className="md:col-span-2">
            <QuoteHistory email={user.email} />
          </div>
        </div>
      </div>
    </div>
  );
}

function QuoteHistory({ email }: { email: string }) {
  const { data: quotes, isLoading } = trpc.quote.list.useQuery();

  const myQuotes = quotes?.filter((q) => q.email.toLowerCase() === email.toLowerCase()) || [];

  return (
    <div className="bg-white rounded-xl shadow-sm border">
      <div className="p-4 border-b">
        <h2 className="font-semibold flex items-center gap-2 text-sm md:text-base"><FileText className="w-5 h-5 text-[#E60012]" /> My Quote Requests</h2>
      </div>

      {isLoading ? (
        <div className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-[#E60012]" /></div>
      ) : myQuotes.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          <FileText className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p>No quote requests yet</p>
          <Link to="/quote">
            <Button variant="outline" className="mt-4">Request a Quote</Button>
          </Link>
        </div>
      ) : (
        <div className="divide-y">
          {myQuotes.map((quote) => (
            <div key={quote.id} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                <div>
                  <p className="text-sm font-medium">{quote.quoteId}</p>
                  <p className="text-xs text-gray-500">{new Date(quote.createdAt).toLocaleDateString()}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[quote.status ?? "new"] || "bg-gray-100"}`}>
                  {statusLabels[quote.status ?? "new"] || quote.status}
                </span>
              </div>
              <div className="text-sm text-gray-600">
                {quote.productType && <span className="capitalize">{quote.productType}</span>}
                {quote.quantity && <span> | Qty: {quote.quantity}</span>}
              </div>
              {(quote.quotePrice || quote.quoteTimeline) && (
                <div className="mt-2 text-xs bg-green-50 border border-green-200 rounded p-2">
                  {quote.quotePrice && <p><strong>Price:</strong> {quote.quotePrice}</p>}
                  {quote.quoteTimeline && <p><strong>Timeline:</strong> {quote.quoteTimeline}</p>}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
