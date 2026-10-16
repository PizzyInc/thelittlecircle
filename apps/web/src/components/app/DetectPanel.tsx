"use client";

import { useCallback, useRef, useState } from "react";
import { X, Upload, FileText, Image as ImageIcon } from "lucide-react";

type Tab = "text" | "image";

type Result = {
  verdict: "ai" | "real";
  confidence: number;
};

interface DetectPanelProps {
  onClose: () => void;
  onAnalyzing: () => void;
  onResult: (verdict: "ai" | "real") => void;
}

export default function DetectPanel({ onClose, onAnalyzing, onResult }: DetectPanelProps) {
  const [tab, setTab] = useState<Tab>("text");
  const [text, setText] = useState("");
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imageFilename, setImageFilename] = useState<string>("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  function loadImageFile(file: File) {
    setImageFilename(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      setImageBase64(src);
      setImagePreview(src);
      setResult(null);
    };
    reader.readAsDataURL(file);
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file?.type.startsWith("image/")) loadImageFile(file);
  }, []);

  async function handleAnalyze() {
    setError("");
    setResult(null);

    if (tab === "text" && text.trim().length < 50) {
      setError("Paste at least 50 characters of text to analyze.");
      return;
    }
    if (tab === "image" && !imageBase64) {
      setError("Upload an image first.");
      return;
    }

    setLoading(true);
    onAnalyzing();

    try {
      const res = await fetch("/api/detect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          tab === "text"
            ? { type: "text", content: text }
            : { type: "image", content: imageBase64, filename: imageFilename }
        ),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Detection failed.");

      const r: Result = { verdict: data.verdict, confidence: data.confidence };
      setResult(r);
      onResult(r.verdict);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      onResult("real"); // reset circle state
    } finally {
      setLoading(false);
    }
  }

  const canAnalyze = tab === "text" ? text.trim().length >= 50 : !!imageBase64;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ background: "rgba(14,30,54,0.45)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: "slideUp 0.2s ease-out" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <div>
            <h2 className="text-base font-bold text-sky-950">Check something</h2>
            <p className="text-sky-400 text-xs mt-0.5">AI or real? Find out in seconds.</p>
          </div>
          <button onClick={onClose} className="text-sky-300 hover:text-sky-600 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex px-6 gap-2 mb-4">
          {(["text", "image"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t); setResult(null); setError(""); }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium transition-colors ${
                tab === t ? "bg-sky-500 text-white" : "bg-sky-50 text-sky-500 hover:bg-sky-100"
              }`}
            >
              {t === "text" ? <FileText size={13} /> : <ImageIcon size={13} />}
              {t === "text" ? "Text" : "Image"}
            </button>
          ))}
        </div>

        <div className="px-6 pb-6 space-y-4">
          {/* Input area */}
          {tab === "text" ? (
            <textarea
              value={text}
              onChange={(e) => { setText(e.target.value); setResult(null); setError(""); }}
              placeholder="Paste text here to check if it was written by AI…"
              rows={6}
              className="w-full px-4 py-3 rounded-2xl border border-sky-200 text-sm text-sky-900 placeholder:text-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-400 bg-sky-50/40 resize-none"
            />
          ) : (
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => !imagePreview && fileRef.current?.click()}
              className={`relative rounded-2xl border-2 border-dashed transition-colors cursor-pointer overflow-hidden ${
                dragging ? "border-sky-400 bg-sky-50" : "border-sky-200 hover:border-sky-300 bg-sky-50/40"
              }`}
              style={{ minHeight: 160 }}
            >
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) loadImageFile(f); }}
              />
              {imagePreview ? (
                <div className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imagePreview} alt="Preview" className="w-full max-h-52 object-cover" />
                  <button
                    onClick={(e) => { e.stopPropagation(); setImageBase64(null); setImagePreview(null); setResult(null); }}
                    className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center"
                  >
                    <X size={12} />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 gap-3">
                  <Upload size={24} className="text-sky-300" />
                  <p className="text-sky-400 text-xs text-center">
                    Drop an image here or <span className="text-sky-500 font-medium">browse</span>
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Error */}
          {error && (
            <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-xl px-3 py-2">{error}</p>
          )}

          {/* Result */}
          {result && !loading && (
            <div className={`rounded-2xl border p-4 flex items-center gap-3 ${
              result.verdict === "ai"
                ? "bg-orange-50 border-orange-200"
                : "bg-green-50 border-green-200"
            }`}>
              <span className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold ${
                result.verdict === "ai" ? "bg-orange-400" : "bg-green-400"
              }`}>
                {result.verdict === "ai" ? "!" : "✓"}
              </span>
              <div>
                <p className={`text-sm font-bold ${result.verdict === "ai" ? "text-orange-700" : "text-green-700"}`}>
                  {result.verdict === "ai" ? "AI Generated" : "Looks Real"} · {result.confidence}%
                </p>
                <p className={`text-xs mt-0.5 ${result.verdict === "ai" ? "text-orange-500" : "text-green-500"}`}>
                  {result.confidence >= 85 ? "High confidence" : result.confidence >= 65 ? "Medium confidence" : "Low confidence"}
                </p>
              </div>
            </div>
          )}

          {/* Analyze button */}
          <button
            onClick={handleAnalyze}
            disabled={!canAnalyze || loading}
            className="w-full py-3 bg-sky-500 hover:bg-sky-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-2xl text-sm transition-colors flex items-center justify-center gap-2"
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
            <p className="text-xs text-sky-400 text-center">{50 - text.length} more characters needed</p>
          )}
        </div>
      </div>
    </div>
  );
}
