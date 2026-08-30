import { CheckCircle2, Users, Lightbulb, ShoppingBag } from "lucide-react";
import { ProductAnalysis } from "../types";

interface ProductAnalysisViewProps {
  productName: string;
  category: string;
  productDescription: string;
  targetAudience: string;
  extraInfo?: string;
  analysis: ProductAnalysis;
}

export function ProductAnalysisView({
  productName,
  category,
  productDescription,
  targetAudience,
  extraInfo = "",
  analysis,
}: ProductAnalysisViewProps) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden" id="analysis-view-container">
      <div className="p-5 border-b border-white/10 bg-white/5" id="analysis-view-header">
        <div className="flex items-center gap-2 mb-2" id="analysis-category-wrapper">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-bold text-[#FF4D00] bg-[#FF4D00]/10 border border-[#FF4D00]/20 rounded-full" id="analysis-category-pill">
            <ShoppingBag className="w-3.5 h-3.5" />
            {category || "Kategori Umum"}
          </span>
        </div>
        <h2 className="text-xl font-bold text-white line-clamp-2" id="analysis-product-name">
          {productName}
        </h2>
        {productDescription && (
          <p className="text-xs text-slate-400 mt-2 line-clamp-3 leading-relaxed" id="analysis-product-desc">
            {productDescription}
          </p>
        )}
      </div>

      <div className="p-5 space-y-6" id="analysis-view-body">
        {/* Core Selling Points */}
        <div id="selling-points-section">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mb-3" id="selling-points-title">
            <Lightbulb className="w-4 h-4 text-[#FF4D00]" />
            Poin Jual Unik (Selling Points)
          </h3>
          <div className="space-y-2.5" id="selling-points-list">
            {analysis.sellingPoints.map((point, index) => (
              <div key={index} className="flex items-start gap-2.5" id={`selling-point-item-${index}`}>
                <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                <span className="text-sm font-semibold text-slate-200 leading-relaxed" id={`selling-point-text-${index}`}>
                  {point}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Audience Analysis */}
        <div id="audience-analysis-section">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mb-3" id="audience-analysis-title">
            <Users className="w-4 h-4 text-[#FF0055]" />
            Psikologi & Target Audiens
          </h3>
          <div className="p-4 bg-white/5 border border-white/10 rounded-xl" id="audience-analysis-card">
            <h4 className="text-xs font-bold text-slate-400 mb-1" id="audience-target-label">Target Audiens Utama:</h4>
            <p className="text-sm text-[#FF4D00] mb-3 font-bold" id="audience-target-val">
              {targetAudience || "Masyarakat umum / Gen Z / Milenial"}
            </p>
            <h4 className="text-xs font-bold text-slate-400 mb-1" id="audience-psychology-label">Mengapa Mereka Tertarik:</h4>
            <p className="text-sm text-slate-200 leading-relaxed" id="audience-analysis-val">
              {analysis.audienceAnalysis}
            </p>
          </div>
        </div>

        {/* Promo / Extra Info */}
        {extraInfo && (
          <div className="pt-4 border-t border-white/10" id="analysis-extra-section">
            <div className="text-xs font-medium text-amber-200 bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 leading-relaxed" id="analysis-extra-val">
              <span className="block font-bold mb-1.5 uppercase tracking-wider text-[10px] text-amber-400" id="analysis-extra-label">📢 Promo / Informasi Khusus:</span>
              {extraInfo}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
