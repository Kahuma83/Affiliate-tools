import { Sparkles } from "lucide-react";

export interface Template {
  name: string;
  category: string;
  description: string;
  productLink: string;
  audience: string;
}

const TEMPLATES: Template[] = [
  {
    name: "Cushion Matte Anti-Minyak Viral",
    category: "Kecantikan & Perawatan",
    description: "Cushion lightweight dengan coverage super tinggi, menyamarkan pori-pori, tahan seharian dan gak gampang transfer.",
    productLink: "https://shopee.co.id/Skintific-Cover-All-Perfect-Cushion-SPF35-PA-i.23232.2223",
    audience: "Cewek-cewek remaja sampai dewasa muda usia 18-28 tahun yang hobi dandan cepat pas kuliah atau kerja.",
  },
  {
    name: "TWS Wireless Earbuds Gaming Super Bass",
    category: "Elektronik & Gadget",
    description: "Earbuds bluetooth 5.4 dengan latency super rendah cuma 40ms, bass nendang maksimal, dan baterai tahan lama.",
    productLink: "https://tokopedia.com/anker-official/soundcore-r50i-tws-wireless-earbuds-bass-i.98765",
    audience: "Anak muda gamers, penyuka musik, dan orang yang sering telponan atau join meeting online.",
  },
  {
    name: "Kacamata Hitam Anti-UV Aesthetic Retro",
    category: "Fashion & Aksesoris",
    description: "Kacamata hitam dengan lensa polarized pelindung UV400, frame retro Korea yang super ringan.",
    productLink: "https://tiktok.com/racun-shopee/kacamata-aesthetic-retro-uv400-i.44521",
    audience: "Gen Z yang suka hangout, liburan ke pantai, atau suka foto OOTD buat diposting di media sosial.",
  },
];

interface TemplateSelectorProps {
  onSelect: (template: Template) => void;
}

export function TemplateSelector({ onSelect }: TemplateSelectorProps) {
  return (
    <div className="mb-6" id="template-selector-container">
      <h3 className="text-sm font-semibold text-slate-400 mb-3 flex items-center gap-1.5" id="template-selector-title">
        <Sparkles className="w-4 h-4 text-[#FF4D00]" id="template-icon" />
        Pilih Ide Produk Viral (Mulai Cepat)
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3" id="template-grid">
        {TEMPLATES.map((item, idx) => (
          <button
            key={idx}
            onClick={() => onSelect(item)}
            className="text-left p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all hover:border-white/20 focus:outline-none focus:ring-2 focus:ring-[#FF4D00]/50 cursor-pointer group"
            id={`template-btn-${idx}`}
          >
            <span className="inline-block px-2 py-0.5 text-[11px] font-bold text-[#FF4D00] bg-[#FF4D00]/10 border border-[#FF4D00]/20 rounded-full mb-2" id={`template-badge-${idx}`}>
              {item.category}
            </span>
            <h4 className="text-sm font-bold text-slate-200 group-hover:text-[#FF4D00] transition-colors line-clamp-1" id={`template-name-${idx}`}>
              {item.name}
            </h4>
            <p className="text-xs text-slate-400 mt-1 line-clamp-2" id={`template-desc-${idx}`}>
              {item.description}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
