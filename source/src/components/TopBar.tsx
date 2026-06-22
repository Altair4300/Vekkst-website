import { Phone, Mail } from "lucide-react";

export default function TopBar() {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a] border-b border-white/5 text-gray-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 h-8 flex items-center justify-between overflow-hidden">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <Phone className="w-3 h-3 text-amber-400" />
            +86 134 2474 5515
          </span>
          <span className="hidden sm:flex items-center gap-1.5">
            <Mail className="w-3 h-3 text-amber-400" />
            Info@vekkst.com
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden sm:inline text-gray-600">Dongguan VEKKST Garment Co., Ltd.</span>
          <span className="text-amber-400">15+ Years | ODM/OEM | Guangdong, China</span>
        </div>
      </div>
    </div>
  );
}
