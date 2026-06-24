import { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send, Loader2, Image, Download, Trash2, Languages } from "lucide-react";
import { trpc } from "@/providers/trpc";
import { useLanguage } from "@/providers/LanguageProvider";
import { t } from "@/lib/translations";

const EMOJIS = ["😀", "😂", "😍", "🙏", "👍", "👎", "🔥", "❤️", "😊", "🎉", "👏", "🤔", "😭", "😎", "🤝", "✅", "📎", "📸", "🎥", "🎁"];

interface ChatWidgetProps {
  quoteId: string;
  email: string;
  customerName?: string;
}

export default function ChatWidget({ quoteId, email, customerName }: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [uploading, setUploading] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const emojiRef = useRef<HTMLDivElement>(null);
  const { lang } = useLanguage();
  const [messageTranslations, setMessageTranslations] = useState<Record<number, string>>({});
  const [translatingIds, setTranslatingIds] = useState<Record<number, boolean>>({});
  const translateMutation = trpc.translation.translate.useMutation();

  const { data: messages, isLoading, refetch } = trpc.message.getConversation.useQuery(
    { quoteId, email },
    { enabled: isOpen && !!quoteId && !!email, refetchInterval: isOpen ? 5000 : false }
  );

  const sendMessage = trpc.message.send.useMutation({
    onSuccess: () => {
      setMessageText("");
      refetch();
    },
  });

  const deleteMsg = trpc.message.deleteCustomerMessage.useMutation({
    onSuccess: () => refetch(),
  });

  const uploadImage = trpc.media.uploadImage.useMutation();
  const uploadVideo = trpc.media.uploadVideo.useMutation();

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    sendMessage.mutate({
      quoteId,
      sender: "customer",
      senderName: customerName || email,
      message: messageText.trim(),
      type: "text",
    });
  };

  const handleEmoji = (emoji: string) => {
    setMessageText((prev) => prev + emoji);
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

  const handleTranslate = async (msgId: number, text: string) => {
    if (messageTranslations[msgId]) return;
    setTranslatingIds(prev => ({ ...prev, [msgId]: true }));
    try {
      const result = await translateMutation.mutateAsync({ text, target: lang });
      if (result.success && result.translated) {
        setMessageTranslations(prev => ({ ...prev, [msgId]: result.translated }));
      }
    } finally {
      setTranslatingIds(prev => ({ ...prev, [msgId]: false }));
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (ev) => {
        const isVideo = file.type.startsWith("video/");
        const data = String(ev.target?.result);
        const result = isVideo
          ? await uploadVideo.mutateAsync({ data, filename: file.name, category: "general" })
          : await uploadImage.mutateAsync({ data, filename: file.name, category: "general" });

        sendMessage.mutate({
          quoteId,
          sender: "customer",
          senderName: customerName || email,
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

  // Scroll to bottom when messages change
  useEffect(() => {
    if (isOpen && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  if (!quoteId || !email) return null;

  return (
    <>
      {/* Floating chat button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-[#E60012] hover:bg-[#c4000f] text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110"
          title="Chat with us"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}

      {/* Chat panel */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-48px)] h-[520px] max-h-[calc(100vh-100px)] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-[#1a1a2e] text-white px-5 py-4 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-sm">{t("chatWithVekkst", lang)}</h3>
              <p className="text-xs text-gray-400 mt-0.5">{t("quoteLabel", lang)}: {quoteId}</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
              </div>
            ) : messages && messages.length > 0 ? (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex group ${msg.sender === "customer" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`relative max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      msg.sender === "customer"
                        ? "bg-[#E60012] text-white rounded-br-md"
                        : "bg-white border border-gray-200 text-gray-800 rounded-bl-md"
                    }`}
                  >
                    {/* Delete button on hover (only for customer messages) */}
                    {msg.sender === "customer" && (
                      <button
                        onClick={() => {
                          if (confirm("Delete this message?")) {
                            deleteMsg.mutate({ id: msg.id, quoteId, email });
                          }
                        }}
                        className="absolute -top-2 -right-2 w-5 h-5 bg-white rounded-full shadow-sm border border-gray-200 text-gray-400 hover:text-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
                        title={t("deleteMessage", lang)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                    {/* File content */}
                    {msg.type === "image" && msg.fileUrl && (
                      <div className="relative">
                        <img src={msg.fileUrl} alt="Shared image" className="rounded-lg mb-1 max-w-full max-h-[200px] object-contain" />
                        <a
                          href={msg.fileUrl}
                          download={msg.message}
                          className="absolute bottom-1 right-1 w-6 h-6 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                          title={t("downloadImage", lang)}
                        >
                          <Download className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                    {msg.type === "video" && msg.fileUrl && (
                      <div className="relative">
                        <video src={msg.fileUrl} controls className="rounded-lg mb-1 max-w-full max-h-[200px]" />
                        <a
                          href={msg.fileUrl}
                          download={msg.message}
                          className="absolute bottom-1 right-1 w-6 h-6 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                          title={t("downloadVideo", lang)}
                        >
                          <Download className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                    <p>{msg.message}</p>
                    {msg.type === "text" && !messageTranslations[msg.id] && (
                      <button
                        onClick={() => handleTranslate(msg.id, msg.message)}
                        disabled={translatingIds[msg.id]}
                        className="text-[10px] opacity-60 hover:opacity-100 underline mt-1 flex items-center gap-0.5"
                        title={t("translate", lang)}
                      >
                        <Languages className="w-3 h-3" />
                        {translatingIds[msg.id] ? "..." : t("translate", lang)}
                      </button>
                    )}
                    {messageTranslations[msg.id] && (
                      <div className={`text-xs mt-1 pt-1 border-t ${msg.sender === "customer" ? "border-white/20" : "border-gray-200"} opacity-80`}>
                        {messageTranslations[msg.id]}
                      </div>
                    )}
                    <p
                      className={`text-[10px] mt-1 flex items-center gap-1 ${
                        msg.sender === "customer" ? "text-white/70" : "text-gray-400"
                      }`}
                    >
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                      {msg.sender === "admin" && msg.readByCustomer === "1" && (
                        <span className="text-emerald-500">✓</span>
                      )}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-400 text-sm">
                <MessageCircle className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p>{t("noMessages", lang)}</p>
                <p className="text-xs mt-1">{t("sendMessageStart", lang)}</p>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form
            onSubmit={handleSend}
            className="px-4 py-3 border-t border-gray-200 bg-white flex items-center gap-2 relative"
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
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder={t("typeMessage", lang)}
              className="flex-1 px-4 py-2.5 bg-gray-100 rounded-full text-base md:text-sm focus:outline-none focus:ring-2 focus:ring-[#E60012]/20"
            />
            <button
              type="submit"
              disabled={!messageText.trim() || sendMessage.isPending || uploading}
              className="w-10 h-10 bg-[#E60012] hover:bg-[#c4000f] disabled:opacity-40 text-white rounded-full flex items-center justify-center transition-colors"
            >
              {sendMessage.isPending || uploading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </form>
        </div>
      )}
    </>
  );
}
