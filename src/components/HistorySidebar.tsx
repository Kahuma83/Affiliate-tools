import { History, Trash2, Calendar } from "lucide-react";
import { HistoryItem } from "../types";

interface HistorySidebarProps {
  history: HistoryItem[];
  selectedId: string | null;
  onSelect: (item: HistoryItem) => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
}

export function HistorySidebar({
  history,
  selectedId,
  onSelect,
  onDelete,
  onClearAll,
}: HistorySidebarProps) {
  if (history.length === 0) {
    return (
      <div className="p-6 bg-white/5 border border-white/10 rounded-2xl text-center" id="history-empty">
        <History className="w-8 h-8 text-slate-600 mx-auto mb-2" id="history-empty-icon" />
        <h4 className="text-sm font-bold text-slate-300" id="history-empty-title">Belum Ada Riwayat</h4>
        <p className="text-xs text-slate-400 mt-1" id="history-empty-desc">
          Naskah iklan atau riset produk yang kamu buat nanti akan tersimpan rapi di sini.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden" id="history-sidebar">
      <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5" id="history-header">
        <h3 className="text-sm font-bold text-slate-200 flex items-center gap-1.5" id="history-title">
          <History className="w-4 h-4 text-[#FF4D00]" id="history-icon" />
          Riwayat Naskah ({history.length})
        </h3>
        <button
          onClick={onClearAll}
          className="text-xs font-bold text-[#FF0055] hover:text-[#FF4D00] transition-colors bg-[#FF0055]/10 hover:bg-[#FF0055]/25 border border-[#FF0055]/20 px-2.5 py-1 rounded-lg cursor-pointer"
          id="btn-clear-history"
        >
          Hapus Semua
        </button>
      </div>
      <div className="max-h-[360px] overflow-y-auto divide-y divide-white/5" id="history-list">
        {history.map((item) => {
          const isSelected = item.id === selectedId;
          const formattedDate = new Date(item.timestamp).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
          });

          return (
            <div
              key={item.id}
              className={`p-3.5 flex justify-between items-start gap-2 hover:bg-white/10 transition-colors group cursor-pointer ${
                isSelected ? "bg-white/10 border-l-4 border-[#FF4D00] pl-2.5" : ""
              }`}
              onClick={() => onSelect(item)}
              id={`history-item-${item.id}`}
            >
              <div className="flex-1 min-w-0" id={`history-item-body-${item.id}`}>
                <div className="flex flex-wrap items-center gap-1.5 mb-1" id={`history-meta-${item.id}`}>
                  <span className="inline-block px-1.5 py-0.5 text-[9px] font-bold text-[#FF4D00] bg-[#FF4D00]/10 border border-[#FF4D00]/20 rounded" id={`history-category-${item.id}`}>
                    {item.category || "Umum"}
                  </span>
                  {item.duration && (
                    <span className="inline-block px-1.5 py-0.5 text-[9px] font-bold text-slate-300 bg-white/5 border border-white/10 rounded" id={`history-duration-${item.id}`}>
                      {item.duration}s
                    </span>
                  )}
                  {item.platform && (
                    <span className={`inline-block px-1.5 py-0.5 text-[9px] font-bold rounded capitalize border ${
                      item.platform === "shopee" 
                        ? "text-amber-500 bg-amber-500/10 border-amber-500/20" 
                        : "text-sky-400 bg-sky-400/10 border-sky-400/20"
                    }`} id={`history-platform-${item.id}`}>
                      {item.platform}
                    </span>
                  )}
                  <span className="text-[10px] text-slate-400 flex items-center gap-0.5" id={`history-date-${item.id}`}>
                    <Calendar className="w-2.5 h-2.5" />
                    {formattedDate}
                  </span>
                </div>
                <h4
                  className={`text-xs font-bold truncate ${
                    isSelected ? "text-white" : "text-slate-200"
                  }`}
                  id={`history-name-${item.id}`}
                >
                  {item.productName}
                </h4>
                <p className="text-[11px] text-slate-400 truncate mt-0.5" id={`history-desc-${item.id}`}>
                  {item.productDescription || "Tanpa deskripsi"}
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(item.id);
                }}
                className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-[#FF0055] p-1.5 rounded-lg hover:bg-[#FF0055]/10 transition-all cursor-pointer"
                title="Hapus riwayat"
                id={`history-delete-${item.id}`}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
