"use client";

import { useRef, useState, type ReactNode } from "react";
import { ImagePlus, Loader2, Trash2, Upload } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { deleteShopAsset, uploadShopAsset } from "@/lib/data";
import { cn } from "@/lib/utils";

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Could not read that image."));
    image.src = src;
  });
}

async function compressImage(file: File): Promise<Blob> {
  if (file.size <= 350_000 && file.type === "image/jpeg") return file;
  const dataUrl = await readAsDataUrl(file);
  const image = await loadImage(dataUrl);
  const max = 1200;
  const scale = Math.min(1, max / Math.max(image.width, image.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(image.width * scale));
  canvas.height = Math.max(1, Math.round(image.height * scale));
  const context = canvas.getContext("2d");
  if (!context) return file;
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => resolve(blob ?? file),
      "image/jpeg",
      0.82,
    );
  });
}

export function ImageUpload({
  value,
  onChange,
  folder,
  label = "Photo",
  hint = "JPG or PNG. We resize it for fast loading.",
  aspect = "square",
  fallback,
}: {
  value?: string | null;
  onChange: (url: string | null) => void;
  folder: "shop" | "products";
  label?: string;
  hint?: string;
  aspect?: "square" | "wide" | "product";
  fallback?: ReactNode;
}) {
  const { user } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const aspectClass =
    aspect === "wide"
      ? "aspect-[16/9] w-full"
      : aspect === "product"
        ? "aspect-[4/3] w-full"
        : "h-28 w-28";

  async function upload(file: File) {
    if (!user) {
      setError("Please sign in to upload a photo.");
      return;
    }
    if (!file.type.startsWith("image/")) {
      setError("Choose an image file.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const previous = value;
      const blob = await compressImage(file);
      const url = await uploadShopAsset(blob, user.id, folder);
      onChange(url);
      if (previous) {
        void deleteShopAsset(previous).catch(() => undefined);
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Upload failed.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div>
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "relative shrink-0 overflow-hidden rounded-2xl border border-royal-100 bg-royal-50",
            aspectClass,
          )}
        >
          {value ? (
            <img
              src={value}
              alt={label}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="grid h-full w-full place-items-center text-royal-300">
              {fallback ?? <ImagePlus className="h-8 w-8" />}
            </div>
          )}
          {busy && (
            <div className="absolute inset-0 grid place-items-center bg-white/80">
              <Loader2 className="h-5 w-5 animate-spin text-royal-700" />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-extrabold text-ink">{label}</p>
          <p className="mt-0.5 text-[11px] leading-relaxed text-ink-muted">
            {hint}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={busy}
              className="btn-soft px-3 py-2 text-xs"
            >
              <Upload className="h-3.5 w-3.5" />
              {value ? "Replace" : "Upload"}
            </button>
            {value && (
              <button
                type="button"
                onClick={() => {
                  onChange(null);
                  void deleteShopAsset(value).catch(() => undefined);
                }}
                disabled={busy}
                className="btn px-3 py-2 text-xs text-rose-700 ring-1 ring-inset ring-rose-200 hover:bg-rose-50"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Remove
              </button>
            )}
          </div>
          {error && (
            <p className="mt-2 text-[11px] font-bold text-rose-700">{error}</p>
          )}
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void upload(file);
        }}
      />
    </div>
  );
}
