"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Upload, FileText, Image as ImageIcon, Mic, Video } from "lucide-react";
import PricingModal from "@/components/app/PricingModal";

type Tab = "text" | "image" | "audio" | "video";
type Result = { verdict: "ai" | "real" | "fake"; confidence: number };

const TAB_CONFIG: {
  id: Tab;
  label: string;
  icon: React.ReactNode;
  accept: string;
  acceptLabel: string;
  maxMB?: number;
}[] = [
  { id: "text", label: "Text", icon: <FileText size={14} />, accept: "", acceptLabel: "" },
  { id: "image", label: "Image", icon: <ImageIcon size={14} />, accept: "image/*", acceptLabel: "JPG, PNG, GIF, WebP" },
  { id: "audio", label: "Audio", icon: <Mic size={14} />, accept: ".mp3,.wav,.m4a,.ogg,.webm", acceptLabel: "MP3, WAV, M4A, OGG, WebM" },
  { id: "video", label: "Video", icon: <Video size={14} />, accept: ".mp4,.mov,.webm,.avi", acceptLabel: "MP4, MOV, WebM, AVI", maxMB: 50 },
];

export default function DetectPage() {
  const [tab, setTab] = useState<Tab>("text");
  const [text, setText] = useState("");
  const [isPro, setIsPro] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);

  useEffect(() => {
    const plan = localStorage.getItem("tlc_plan") ?? "free";
    setIsPro(plan === "pro" || plan === "family");
  }, []);

  // Per-tab file state
  const [fileBase64, setFileBase64] = useState<Partial<Record<Tab, string>>>({});
  const [fileFilename, setFileFilename] = useState<Partial<Record<Tab, string>>>({});
  const [filePreview, setFilePreview] = useState<Partial<Record<Tab, string>>>({});
  const [fileIsVideo, setFileIsVideo] = useState<Partial<Record<Tab, boolean>>>({});
  const [fileSizeMB, setFileSizeMB] = useState<Partial<Record<Tab, number>>>({});

  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  function loadFile(file: File, targetTab: Tab) {
    const mb = file.size / 1024 / 1024;
    setFileSizeMB((prev) => ({ ...prev, [targetTab]: mb }));
    setFileFilename((prev) => ({ ...prev, [targetTab]: file.name }));
    setResult(null);
    setError("");

    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      setFileBase64((prev) => ({ ...prev, [targetTab]: src }));
      if (file.type.startsWith("image/")) {
        setFilePreview((prev) => ({ ...prev, [targetTab]: src }));
        setFileIsVideo((prev) => ({ ...prev, [targetTab]: false }));
      } else if (file.type.startsWith("video/")) {
        setFileIsVideo((prev) => ({ ...prev, [targetTab]: true }));
        // Generate thumbnail from video
        const objectUrl = URL.createObjectURL(file);
        const vid = document.createElement("video");
        vid.src = objectUrl;
        vid.muted = true;
        vid.currentTime = 1;
        vid.addEventListener("loadeddata", () => {
          const canvas = document.createElement("canvas");
          canvas.width = vid.videoWidth || 640;
          canvas.height = vid.videoHeight || 360;
          canvas.getContext("2d")?.drawImage(vid, 0, 0, canvas.width, canvas.height);
          setFilePreview((prev) => ({ ...prev, [targetTab]: canvas.toDataURL("image/jpeg", 0.7) }));
          URL.revokeObjectURL(objectUrl);
        }, { once: true });
        vid.load();
      } else {
        setFilePreview((prev) => ({ ...prev, [targetTab]: undefined }));
        setFileIsVideo((prev) => ({ ...prev, [targetTab]: false }));
      }
    };
    reader.readAsDataURL(file);
  }

  function clearFile(t: Tab) {
    setFileBase64((prev) => { const n = { ...prev }; delete n[t]; return n; });
    setFileFilename((prev) => { const n = { ...prev }; delete n[t]; return n; });
    setFilePreview((prev) => { const n = { ...prev }; delete n[t]; return n; });
    setFileIsVideo((prev) => { const n = { ...prev }; delete n[t]; return n; });
    setFileSizeMB((prev) => { const n = { ...prev }; delete n[t]; return n; });
    setResult(null);
    setError("");
  }

  const handleDrop = useCallback((e: React.DragEvent, targetTab: Tab) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (!file) return;
    loadFile(file, targetTab);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleAnalyze() {
    setError("");
    setResult(null);

    if (tab === "text" && text.trim().length < 50) {
      setError("Paste at least 50 characters to analyze.");
      return;
    }
    if (tab !== "text" && !fileBase64[tab]) {
      setError("Upload a file first.");
      return;
    }

    const tabConfig = TAB_CONFIG.find((t) => t.id === tab)!;
    const mb = fileSizeMB[tab] ?? 0;
    if (tabConfig.maxMB && mb > tabConfig.maxMB) {
      setError(`File is ${mb.toFixed(1)} MB. Please keep video files under ${tabConfig.maxMB} MB.`);
      return;
    }

    setLoading(true);
    try {
      const plan = localStorage.getItem("tlc_plan") ?? "free";
      const body =
        tab === "text"
          ? { type: "text", content: text, plan }
          : { type: tab, content: fileBase64[tab], filename: fileFilename[tab], plan };

      const res = await fetch("/api/detect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Detection failed.");
      setResult({ verdict: data.verdict, confidence: data.confidence });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  const canAnalyze =
    tab === "text" ? text.trim().length >= 50 : !!fileBase64[tab];

  const tabConfig = TAB_CONFIG.find((t) => t.id === tab)!;

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-sky-950">Check content</h1>
        <p className="text-sky-500 text-sm mt-1">
          {isPro
            ? "Paste text or upload a file — your circle will tell you if it's AI, fake, or real."
            : "Paste text or upload a file to check if it's AI-generated or real."}
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-sky-200 p-6 shadow-sm">
        {/* Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {TAB_CONFIG.map((t) => (
            <button
              key={t.id}
              onClick={() => { setTab(t.id); setResult(null); setError(""); }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                tab === t.id ? "bg-sky-500 text-white" : "bg-sky-50 text-sky-500 hover:bg-sky-100"
              }`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>

        {/* Input */}
        {tab === "text" ? (
          <textarea
            value={text}
            onChange={(e) => { setText(e.target.value); setResult(null); setError(""); }}
            placeholder="Paste any text here: an article, email, essay, caption, or anything you want to check…"
            rows={8}
            className="w-full px-4 py-3 rounded-2xl border border-sky-200 text-sm text-sky-900 placeholder:text-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-400 bg-sky-50/40 resize-none"
          />
        ) : (
          <>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => handleDrop(e, tab)}
              onClick={() => !fileBase64[tab] && fileRef.current?.click()}
              className={`relative rounded-2xl border-2 border-dashed transition-colors cursor-pointer overflow-hidden ${
                dragOver ? "border-sky-400 bg-sky-50" : "border-sky-200 hover:border-sky-300 bg-sky-50/40"
              }`}
              style={{ minHeight: 200 }}
            >
              <input
                key={tab}
                ref={fileRef}
                type="file"
                accept={tabConfig.accept}
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) loadFile(f, tab); }}
              />
              {fileBase64[tab] ? (
                <div className="relative">
                  {filePreview[tab] ? (
                    <div className="relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={filePreview[tab]} alt="Preview" className="w-full max-h-64 object-contain p-4" />
                      {fileIsVideo[tab] && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="bg-black/50 rounded-full w-12 h-12 flex items-center justify-center">
                            <svg viewBox="0 0 24 24" fill="white" width="20" height="20"><path d="M8 5v14l11-7z"/></svg>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-14 gap-3">
                      {tab === "audio" ? (
                        <Mic size={32} className="text-sky-400" />
                      ) : (
                        <Video size={32} className="text-sky-400" />
                      )}
                      <p className="text-sky-700 text-sm font-medium">{fileFilename[tab]}</p>
                      {fileSizeMB[tab] !== undefined && (
                        <p className="text-sky-400 text-xs">{fileSizeMB[tab]!.toFixed(1)} MB</p>
                      )}
                    </div>
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); clearFile(tab); }}
                    className="absolute top-3 right-3 text-xs text-sky-500 bg-white border border-sky-200 rounded-lg px-3 py-1.5 hover:bg-sky-50 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-14 gap-3">
                  <Upload size={28} className="text-sky-300" />
                  <p className="text-sky-400 text-sm text-center">
                    Drop a file here or <span className="text-sky-500 font-medium">browse</span>
                  </p>
                  <p className="text-sky-300 text-xs">{tabConfig.acceptLabel}</p>
                  {tabConfig.maxMB && (
                    <p className="text-sky-300 text-xs">Max {tabConfig.maxMB} MB</p>
                  )}
                </div>
              )}
            </div>

            {/* Video size warning */}
            {tab === "video" && fileSizeMB[tab] !== undefined && fileSizeMB[tab]! > 50 && (
              <p className="mt-3 text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                This file is {fileSizeMB[tab]!.toFixed(1)} MB. Video files over 50 MB may be too large to process. Consider a shorter clip.
              </p>
            )}
          </>
        )}

        {/* Error */}
        {error && (
          <p className="mt-4 text-sm text-red-500 bg-red-50 border border-red-100 rounded-xl px-4 py-3">{error}</p>
        )}

        {/* Result */}
        {result && !loading && (
          <div className={`mt-4 rounded-2xl border p-5 flex items-start gap-4 ${
            result.verdict === "ai"
              ? "bg-orange-50 border-orange-200"
              : result.verdict === "fake"
              ? "bg-red-50 border-red-200"
              : "bg-green-50 border-green-200"
          }`}>
            {/* Mini circle matching state */}
            <div
              className="flex-shrink-0 rounded-full flex items-center justify-center gap-[5px] mt-0.5"
              style={{
                width: 36, height: 36,
                background: result.verdict === "ai"
                  ? "linear-gradient(145deg, #ffe0c8 0%, #ffcca0 100%)"
                  : result.verdict === "fake"
                  ? "linear-gradient(145deg, #fee2e2 0%, #fca5a5 100%)"
                  : "linear-gradient(145deg, #d4f5e4 0%, #b0ecc8 100%)",
                boxShadow: result.verdict === "ai"
                  ? "0 3px 12px rgba(255,150,80,0.5)"
                  : result.verdict === "fake"
                  ? "0 3px 12px rgba(220,38,38,0.4)"
                  : "0 3px 12px rgba(80,200,140,0.5)",
              }}
            >
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#fff", display: "inline-block", flexShrink: 0 }} />
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#fff", display: "inline-block", flexShrink: 0 }} />
            </div>
            <div>
              <p className={`text-base font-bold ${
                result.verdict === "ai" ? "text-orange-700" : result.verdict === "fake" ? "text-red-700" : "text-green-700"
              }`}>
                {result.verdict === "ai" ? "AI Generated" : result.verdict === "fake" ? "Fake" : "Real"}
                <span className="font-normal text-sm ml-2 opacity-70">· {result.confidence}%</span>
              </p>
              <p className={`text-sm mt-0.5 ${
                result.verdict === "ai" ? "text-orange-500" : result.verdict === "fake" ? "text-red-500" : "text-green-500"
              }`}>
                {result.verdict === "ai"
                  ? tab === "image" ? "This image was generated by AI."
                  : tab === "audio" ? "This audio was generated by AI."
                  : tab === "video" ? "This video was generated by AI."
                  : "This text was generated by AI."
                : result.verdict === "fake"
                  ? tab === "image" ? "This image was made to mislead."
                  : tab === "audio" ? "This audio was made to mislead."
                  : tab === "video" ? "This video was made to mislead."
                  : "This text was made to mislead."
                : tab === "image" ? "This image was taken or created by a human."
                : tab === "audio" ? "This audio was recorded by a human."
                : tab === "video" ? "This video was filmed by a human."
                : "This text was written by a human."}
              </p>
            </div>
          </div>
        )}

        {/* Free upsell — shown after a result, or always for free users */}
        {!isPro && (
          <div className="mt-4 rounded-2xl border border-sky-200 bg-gradient-to-br from-sky-50 to-white p-4 flex items-start gap-3">
            <div
              className="flex-shrink-0 rounded-full flex items-center justify-center gap-[4px] mt-0.5"
              style={{
                width: 32, height: 32,
                background: "linear-gradient(145deg, #ffe8dc 0%, #ffd4c4 100%)",
                boxShadow: "0 3px 10px rgba(255,180,150,0.5)",
              }}
            >
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#fff", display: "inline-block" }} />
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#fff", display: "inline-block" }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-sky-900">
                Your circle can also spot fake content
              </p>
              <p className="text-xs text-sky-500 mt-0.5 leading-relaxed">
                On Pro, it does a private background check and comes back within seconds — telling you not just if it&apos;s AI, but if a real person made it to deceive.
              </p>
              <button
                onClick={() => setShowPricingModal(true)}
                className="mt-2 text-xs font-semibold text-sky-600 hover:text-sky-800 transition-colors"
              >
                Upgrade to Pro →
              </button>
            </div>
          </div>
        )}

        {/* Analyze button */}
        <button
          onClick={handleAnalyze}
          disabled={!canAnalyze || loading}
          className="mt-4 w-full py-3.5 bg-sky-500 hover:bg-sky-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-2xl text-sm transition-colors flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              Analyzing…
            </>
          ) : (
            "Check now"
          )}
        </button>

        {tab === "text" && text.length > 0 && text.length < 50 && (
          <p className="mt-2 text-xs text-sky-400 text-center">{50 - text.length} more characters needed</p>
        )}
      </div>

      <p className="mt-4 text-xs text-sky-400 text-center">
        The floating circle also scans whatever&apos;s on your screen. Just tap it.
      </p>

      <PricingModal
        open={showPricingModal}
        onClose={() => setShowPricingModal(false)}
      />
    </div>
  );
}
