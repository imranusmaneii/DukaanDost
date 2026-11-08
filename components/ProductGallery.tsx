"use client";

import { useState } from "react";
import { cn, themeTile } from "@/lib/utils";

export function ProductGallery({
  images,
  emoji,
  theme,
  name,
  className,
}: {
  images?: string[] | null;
  emoji: string;
  theme: string;
  name: string;
  className?: string;
}) {
  const photos = (images ?? []).filter(Boolean);
  const [active, setActive] = useState(0);
  const current = photos[active];

  return (
    <div className={cn("absolute inset-0", className)}>
      <div
        className={cn(
          "absolute inset-0 grid place-items-center overflow-hidden",
          themeTile(theme),
        )}
      >
        {current ? (
          <img
            src={current}
            alt={name}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <span className="text-6xl drop-shadow-md">{emoji}</span>
        )}
      </div>

      {photos.length > 1 && (
        <div className="absolute inset-x-0 bottom-2 z-[5] flex items-center justify-center gap-1.5">
          {photos.map((photo, index) => (
            <button
              key={`${photo}-${index}`}
              type="button"
              onClick={() => setActive(index)}
              aria-label={`Show photo ${index + 1}`}
              className={cn(
                "h-2 rounded-full ring-1 ring-black/20 transition-all",
                index === active
                  ? "w-5 bg-white"
                  : "w-2 bg-white/60 hover:bg-white/85",
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
