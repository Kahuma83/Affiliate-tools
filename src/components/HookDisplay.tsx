import { useState, useRef, useEffect } from "react";
import {
  Copy,
  Check,
  Play,
  Volume2,
  Edit2,
  Save,
  FileAudio,
  Gauge,
  Zap,
  AlertCircle,
  Loader2,
  Pause,
  Hash,
  FileText,
} from "lucide-react";
import { HookContent } from "../types";

interface HookDisplayProps {
  hook: HookContent;
  hookId: string;
  apiKeys?: {
    gemini: string[];
  };
}

const VOICES = [
  { value: "Zephyr", label: "Zephyr (Ceria & Energik - Rekomendasi TikTok)", lang: "id" },
  { value: "Kore", label: "Kore (Tenang & Ramah)", lang: "id" },
  { value: "Puck", label: "Puck (Asyik & Unik)", lang: "id" },
  { value: "Charon", label: "Charon (Maskulin & Serius)", lang: "id" },
  { value: "Fenrir", label: "Fenrir (Berat & Berwibawa)", lang: "id" },
];

export function HookDisplay({ hook, hookId, apiKeys }: HookDisplayProps) {
  const [editedText, setEditedText] = useState(hook.voiceover);
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedHook, setCopiedHook] = useState(false);
  const [copiedTitle, setCopiedTitle] = useState(false);
  const [copiedDesc, setCopiedDesc] = useState(false);
  const [copiedTags, setCopiedTags] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState("Zephyr");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [ttsLoading, setTtsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [ttsError, setTtsError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Sync state when hook changes
  useEffect(() => {
    setEditedText(hook.voiceover);
    setIsEditing(false);
    setAudioUrl(null);
    setIsPlaying(false);
    setTtsError(null);
    setCopiedTitle(false);
    setCopiedDesc(false);
    setCopiedTags(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
  }, [hook, hookId]);

  // Reset audio cache when text, voice character, or API keys are updated
  useEffect(() => {
    setAudioUrl(null);
    setTtsError(null);
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
  }, [editedText, selectedVoice, apiKeys?.gemini?.join(",")]);

  // Estimate duration based on word count (~130 words per minute)
  const getWordCount = (text: string) => text.trim().split(/\s+/).length;
  const getEstimatedDuration = (text: string) => {
    const words = getWordCount(text);
    const seconds = Math.ceil((words / 130) * 60);
    return seconds;
  };

  // Helper to copy content to clipboard
  const handleCopyText = async (text: string, isHookOnly: boolean) => {
    try {
      await navigator.clipboard.writeText(text);
      if (isHookOnly) {
        setCopiedHook(true);
        setTimeout(() => setCopiedHook(false), 2000);
      } else {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {
      console.error("Gagal menyalin teks:", err);
    }
  };

  // Trigger TTS Generation via server proxy
  const handleGenerateTTS = async () => {
    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
      return;
    }

    if (audioUrl) {
      // Audio is already generated, just play it
      audioRef.current?.play();
      setIsPlaying(true);
      return;
    }

    setTtsLoading(true);
    setTtsError(null);
    try {
      const response = await fetch("/api/tts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: editedText,
          voiceName: selectedVoice,
          apiKeys,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Gagal membuat audio voiceover.");
      }

      const data = await response.json();
      if (!data.audio) {
        throw new Error("Respons audio tidak ditemukan.");
      }

      // Convert base64 audio to binary array then blob URL
      const binary = atob(data.audio);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      const mimeType = data.mimeType || "audio/mp3";
      const blob = new Blob([bytes], { type: mimeType });
      const url = URL.createObjectURL(blob);

      setAudioUrl(url);

      const audio = new Audio(url);
      audioRef.current = audio;

      audio.onended = () => {
        setIsPlaying(false);
      };

      audio.onerror = () => {
        setTtsError("Gagal memainkan format audio.");
        setIsPlaying(false);
      };

      audio.play();
      setIsPlaying(true);
    } catch (err: any) {
      console.error("Gemini TTS failed:", err);
      setTtsError(err.message || "Gagal membuat audio voiceover dari Gemini.");
    } finally {
      setTtsLoading(false);
    }
  };

  // Toggle Play/Pause manually
  const handleTogglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  // Dynamic Viral Score estimation mockups based on Hook keywords & parameters
  const getScores = (hookText: string) => {
    let baseScore = 75;
    const wordCount = getWordCount(hookText);

    // Heuristics for rating
    const hasGenZSlang = /jujurly|spill|checkout|worth it|kaget banget|gokil|racun|parah|gercep/i.test(hookText);
    const hasNumbers = /\d+/.test(hookText);
    const hasPunctuation = /[!,.]/.test(hookText);

    if (hasGenZSlang) baseScore += 10;
    if (hasNumbers) baseScore += 5;
    if (hasPunctuation) baseScore += 5;

    // Adjust for ideal length (not too long, not too short)
    if (wordCount >= 40 && wordCount <= 90) baseScore += 5;
    else baseScore -= 5;

    const finalScore = Math.min(Math.max(baseScore, 60), 98);

    return {
      total: finalScore,
      scrollStopper: Math.min(finalScore + 3, 99),
      retention: Math.min(Math.max(finalScore - 5, 55), 95),
      conversion: Math.min(Math.max(finalScore - 2, 50), 96),
    };
  };

  const scores = getScores(editedText);

  // Vibrant Palette dynamic styling depending on hook type
  const getThemeClasses = (id: string) => {
    switch (id) {
      case "fomo":
        return {
          gradient: "from-amber-500/10 to-transparent",
          border: "border-amber-500/30",
          badge: "bg-amber-500 text-slate-950",
          text: "text-amber-400",
          iconColor: "text-amber-500",
          hoverBorder: "hover:border-amber-500/30",
        };
      case "problemSolution":
        return {
          gradient: "from-blue-500/10 to-transparent",
          border: "border-blue-500/30",
          badge: "bg-blue-500 text-white",
          text: "text-blue-400",
          iconColor: "text-blue-400",
          hoverBorder: "hover:border-blue-500/30",
        };
      case "reviewSpill":
        return {
          gradient: "from-emerald-500/10 to-transparent",
          border: "border-emerald-500/30",
          badge: "bg-emerald-500 text-slate-950",
          text: "text-emerald-400",
          iconColor: "text-emerald-400",
          hoverBorder: "hover:border-emerald-500/30",
        };
      case "promoRacun":
      default:
        return {
          gradient: "from-[#FF0055]/10 to-transparent",
          border: "border-[#FF0055]/30",
          badge: "bg-[#FF0055] text-white",
          text: "text-[#FF0055]",
          iconColor: "text-[#FF0055]",
          hoverBorder: "hover:border-[#FF0055]/30",
        };
    }
  };

  const theme = getThemeClasses(hookId);

  return (
    <div className="space-y-6" id={`hook-display-${hookId}`}>
      {/* 3 Second Viral Scroll Stopper Header */}
      <div className={`bg-gradient-to-br ${theme.gradient} border ${theme.border} rounded-2xl p-5`} id="scroll-stopper-card">
        <div className="flex justify-between items-start mb-2.5" id="scroll-stopper-header">
          <span className={`inline-flex items-center gap-1.5 text-[10px] font-black ${theme.badge} px-2.5 py-1 rounded-full uppercase tracking-widest`} id="scroll-stopper-pill">
            🔥 3 DETIK PERTAMA (SCROLL STOPPER)
          </span>
          <button
            onClick={() => handleCopyText(hook.hookLine, true)}
            className="text-slate-400 hover:text-white transition-colors p-1.5 hover:bg-white/10 rounded-lg border border-white/10 cursor-pointer"
            title="Salin Kalimat Hook"
            id="btn-copy-hook"
          >
            {copiedHook ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
        <p className="text-lg font-bold text-slate-100 leading-snug tracking-wide italic select-all">
          &ldquo;{hook.hookLine}&rdquo;
        </p>
      </div>

      {/* Main Script Workspace */}
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden" id="script-workspace">
        <div className="p-4 border-b border-white/10 bg-white/5 flex justify-between items-center flex-wrap gap-2" id="script-workspace-header">
          <div className="flex items-center gap-2" id="script-meta-container">
            <span className="text-xs font-bold text-slate-300" id="script-title">Naskah Lengkap (VO)</span>
            <span className="inline-block px-2 py-0.5 text-[11px] font-semibold text-slate-400 bg-white/10 border border-white/5 rounded-md" id="script-word-badge">
              {getWordCount(editedText)} Kata
            </span>
            <span className="inline-block px-2 py-0.5 text-[11px] font-semibold text-slate-400 bg-white/10 border border-white/5 rounded-md" id="script-time-badge">
              ~{getEstimatedDuration(editedText)} Detik
            </span>
          </div>

          <div className="flex items-center gap-2" id="script-actions">
            {isEditing ? (
              <button
                onClick={() => setIsEditing(false)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-[#FF4D00] to-[#FF0055] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                id="btn-save-edit"
              >
                <Save className="w-3.5 h-3.5" />
                Simpan
              </button>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                id="btn-edit-script"
              >
                <Edit2 className="w-3.5 h-3.5" />
                Edit Teks
              </button>
            )}

            <button
              onClick={() => handleCopyText(editedText, false)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold rounded-lg transition-colors cursor-pointer"
              id="btn-copy-script"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              Salin Naskah
            </button>
          </div>
        </div>

        <div className="p-5 bg-[#0F172A]/40" id="script-workspace-body">
          {isEditing ? (
            <textarea
              value={editedText}
              onChange={(e) => setEditedText(e.target.value)}
              rows={6}
              className="w-full text-slate-100 text-base leading-relaxed bg-slate-900 border border-white/15 rounded-xl p-4 focus:ring-2 focus:ring-[#FF4D00]/50 focus:border-[#FF4D00] focus:outline-none"
              placeholder="Tulis atau edit naskah voiceover di sini..."
              id="script-editor-textarea"
            />
          ) : (
            <p className="text-slate-200 text-base leading-relaxed whitespace-pre-wrap font-medium select-text" id="script-text-display">
              {editedText}
            </p>
          )}

          {/* Voice Director Guidance Tips */}
          <div className="mt-4 p-4 bg-white/5 border border-white/10 rounded-xl" id="tips-director-box">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mb-1.5" id="tips-director-title">
              <Zap className="w-3.5 h-3.5 text-[#FF4D00]" />
              Arahan Voice Director (Sutradara Suara)
            </h4>
            <p className="text-sm text-slate-300 italic leading-relaxed" id="tips-director-text">
              &ldquo;{hook.tipsDirector}&rdquo;
            </p>
          </div>
        </div>
      </div>

      {/* Dynamic TTS Section */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5" id="tts-audio-section">
        <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2 mb-4" id="tts-section-title">
          <FileAudio className="w-4 h-4 text-[#FF4D00]" />
          Voice Director Studio (Dengar & Unduh Suara)
        </h3>

        <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center" id="tts-controls-wrapper">
          <div className="flex-1" id="voice-selector-wrapper">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5" id="voice-selector-label">
              Karakter Suara Pengisi
            </label>
            <select
              value={selectedVoice}
              onChange={(e) => {
                setSelectedVoice(e.target.value);
                setAudioUrl(null); // Reset generated audio cache
                setIsPlaying(false);
              }}
              className="w-full text-sm text-slate-200 bg-slate-900 border border-white/10 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#FF4D00]/50 focus:border-[#FF4D00] cursor-pointer"
              id="voice-select-dropdown"
            >
              {VOICES.map((voice) => (
                <option key={voice.value} value={voice.value}>
                  {voice.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end gap-2" id="tts-action-buttons">
            <button
              onClick={handleGenerateTTS}
              disabled={ttsLoading}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg text-sm font-bold text-white transition-all shadow-sm cursor-pointer bg-gradient-to-r from-[#FF4D00] to-[#FF0055] hover:from-[#FF4D00]/90 hover:to-[#FF0055]/90 disabled:opacity-50 disabled:cursor-not-allowed"
              id="btn-tts-play"
            >
              {ttsLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Mengisi Suara...
                </>
              ) : isPlaying ? (
                <>
                  <Pause className="w-4 h-4" />
                  Pause Suara
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4" />
                  Dengar Voiceover
                </>
              )}
            </button>

            {audioUrl && !ttsLoading && (
              <div className="flex gap-2" id="audio-loaded-actions">
                <button
                  onClick={handleTogglePlay}
                  className="p-3 text-slate-200 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-colors cursor-pointer"
                  title={isPlaying ? "Pause" : "Play"}
                  id="btn-toggle-play-direct"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>
                <a
                  href={audioUrl}
                  download={`vo-${selectedVoice}-${hookId}.wav`}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-3 text-[#FF4D00] hover:text-[#FF4D00]/90 bg-[#FF4D00]/10 hover:bg-[#FF4D00]/20 rounded-lg border border-[#FF4D00]/30 text-sm font-bold transition-colors cursor-pointer"
                  id="link-download-audio"
                >
                  Unduh WAV
                </a>
              </div>
            )}
          </div>
        </div>

        {ttsError && (
          <div className="mt-3 p-3 bg-[#FF0055]/10 border border-[#FF0055]/20 rounded-lg flex items-start gap-2 text-xs text-rose-300" id="tts-error-box">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <p id="tts-error-text">{ttsError}</p>
          </div>
        )}
      </div>

      {/* Social Media Post Pack (Judul, Deskripsi & Hashtags) */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4" id="social-post-pack-card">
        <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2" id="social-pack-title">
          <FileText className="w-4 h-4 text-[#FF4D00]" />
          Paket Posting Sosial Media (Judul, Caption & Tagar)
        </h3>
        <p className="text-xs text-slate-400 leading-relaxed" id="social-pack-desc">
          Gunakan paket posting siap pakai ini untuk teks deskripsi postingan video kamu di TikTok, Shopee Video, Reels, atau Shorts agar performa konten makin melejit!
        </p>

        <div className="space-y-4" id="social-pack-fields">
          {/* Judul Postingan / Video Title */}
          <div className="bg-slate-900/40 border border-white/5 rounded-xl p-3.5 space-y-1.5" id="social-field-title">
            <div className="flex justify-between items-center" id="social-title-header">
              <span className="text-[10px] font-black text-[#FF4D00] uppercase tracking-wider" id="label-post-title">
                📌 Judul Konten / Postingan
              </span>
              <button
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(hook.postTitle || `🔥 Viral! Rekomendasi Produk Paling Hits!`);
                    setCopiedTitle(true);
                    setTimeout(() => setCopiedTitle(false), 2000);
                  } catch (err) {
                    console.error("Gagal menyalin judul:", err);
                  }
                }}
                className="text-slate-400 hover:text-white transition-colors p-1 hover:bg-white/5 rounded border border-white/10 cursor-pointer text-xs flex items-center gap-1 px-2 py-1"
                title="Salin Judul"
                id="btn-copy-post-title"
              >
                {copiedTitle ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-bold">Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Salin</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-sm font-extrabold text-slate-100 select-all leading-snug">
              {hook.postTitle || `🔥 Viral! Rekomendasi Produk Paling Hits!`}
            </p>
          </div>

          {/* Deskripsi Postingan / Caption */}
          <div className="bg-slate-900/40 border border-white/5 rounded-xl p-3.5 space-y-1.5" id="social-field-desc">
            <div className="flex justify-between items-center" id="social-desc-header">
              <span className="text-[10px] font-black text-blue-400 uppercase tracking-wider" id="label-post-desc">
                📝 Caption Deskripsi / Info Produk
              </span>
              <button
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(hook.postDescription || `Jujurly capek banget dapet barang yang zonk, untung nemu ini! Solusi praktis, estetik, dan pastinya super hemat. Pas banget buat nemenin keseharian kamu yang super aktif. Buruan checkout sekarang lewat keranjang kuning selagi promo masih ada! ✨`);
                    setCopiedDesc(true);
                    setTimeout(() => setCopiedDesc(false), 2000);
                  } catch (err) {
                    console.error("Gagal menyalin deskripsi:", err);
                  }
                }}
                className="text-slate-400 hover:text-white transition-colors p-1 hover:bg-white/5 rounded border border-white/10 cursor-pointer text-xs flex items-center gap-1 px-2 py-1"
                title="Salin Deskripsi"
                id="btn-copy-post-desc"
              >
                {copiedDesc ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-bold">Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Salin</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-sm font-medium text-slate-200 select-all whitespace-pre-wrap leading-relaxed">
              {hook.postDescription || `Jujurly capek banget dapet barang yang zonk, untung nemu ini! Solusi praktis, estetik, dan pastinya super hemat. Pas banget buat nemenin keseharian kamu yang super aktif. Buruan checkout sekarang lewat keranjang kuning selagi promo masih ada! ✨`}
            </p>
          </div>

          {/* Hashtags */}
          <div className="bg-slate-900/40 border border-white/5 rounded-xl p-3.5 space-y-1.5" id="social-field-tags">
            <div className="flex justify-between items-center" id="social-tags-header">
              <span className="text-[10px] font-black text-emerald-400 uppercase tracking-wider" id="label-post-tags">
                #️ Tagar / Hashtags Viral
              </span>
              <button
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(hook.hashtags || `#shopeehaul #racuntiktok #rekomendasiproduk #affiliateindonesia #fyp`);
                    setCopiedTags(true);
                    setTimeout(() => setCopiedTags(false), 2000);
                  } catch (err) {
                    console.error("Gagal menyalin hashtag:", err);
                  }
                }}
                className="text-slate-400 hover:text-white transition-colors p-1 hover:bg-white/5 rounded border border-white/10 cursor-pointer text-xs flex items-center gap-1 px-2 py-1"
                title="Salin Hashtags"
                id="btn-copy-post-tags"
              >
                {copiedTags ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-bold">Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Salin</span>
                  </>
                )}
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1" id="social-tags-list">
              {(hook.hashtags || `#shopeehaul #racuntiktok #rekomendasiproduk #affiliateindonesia #fyp`)
                .split(/\s+/)
                .filter(tag => tag.trim().startsWith("#"))
                .map((tag, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full text-xs font-semibold cursor-pointer hover:bg-emerald-500/20 transition-colors"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(tag);
                      } catch (err) {
                        console.error("Gagal menyalin tag:", err);
                      }
                    }}
                    title="Klik untuk salin tagar saja"
                  >
                    <Hash className="w-3 h-3 shrink-0" />
                    {tag.replace("#", "")}
                  </span>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Viral Score Estimator */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5" id="viral-estimator-card">
        <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2 mb-4" id="viral-section-title">
          <Gauge className="w-4 h-4 text-[#FF4D00]" />
          Riset Viralitas & Prediksi Potensi (Viral Score Index)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center" id="viral-grid">
          {/* Main Hero Score */}
          <div className="text-center md:border-r border-white/10 p-2" id="hero-score-wrapper">
            <div className="text-4xl font-black bg-gradient-to-r from-[#FF4D00] to-[#FF0055] bg-clip-text text-transparent" id="hero-score-value">
              {scores.total}%
            </div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1" id="hero-score-label">
              Viral Index Score
            </div>
          </div>

          {/* Core breakdown sliders */}
          <div className="md:col-span-3 space-y-3" id="score-breakdown-wrapper">
            {/* Scroll Stopper Retention */}
            <div id="metric-scroll-stopper">
              <div className="flex justify-between text-xs font-bold text-slate-300 mb-1" id="label-scroll-stopper">
                <span>Daya Tarik 3 Detik (Scroll Stopper)</span>
                <span className="text-[#FF4D00] font-bold">{scores.scrollStopper}%</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden" id="bar-scroll-stopper">
                <div
                  className="bg-gradient-to-r from-[#FF4D00] to-[#FF0055] h-full rounded-full transition-all duration-500"
                  style={{ width: `${scores.scrollStopper}%` }}
                />
              </div>
            </div>

            {/* Viewer Retention */}
            <div id="metric-retention">
              <div className="flex justify-between text-xs font-bold text-slate-300 mb-1" id="label-retention">
                <span>Estimasi Durasi Tonton (Retention)</span>
                <span className="text-[#FF0055] font-bold">{scores.retention}%</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden" id="bar-retention">
                <div
                  className="bg-gradient-to-r from-[#FF4D00] to-[#FF0055] h-full rounded-full transition-all duration-500"
                  style={{ width: `${scores.retention}%` }}
                />
              </div>
            </div>

            {/* Conversion checkout */}
            <div id="metric-conversion">
              <div className="flex justify-between text-xs font-bold text-slate-300 mb-1" id="label-conversion">
                <span>Potensi Keranjang Kuning (Conversion)</span>
                <span className="text-amber-400 font-bold">{scores.conversion}%</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden" id="bar-conversion">
                <div
                  className="bg-gradient-to-r from-[#FF4D00] to-[#FF0055] h-full rounded-full transition-all duration-500"
                  style={{ width: `${scores.conversion}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic tips for optimizations */}
        <div className="mt-4 p-3 bg-white/5 border border-white/10 rounded-xl text-xs text-slate-300" id="viral-tips-box">
          <span className="font-bold block mb-1 text-[#FF4D00] uppercase tracking-wider text-[10px]" id="viral-tips-header">💡 Tips Optimasi Konten Viral:</span>
          {scores.total >= 85 ? (
            <p id="viral-tips-text">Naskah ini sudah gokil abis! Penggunaan bahasa Gen Z santai dipadukan detail info promo membuat retensi penonton tinggi. Buruan rekam pakai pengisi suara <b>Zephyr</b> biar makin asyik!</p>
          ) : (
            <p id="viral-tips-text">Naskah ini bagus, tapi bisa lebih mantul! Coba tambahkan bahasa gaul viral (e.g. &ldquo;jujurly&rdquo;, &ldquo;spill&rdquo;) di awal kalimat, dan perjelas tanda koma agar intonasi TTS membaca jeda nafas lebih natural.</p>
          )}
        </div>
      </div>
    </div>
  );
}
