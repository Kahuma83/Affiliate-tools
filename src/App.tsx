import { useState, useEffect, FormEvent } from "react";
import {
  Sparkles,
  Bot,
  Video,
  AlertCircle,
  Loader2,
  BookOpen,
  Heart,
  TrendingUp,
  Settings,
} from "lucide-react";
import { AffiliateContentPack, HistoryItem } from "./types";
import { TemplateSelector } from "./components/TemplateSelector";
import { HistorySidebar } from "./components/HistorySidebar";
import { ProductAnalysisView } from "./components/ProductAnalysisView";
import { HookDisplay } from "./components/HookDisplay";
import { TikTokRadar, TrendingProduct } from "./components/TikTokRadar";

export default function App() {
  // Navigation Tab State
  const [appNavTab, setAppNavTab] = useState<"generator" | "radar">("generator");

  // Form State
  const [productLink, setProductLink] = useState("");
  const [productName, setProductName] = useState("");
  const [category, setCategory] = useState("Kecantikan & Perawatan");
  const [productDescription, setProductDescription] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [duration, setDuration] = useState("15");
  const [platform, setPlatform] = useState("tiktok");

  // Trend Synced Overrides
  const [productNameOverride, setProductNameOverride] = useState("");
  const [seoKeywords, setSeoKeywords] = useState("");
  const [hashtagsOverride, setHashtagsOverride] = useState("");

  // API settings state
  const [geminiKeysRaw, setGeminiKeysRaw] = useState(() => localStorage.getItem("custom_gemini_keys") || "");
  const [groqKeysRaw, setGroqKeysRaw] = useState(() => localStorage.getItem("custom_groq_keys") || "");
  const [preferredEngine, setPreferredEngine] = useState(() => localStorage.getItem("preferred_engine") || "gemini");
  const [showApiSettings, setShowApiSettings] = useState(false);
  const [testStatus, setTestStatus] = useState<{
    provider: "gemini" | "groq" | null;
    status: "idle" | "testing" | "success" | "error";
    message: string;
  }>({ provider: null, status: "idle", message: "" });

  const cleanGeminiKeys = geminiKeysRaw
    .split(/[\n,]/)
    .map((k) => k.trim())
    .filter(Boolean);
  const cleanGroqKeys = groqKeysRaw
    .split(/[\n,]/)
    .map((k) => k.trim())
    .filter(Boolean);

  // App State
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [contentPack, setContentPack] = useState<AffiliateContentPack | null>(null);
  const [activeTab, setActiveTab] = useState<"fomo" | "problemSolution" | "reviewSpill" | "promoRacun" | "sillyAbsurd" | "outOfTheBox">("fomo");

  // History State
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [selectedHistoryId, setSelectedHistoryId] = useState<string | null>(null);

  // Load history from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("affiliate_scripts_history");
      if (saved) {
        setHistory(JSON.parse(saved));
      }
    } catch (err) {
      console.error("Gagal memuat riwayat dari localStorage:", err);
    }
  }, []);

  // Loading indicator steps simulation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLoading) {
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev + 1) % 4);
      }, 2500);
    } else {
      setLoadingStep(0);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  const loadingMessages = [
    "Menganalisis link toko & mengekstrak data produk...",
    "Meriset psikologi ketertarikan target audiens...",
    "Merangkai kalimat pembuka (Hook 3 detik pertama) yang viral...",
    "Meracik gaya bahasa Gen Z Indonesia dan memoles tanda jeda TTS...",
  ];

  // Save history helper
  const saveToHistory = (
    link: string,
    name: string,
    cat: string,
    desc: string,
    aud: string,
    dur: string,
    plat: string,
    pack: AffiliateContentPack
  ) => {
    try {
      const newItem: HistoryItem = {
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        productLink: link,
        productName: name,
        category: cat,
        productDescription: desc,
        targetAudience: aud,
        duration: dur,
        platform: plat,
        contentPack: pack,
      };

      const updatedHistory = [newItem, ...history];
      setHistory(updatedHistory);
      setSelectedHistoryId(newItem.id);
      localStorage.setItem("affiliate_scripts_history", JSON.stringify(updatedHistory));
    } catch (err) {
      console.error("Gagal menyimpan riwayat:", err);
    }
  };

  // Select item from template library
  const handleSelectTemplate = (template: {
    name: string;
    category: string;
    description: string;
    productLink: string;
    audience: string;
  }) => {
    setProductLink(template.productLink);
    setProductName(template.name);
    setCategory(template.category);
    setProductDescription(template.description);
    setTargetAudience(template.audience);
    setError(null);
  };

  // Select item from history logs
  const handleSelectHistory = (item: HistoryItem) => {
    setProductLink(item.productLink || "");
    setProductName(item.productName);
    setCategory(item.category);
    setProductDescription(item.productDescription);
    setTargetAudience(item.targetAudience);
    if (item.duration) setDuration(item.duration);
    if (item.platform) setPlatform(item.platform);
    setContentPack(item.contentPack);
    setSelectedHistoryId(item.id);
    setActiveTab("fomo");
    setError(null);
  };

  // Delete history item
  const handleDeleteHistory = (id: string) => {
    const updated = history.filter((item) => item.id !== id);
    setHistory(updated);
    localStorage.setItem("affiliate_scripts_history", JSON.stringify(updated));
    if (selectedHistoryId === id) {
      setSelectedHistoryId(null);
      setContentPack(null);
    }
  };

  // Clear all history
  const handleClearAllHistory = () => {
    if (window.confirm("Apakah Anda yakin ingin menghapus seluruh riwayat naskah?")) {
      setHistory([]);
      localStorage.removeItem("affiliate_scripts_history");
      setSelectedHistoryId(null);
      setContentPack(null);
    }
  };

  // Test API Key Connection
  const handleTestConnection = async (provider: "gemini" | "groq") => {
    const rawKeys = provider === "gemini" ? geminiKeysRaw : groqKeysRaw;
    const cleanKeys = rawKeys
      .split(/[\n,]/)
      .map((k) => k.trim())
      .filter(Boolean);

    if (cleanKeys.length === 0) {
      setTestStatus({
        provider,
        status: "error",
        message: "Harap masukkan setidaknya satu Kunci API terlebih dahulu!"
      });
      return;
    }

    setTestStatus({
      provider,
      status: "testing",
      message: `Sedang menguji koneksi ${provider === "gemini" ? "Gemini" : "Groq"}...`
    });

    try {
      const response = await fetch("/api/test-connection", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          provider,
          apiKey: cleanKeys[0],
        }),
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.error || "Gagal menghubungkan ke penyedia layanan.");
      }

      setTestStatus({
        provider,
        status: "success",
        message: resData.message || "Koneksi berhasil dan kunci API valid!"
      });
    } catch (err: any) {
      setTestStatus({
        provider,
        status: "error",
        message: err.message || "Gagal memverifikasi Kunci API."
      });
    }
  };

  // General content generation runner supporting trend overrides
  const runGeneration = async (
    linkToUse: string,
    audienceToUse: string,
    nameOverrideToUse?: string,
    seoKeywordsToUse?: string,
    hashtagsOverrideToUse?: string,
    durationToUse: string = duration,
    platformToUse: string = platform
  ) => {
    setIsLoading(true);
    setError(null);
    setContentPack(null);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productLink: linkToUse,
          targetAudience: audienceToUse,
          apiKeys: {
            gemini: cleanGeminiKeys,
            groq: cleanGroqKeys,
          },
          preferredEngine,
          duration: durationToUse,
          platform: platformToUse,
          productNameOverride: nameOverrideToUse || null,
          seoKeywords: seoKeywordsToUse || null,
          hashtagsOverride: hashtagsOverrideToUse || null
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Gagal menghubungkan ke server Gemini.");
      }

      const resData = await response.json();
      
      const inferredPack: AffiliateContentPack = {
        productAnalysis: resData.productAnalysis,
        hooks: resData.hooks
      };

      setProductName(resData.inferredProductName);
      setCategory(resData.inferredCategory);
      setProductDescription(resData.inferredDescription);
      setContentPack(inferredPack);
      setActiveTab("fomo");

      // Save into history
      saveToHistory(
        linkToUse,
        resData.inferredProductName,
        resData.inferredCategory,
        resData.inferredDescription,
        audienceToUse,
        durationToUse,
        platformToUse,
        inferredPack
      );
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Terjadi kesalahan saat membuat naskah affiliate.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Form Submission / Content Generation
  const handleGenerate = async (e: FormEvent) => {
    e.preventDefault();
    if (!productLink.trim()) {
      setError("Link produk tidak boleh kosong!");
      return;
    }
    await runGeneration(productLink, targetAudience, productNameOverride, seoKeywords, hashtagsOverride);
  };

  // Handle Selection and Immediate Auto-generation from Tab 2 (TikTok Trend Center)
  const handleUseTrendingProduct = async (product: TrendingProduct) => {
    // 1. Switch to the main generator tab
    setAppNavTab("generator");

    // 2. Generate a custom, realistic placeholder product URL for the form field
    const slug = product.name.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-");
    const autoLink = `https://shopee.co.id/product-${slug}`;

    // 3. Pre-fill the form inputs so the user sees them visually filled
    setProductLink(autoLink);
    setProductName(product.name);
    setCategory(product.category);
    setTargetAudience(product.targetAudience);
    setProductNameOverride(product.name);
    setSeoKeywords(product.seoKeywords);
    setHashtagsOverride(product.hashtags);

    // 4. Trigger the generation process programmatically with maximum response speed
    await runGeneration(autoLink, product.targetAudience, product.name, product.seoKeywords, product.hashtags);
  };

  return (
    <div className="min-h-screen bg-[#0F172A] flex flex-col antialiased text-slate-100 font-sans" id="app-root">
      {/* Sleek Professional Header - Vibrant Palette Gradient style */}
      <header className="bg-gradient-to-r from-[#FF4D00] to-[#FF0055] border-b border-white/10 sticky top-0 z-30 shadow-xl" id="main-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3" id="header-brand">
            <div className="p-2.5 bg-white rounded-xl text-[#FF4D00] shadow-md flex items-center justify-center font-black text-xl">
              VO
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-white tracking-tight italic" id="header-title">
                  AFFILIATE VIRAL ENGINE
                </h1>
                <span className="text-[10px] bg-black/25 text-white font-bold px-2 py-0.5 rounded-full uppercase tracking-widest border border-white/20">
                  TTS STUDIO
                </span>
              </div>
              <p className="text-xs text-white/90 font-medium" id="header-subtitle">
                TikTok & Shopee Affiliate Content Pack & Voice Director Indonesia
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-white" id="header-badge-wrap">
            <span className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-full border border-white/10">
              <TrendingUp className="w-3.5 h-3.5 text-[#FF4D00]" />
              Gen Z Style Guide
            </span>
            <span className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-full border border-white/10">
              <Video className="w-3.5 h-3.5 text-[#FF0055]" />
              Short-form Video Optimized
            </span>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8" id="main-content">
        {/* Navigasi Tab Utama di Bagian Atas */}
        <div className="flex border-b border-white/10 mb-8 gap-2 bg-white/5 p-1 rounded-2xl max-w-2xl" id="main-navigation-tabs">
          <button
            onClick={() => setAppNavTab("generator")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm transition-all cursor-pointer ${
              appNavTab === "generator"
                ? "bg-gradient-to-r from-[#FF4D00] to-[#FF0055] text-white shadow-lg"
                : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
            }`}
            id="tab-nav-generator"
          >
            🎬 Generator Konten Affiliate
          </button>
          <button
            onClick={() => setAppNavTab("radar")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm transition-all cursor-pointer relative ${
              appNavTab === "radar"
                ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg"
                : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
            }`}
            id="tab-nav-radar"
          >
            📈 Radar Produk & Ads Viral
            <span className="absolute -top-1 -right-1 bg-[#FF0055] text-white text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border border-slate-900 animate-pulse">
              HOT
            </span>
          </button>
        </div>

        {appNavTab === "generator" ? (
          <>
            {/* Rapid Templates Library */}
            <TemplateSelector onSelect={handleSelectTemplate} />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start" id="app-layout-grid">
          {/* Left Column: Form Controls & History Log */}
          <div className="lg:col-span-5 space-y-6" id="left-column">
            {/* Input Form Card */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl" id="form-container">
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-widest mb-4 flex items-center gap-1.5" id="form-header">
                <Sparkles className="w-4 h-4 text-[#FF4D00] animate-pulse" />
                Riset & Detail Produk
              </h3>

              <form onSubmit={handleGenerate} className="space-y-4" id="generator-form">
                {/* Product Link */}
                <div id="field-product-link">
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex justify-between">
                    <span>Link Produk / Toko <span className="text-[#FF0055]">*</span></span>
                    <span className="text-[10px] text-slate-500 capitalize font-medium">Shopee, TikTok, Tokopedia, dll.</span>
                  </label>
                  <input
                    type="url"
                    required
                    value={productLink}
                    onChange={(e) => {
                      const val = e.target.value;
                      setProductLink(val);
                      // Jika pengguna mengubah isi tautan/link produk secara manual, bersihkan sisa data tren lama
                      if (productNameOverride) {
                        setProductNameOverride("");
                        setSeoKeywords("");
                        setHashtagsOverride("");
                      }
                    }}
                    placeholder="Tempel link produk di sini (cth: https://shopee.co.id/...)"
                    className="w-full text-sm text-slate-100 bg-[#0F172A] border border-white/15 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#FF4D00]/50 focus:border-[#FF4D00]"
                    id="input-product-link"
                  />
                  
                  {productNameOverride && (
                    <div className="mt-2 p-2.5 bg-purple-500/10 border border-purple-500/20 rounded-xl flex items-center justify-between text-xs text-purple-300 animate-fadeIn" id="trend-override-indicator">
                      <span className="truncate pr-2">
                        ⚡ <strong>Sinkronisasi Tren Aktif:</strong> {productNameOverride}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setProductNameOverride("");
                          setSeoKeywords("");
                          setHashtagsOverride("");
                        }}
                        className="text-[10px] text-purple-400 hover:text-purple-200 underline cursor-pointer shrink-0"
                        id="btn-cancel-trend-override"
                      >
                        Batal Gunakan Tren
                      </button>
                    </div>
                  )}
                </div>

                {/* Duration & Platform Selection */}
                <div className="grid grid-cols-2 gap-4" id="duration-platform-grid">
                  {/* Pilihan Durasi */}
                  <div id="field-duration">
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex justify-between">
                      <span>Durasi Video <span className="text-[#FF0055]">*</span></span>
                    </label>
                    <select
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      className="w-full text-sm text-slate-100 bg-[#0F172A] border border-white/15 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#FF4D00]/50 focus:border-[#FF4D00] [&>option]:bg-[#0F172A]"
                      id="select-duration"
                    >
                      <option value="15">15 Detik (~35 kata)</option>
                      <option value="20">20 Detik (~45 kata)</option>
                      <option value="25">25 Detik (~55 kata)</option>
                    </select>
                  </div>

                  {/* Platform Target */}
                  <div id="field-platform">
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex justify-between">
                      <span>Platform Target <span className="text-[#FF0055]">*</span></span>
                    </label>
                    <select
                      value={platform}
                      onChange={(e) => setPlatform(e.target.value)}
                      className="w-full text-sm text-slate-100 bg-[#0F172A] border border-white/15 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#FF4D00]/50 focus:border-[#FF4D00] [&>option]:bg-[#0F172A]"
                      id="select-platform"
                    >
                      <option value="tiktok">🎵 TikTok (FYP & SEO)</option>
                      <option value="shopee">🧡 Shopee Video & Live</option>
                    </select>
                  </div>
                </div>

                {/* Custom Target Audience */}
                <div id="field-target-audience">
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex justify-between">
                    <span>Target Audiens Khusus <span className="text-slate-500 font-normal">(Opsional)</span></span>
                  </label>
                  <input
                    type="text"
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    placeholder="Contoh: Mahasiswa pejuang kulit kusam, anak kos mager..."
                    className="w-full text-sm text-slate-100 bg-[#0F172A] border border-white/15 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#FF4D00]/50 focus:border-[#FF4D00]"
                    id="input-target-audience"
                  />
                </div>

                {/* Duration & Platform Selector */}
                <div className="grid grid-cols-2 gap-4" id="field-duration-platform">
                  <div id="wrapper-video-duration">
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex justify-between">
                      <span>⏱️ Durasi Video</span>
                    </label>
                    <select
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      className="w-full text-sm text-slate-100 bg-[#0F172A] border border-white/15 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#FF4D00]/50 focus:border-[#FF4D00] cursor-pointer"
                      id="select-video-duration"
                    >
                      <option value="15">15 Detik (Singkat)</option>
                      <option value="20">20 Detik (Informatif)</option>
                      <option value="25">25 Detik (Detail)</option>
                    </select>
                  </div>
                  <div id="wrapper-target-platform">
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex justify-between">
                      <span>📱 Platform</span>
                    </label>
                    <select
                      value={platform}
                      onChange={(e) => setPlatform(e.target.value)}
                      className="w-full text-sm text-slate-100 bg-[#0F172A] border border-white/15 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#FF4D00]/50 focus:border-[#FF4D00] cursor-pointer"
                      id="select-target-platform"
                    >
                      <option value="tiktok">TikTok Video</option>
                      <option value="shopee">Shopee Video</option>
                    </select>
                  </div>
                </div>

                {/* Advanced API Key Settings */}
                <div className="border border-white/10 rounded-xl overflow-hidden bg-black/10" id="advanced-api-settings">
                  <button
                    type="button"
                    onClick={() => setShowApiSettings(!showApiSettings)}
                    className="w-full px-4 py-3 flex items-center justify-between text-[11px] font-bold text-slate-300 hover:text-white uppercase tracking-widest bg-white/5 transition-all cursor-pointer"
                    id="toggle-api-settings"
                  >
                    <span className="flex items-center gap-1.5">
                      <Settings className="w-3.5 h-3.5 text-slate-400" />
                      Pengaturan API & Rotasi Mesin
                    </span>
                    <span className="text-xs text-slate-500 font-bold">
                      {showApiSettings ? "▲ Sembunyikan" : "▼ Tampilkan"}
                    </span>
                  </button>

                  {showApiSettings && (
                    <div className="p-4 space-y-4 border-t border-white/10 text-xs" id="api-settings-panel">
                      {/* Preferred Engine */}
                      <div id="field-api-engine">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                          Mesin AI Utama (Teks)
                        </label>
                        <div className="grid grid-cols-2 gap-2" id="engine-selector">
                          <button
                            type="button"
                            onClick={() => {
                              setPreferredEngine("gemini");
                              localStorage.setItem("preferred_engine", "gemini");
                            }}
                            className={`py-2 px-3 rounded-lg border font-bold text-center transition-all cursor-pointer ${
                              preferredEngine === "gemini"
                                ? "bg-[#FF4D00]/10 border-[#FF4D00] text-[#FF4D00]"
                                : "bg-[#0F172A] border-white/10 text-slate-400 hover:text-slate-200"
                            }`}
                          >
                            🤖 Gemini AI
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setPreferredEngine("groq");
                              localStorage.setItem("preferred_engine", "groq");
                            }}
                            className={`py-2 px-3 rounded-lg border font-bold text-center transition-all cursor-pointer ${
                              preferredEngine === "groq"
                                ? "bg-amber-500/10 border-amber-500 text-amber-500"
                                : "bg-[#0F172A] border-white/10 text-slate-400 hover:text-slate-200"
                            }`}
                          >
                            ⚡ Groq (Llama 3)
                          </button>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1">
                          *Groq hanya mendukung pembuatan skrip (teks), pengisian suara (TTS) akan otomatis menggunakan Gemini.
                        </p>
                      </div>

                      {/* Gemini Keys */}
                      <div id="field-api-gemini-keys" className="space-y-1.5">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Gemini API Keys (Rotasi Otomatis)
                        </label>
                        <textarea
                          rows={2}
                          value={geminiKeysRaw}
                          onChange={(e) => {
                            setGeminiKeysRaw(e.target.value);
                            localStorage.setItem("custom_gemini_keys", e.target.value);
                          }}
                          placeholder="Masukkan kunci API Gemini. Pisahkan dengan tanda koma atau baris baru jika lebih dari satu."
                          className="w-full text-xs text-slate-100 bg-[#0F172A] border border-white/15 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-[#FF4D00]/50"
                        />
                        <div className="flex justify-between items-center gap-2">
                          <p className="text-[9px] text-slate-500 leading-relaxed max-w-[70%]">
                            Kosongkan untuk memakai kuota bawaan sistem. Jika dimasukkan banyak kunci, sistem otomatis berputar jika limit tercapai!
                          </p>
                          <button
                            type="button"
                            disabled={testStatus.status === "testing"}
                            onClick={() => handleTestConnection("gemini")}
                            className="text-[10px] font-extrabold px-2.5 py-1.5 bg-[#FF4D00]/10 border border-[#FF4D00]/30 hover:bg-[#FF4D00]/20 text-[#FF4D00] rounded-lg transition-all cursor-pointer whitespace-nowrap shrink-0 disabled:opacity-50"
                          >
                            ⚡ Uji Koneksi
                          </button>
                        </div>
                        {testStatus.provider === "gemini" && testStatus.status !== "idle" && (
                          <div className={`text-[10px] p-2 rounded-lg border font-medium mt-1 ${
                            testStatus.status === "testing" ? "bg-amber-500/5 border-amber-500/20 text-amber-400" :
                            testStatus.status === "success" ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-400" :
                            "bg-rose-500/5 border-rose-500/20 text-rose-400"
                          }`}>
                            {testStatus.message}
                          </div>
                        )}
                      </div>

                      {/* Groq Keys */}
                      <div id="field-api-groq-keys" className="space-y-1.5">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Groq API Keys (Rotasi Otomatis)
                        </label>
                        <textarea
                          rows={2}
                          value={groqKeysRaw}
                          onChange={(e) => {
                            setGroqKeysRaw(e.target.value);
                            localStorage.setItem("custom_groq_keys", e.target.value);
                          }}
                          placeholder="Masukkan kunci API Groq. Pisahkan dengan tanda koma atau baris baru jika lebih dari satu."
                          className="w-full text-xs text-slate-100 bg-[#0F172A] border border-white/15 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-[#FF4D00]/50"
                        />
                        <div className="flex justify-between items-center gap-2">
                          <p className="text-[9px] text-slate-500 leading-relaxed max-w-[70%]">
                            Gunakan kunci API Groq Anda untuk merotasi pemrosesan teks Llama 3 secara instan.
                          </p>
                          <button
                            type="button"
                            disabled={testStatus.status === "testing"}
                            onClick={() => handleTestConnection("groq")}
                            className="text-[10px] font-extrabold px-2.5 py-1.5 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 text-amber-400 rounded-lg transition-all cursor-pointer whitespace-nowrap shrink-0 disabled:opacity-50"
                          >
                            ⚡ Uji Koneksi
                          </button>
                        </div>
                        {testStatus.provider === "groq" && testStatus.status !== "idle" && (
                          <div className={`text-[10px] p-2 rounded-lg border font-medium mt-1 ${
                            testStatus.status === "testing" ? "bg-amber-500/5 border-amber-500/20 text-amber-400" :
                            testStatus.status === "success" ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-400" :
                            "bg-rose-500/5 border-rose-500/20 text-rose-400"
                          }`}>
                            {testStatus.message}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {error && (
                  <div className="p-3.5 bg-[#FF0055]/10 border border-[#FF0055]/20 rounded-xl flex items-start gap-2 text-xs text-rose-300" id="form-error-box">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <p id="form-error-text">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-gradient-to-r from-[#FF4D00] to-[#FF0055] text-white font-bold rounded-xl shadow-lg hover:shadow-pink-500/10 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  id="btn-generate-content"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Menganalisis dengan AI...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Buat Paket Konten Viral
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Sidebar History list */}
            <HistorySidebar
              history={history}
              selectedId={selectedHistoryId}
              onSelect={handleSelectHistory}
              onDelete={handleDeleteHistory}
              onClearAll={handleClearAllHistory}
            />
          </div>

          {/* Right Column: AI Outputs Showcases & Tabs */}
          <div className="lg:col-span-7" id="right-column">
            {isLoading ? (
              /* Beautiful Creative Loading State with glowing indicators */
              <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center shadow-xl flex flex-col items-center justify-center min-h-[480px]" id="loading-container">
                <div className="p-5 bg-[#FF4D00]/10 rounded-2xl mb-4 relative" id="loading-animation-wrapper">
                  <Bot className="w-10 h-10 text-[#FF4D00] animate-bounce" id="loading-icon" />
                  <div className="absolute inset-0 border-2 border-[#FF4D00]/20 border-t-[#FF0055] rounded-2xl animate-spin" id="loading-spinner" />
                </div>
                <h3 className="text-base font-bold text-slate-200" id="loading-title">Sedang Meracik Konten Affiliate...</h3>
                <p className="text-sm text-[#FF4D00] font-bold mt-2.5 h-6" id="loading-step-msg">
                  {loadingMessages[loadingStep]}
                </p>
                <p className="text-xs text-slate-400 mt-4 max-w-sm mx-auto leading-relaxed" id="loading-subdesc">
                  Proses ini memakan waktu sekitar 5-10 detik karena Gemini sedang membuat naskah berkualitas tinggi untuk 6 hook yang berbeda sekaligus.
                </p>
              </div>
            ) : contentPack ? (
              /* Script Package Results View */
              <div className="space-y-6" id="results-dashboard">
                {/* Product analysis report first */}
                <ProductAnalysisView
                  productName={productName}
                  category={category}
                  productDescription={productDescription}
                  targetAudience={targetAudience}
                  analysis={contentPack.productAnalysis}
                />

                {/* Scripts Hooks Tabs Layout */}
                <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-xl" id="hooks-tabs-container">
                  <div className="p-4 border-b border-white/10 bg-white/5" id="hooks-tabs-header">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5" id="hooks-tabs-title">
                      <BookOpen className="w-4 h-4 text-[#FF4D00]" />
                      Pilihan 6 Sudut Pandang / Hook Naskah Iklan
                    </h3>
                  </div>

                  {/* Tabs headers buttons */}
                  <div className="flex border-b border-white/10 overflow-x-auto scrollbar-none bg-white/5" id="tabs-buttons-row">
                    <button
                      onClick={() => setActiveTab("fomo")}
                      className={`flex-1 py-3 px-4 font-bold text-xs whitespace-nowrap border-b-2 text-center transition-all cursor-pointer ${
                        activeTab === "fomo"
                          ? "border-[#FF4D00] text-[#FF4D00] bg-white/5"
                          : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/5"
                      }`}
                      id="tab-btn-fomo"
                    >
                      🚨 1. FOMO / Tren
                    </button>
                    <button
                      onClick={() => setActiveTab("problemSolution")}
                      className={`flex-1 py-3 px-4 font-bold text-xs whitespace-nowrap border-b-2 text-center transition-all cursor-pointer ${
                        activeTab === "problemSolution"
                          ? "border-blue-500 text-blue-400 bg-white/5"
                          : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/5"
                      }`}
                      id="tab-btn-problem"
                    >
                      🧩 2. Masalah & Solusi
                    </button>
                    <button
                      onClick={() => setActiveTab("reviewSpill")}
                      className={`flex-1 py-3 px-4 font-bold text-xs whitespace-nowrap border-b-2 text-center transition-all cursor-pointer ${
                        activeTab === "reviewSpill"
                          ? "border-emerald-500 text-emerald-400 bg-white/5"
                          : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/5"
                      }`}
                      id="tab-btn-review"
                    >
                      💬 3. Jujur & Spill
                    </button>
                    <button
                      onClick={() => setActiveTab("promoRacun")}
                      className={`flex-1 py-3 px-4 font-bold text-xs whitespace-nowrap border-b-2 text-center transition-all cursor-pointer ${
                        activeTab === "promoRacun"
                          ? "border-[#FF0055] text-[#FF0055] bg-white/5"
                          : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/5"
                      }`}
                      id="tab-btn-promo"
                    >
                      🏷️ 4. Promo & Racun
                    </button>
                    {contentPack.hooks.sillyAbsurd && (
                      <button
                        onClick={() => setActiveTab("sillyAbsurd")}
                        className={`flex-1 py-3 px-4 font-bold text-xs whitespace-nowrap border-b-2 text-center transition-all cursor-pointer ${
                          activeTab === "sillyAbsurd"
                            ? "border-purple-500 text-purple-400 bg-white/5"
                            : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/5"
                        }`}
                        id="tab-btn-silly"
                      >
                        🤪 5. Konyol & Absurd
                      </button>
                    )}
                    {contentPack.hooks.outOfTheBox && (
                      <button
                        onClick={() => setActiveTab("outOfTheBox")}
                        className={`flex-1 py-3 px-4 font-bold text-xs whitespace-nowrap border-b-2 text-center transition-all cursor-pointer ${
                          activeTab === "outOfTheBox"
                            ? "border-amber-500 text-amber-400 bg-white/5"
                            : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/5"
                        }`}
                        id="tab-btn-out-of-the-box"
                      >
                        💡 6. Out of the Box
                      </button>
                    )}
                  </div>

                  {/* Active tab content showcase */}
                  <div className="p-5" id="tab-content-panel">
                    {activeTab === "fomo" && (
                      <HookDisplay hook={contentPack.hooks.fomo} hookId="fomo" apiKeys={{ gemini: cleanGeminiKeys }} />
                    )}
                    {activeTab === "problemSolution" && (
                      <HookDisplay hook={contentPack.hooks.problemSolution} hookId="problemSolution" apiKeys={{ gemini: cleanGeminiKeys }} />
                    )}
                    {activeTab === "reviewSpill" && (
                      <HookDisplay hook={contentPack.hooks.reviewSpill} hookId="reviewSpill" apiKeys={{ gemini: cleanGeminiKeys }} />
                    )}
                    {activeTab === "promoRacun" && (
                      <HookDisplay hook={contentPack.hooks.promoRacun} hookId="promoRacun" apiKeys={{ gemini: cleanGeminiKeys }} />
                    )}
                    {activeTab === "sillyAbsurd" && contentPack.hooks.sillyAbsurd && (
                      <HookDisplay hook={contentPack.hooks.sillyAbsurd} hookId="sillyAbsurd" apiKeys={{ gemini: cleanGeminiKeys }} />
                    )}
                    {activeTab === "outOfTheBox" && contentPack.hooks.outOfTheBox && (
                      <HookDisplay hook={contentPack.hooks.outOfTheBox} hookId="outOfTheBox" apiKeys={{ gemini: cleanGeminiKeys }} />
                    )}
                  </div>
                </div>
              </div>
            ) : (
              /* Clean visual Welcome placeholder empty state with glowing accents */
              <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center shadow-xl flex flex-col items-center justify-center min-h-[480px]" id="empty-state-card">
                <div className="w-16 h-16 bg-[#FF4D00]/10 text-[#FF4D00] rounded-2xl flex items-center justify-center mb-5" id="empty-icon-box">
                  <Sparkles className="w-8 h-8 animate-pulse" id="empty-icon" />
                </div>
                <h3 className="text-lg font-bold text-white tracking-tight" id="empty-title">Siap Bikin Konten Affiliate Viral?</h3>
                <p className="text-sm text-slate-400 mt-2 max-w-md mx-auto leading-relaxed" id="empty-desc">
                  Isi informasi produk kamu di panel sebelah kiri atau langsung gunakan **Ide Produk Viral** di atas untuk mulai memikirkan konsep video TikTok / Shopee yang auto fyp!
                </p>
                <div className="mt-6 flex flex-wrap gap-3 justify-center animate-pulse" id="empty-points">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300 bg-white/10 border border-white/10 px-3 py-1.5 rounded-full" id="empty-point-1">
                    ✨ 6 Hook Copywriting
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300 bg-white/10 border border-white/10 px-3 py-1.5 rounded-full" id="empty-point-2">
                    🎙️ Voice Director (TTS)
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300 bg-white/10 border border-white/10 px-3 py-1.5 rounded-full" id="empty-point-3">
                    📈 Prediksi Viralitas
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        </>
        ) : (
          <TikTokRadar onUseProduct={handleUseTrendingProduct} />
        )}
      </main>

      {/* Modern Compact Footer with Slate Theme styling */}
      <footer className="bg-slate-900 border-t border-white/10 mt-12 py-6 text-center text-xs text-slate-500" id="main-footer">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p id="footer-copyright">
            &copy; 2026 Affiliate Copywriter AI. Dipersembahkan khusus untuk TikTok & Shopee Affiliates Indonesia.
          </p>
          <p className="flex items-center gap-1 font-semibold text-slate-400" id="footer-love-msg">
            Dibuat dengan <Heart className="w-3.5 h-3.5 text-[#FF0055] fill-[#FF0055]" /> untuk Kreator Masa Kini
          </p>
        </div>
      </footer>
    </div>
  );
}
