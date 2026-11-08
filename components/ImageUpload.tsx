"use client";

import { useRef, useState, type ReactNode } from "react";
import { ImagePlus, Loader2, Star, Trash2, Upload } from "lucide-react";
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
  required = false,
  fallback,
}: {
  value?: string | null;
  onChange: (url: string | null) => void;
  folder: "shop" | "products";
  label?: string;
  hint?: string;
  aspect?: "square" | "wide" | "product";
  required?: boolean;
  fallback?: ReactNode;
}) {
  const { user } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const stacked = aspect === "product";
  const aspectClass =
    aspect === "wide"
      ? "aspect-[16/9] w-full"
      : aspect === "product"
        ? "aspect-[16/10] w-full"
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
    <div className="min-w-0">
      <div
        className={cn(
          stacked ? "space-y-3" : "flex items-start gap-3",
        )}
      >
        <div
          className={cn(
            "relative overflow-hidden rounded-2xl border border-royal-100 bg-royal-50",
            !stacked && "shrink-0",
            aspectClass,
          )}
        >
          {value ? (
            <img
              src={value}
              alt={label}
              className="absolute inset-0 h-full w-full object-cover"
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
          <p className="text-xs font-extrabold text-ink">
            {label}
            {required && !value && (
              <span className="ml-1 text-rose-600">*</span>
            )}
          </p>
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
              {value ? "Replace" : "Upload photo"}
            </button>
            {value && !required && (
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

export function MultiImageUpload({
  values,
  onChange,
  folder,
  label = "Product photos",
  hint = "Add up to 6 photos. The first one is the cover customers see.",
  required = false,
  max = 6,
  fallback,
}: {
  values: string[];
  onChange: (urls: string[]) => void;
  folder: "shop" | "products";
  label?: string;
  hint?: string;
  required?: boolean;
  max?: number;
  fallback?: ReactNode;
}) {
  const { user } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const canAdd = values.length < max;

  async function addFiles(files: File[]) {
    if (!user) {
      setError("Please sign in to upload photos.");
      return;
    }
    const images = files.filter((file) => file.type.startsWith("image/"));
    if (images.length === 0) {
      setError("Choose one or more image files.");
      return;
    }
    const room = max - values.length;
    if (room <= 0) {
      setError(`You can add up to ${max} photos.`);
      return;
    }
    setBusy(true);
    setError("");
    try {
      const uploaded: string[] = [];
      for (const file of images.slice(0, room)) {
        const blob = await compressImage(file);
        uploaded.push(await uploadShopAsset(blob, user.id, folder));
      }
      onChange([...values, ...uploaded]);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Upload failed.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function removeAt(index: number) {
    const removed = values[index];
    onChange(values.filter((_, position) => position !== index));
    if (removed) void deleteShopAsset(removed).catch(() => undefined);
  }

  function makeCover(index: number) {
    if (index === 0) return;
    onChange([values[index], ...values.filter((_, position) => position !== index)]);
  }

  return (
    <div className="min-w-0">
      <p className="text-xs font-extrabold text-ink">
        {label}
        {required && values.length === 0 && (
          <span className="ml-1 text-rose-600">*</span>
        )}
        <span className="ml-1 font-bold text-ink-muted">
          ({values.length}/{max})
        </span>
      </p>
      <p className="mt-0.5 text-[11px] leading-relaxed text-ink-muted">{hint}</p>

      <div className="mt-2.5 grid grid-cols-3 gap-2 sm:grid-cols-4">
        {values.map((url, index) => (
          <div
            key={url}
            className={cn(
              "group relative aspect-square overflow-hidden rounded-2xl border bg-royal-50",
              index === 0 ? "border-gold-400" : "border-royal-100",
            )}
          >
            <img
              src={url}
              alt={`${label} ${index + 1}`}
              className="absolute inset-0 h-full w-full object-cover"
            />
            {index === 0 ? (
              <span className="absolute left-1.5 top-1.5 rounded-full bg-gold-300 px-2 py-0.5 text-[9px] font-extrabold text-royal-950">
                Cover
              </span>
            ) : (
              <button
                type="button"
                onClick={() => makeCover(index)}
                title="Make cover photo"
                className="absolute bottom-1.5 left-1.5 grid h-6 w-6 place-items-center rounded-full bg-white/90 text-royal-800 shadow-sm transition hover:bg-white"
              >
                <Star className="h-3 w-3" />
              </button>
            )}
            <button
              type="button"
              onClick={() => removeAt(index)}
              title="Remove photo"
              className="absolute right-1.5 top-1.5 grid h-6 w-6 place-items-center rounded-full bg-rose-600 text-white shadow-sm transition hover:bg-rose-700"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        ))}

        {canAdd && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="relative grid aspect-square place-items-center rounded-2xl border border-dashed border-royal-200 bg-royal-50/50 text-royal-700 transition hover:border-royal-400 hover:bg-royal-50 disabled:opacity-60"
          >
            {busy ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <span className="flex flex-col items-center gap-1 text-[10px] font-extrabold">
                {fallback ?? <ImagePlus className="h-5 w-5" />}
                Add photo
              </span>
            )}
          </button>
        )}
      </div>

      {error && (
        <p className="mt-2 text-[11px] font-bold text-rose-700">{error}</p>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(event) => {
          const files = Array.from(event.target.files ?? []);
          if (files.length > 0) void addFiles(files);
        }}
      />
    </div>
  );
}
