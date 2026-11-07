"use client";

import { useEffect, useState } from "react";
import { Download, QrCode as QrIcon } from "lucide-react";
import { CopyButton, Modal, Spinner } from "@/components/ui";
import { useStore } from "@/lib/store";

export function QrModal({
  open,
  onClose,
  url,
  slug,
  shopName,
}: {
  open: boolean;
  onClose: () => void;
  url: string;
  slug: string;
  shopName: string;
}) {
  const { t } = useStore();
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setFailed(false);
    (async () => {
      try {
        const { default: QRCode } = await import("qrcode");
        const next = await QRCode.toDataURL(url, {
          width: 640,
          margin: 1,
          errorCorrectionLevel: "M",
          color: { dark: "#2c046e", light: "#ffffff" },
        });
        if (!cancelled) setDataUrl(next);
      } catch {
        if (!cancelled) setFailed(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, url]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={
        <span className="flex items-center gap-2">
          <QrIcon className="h-5 w-5 text-royal-600" />
          {t("dashboard.qrTitle")}
        </span>
      }
      subtitle={t("dashboard.qrHint")}
      size="sm"
    >
      <div className="px-5 pb-5 pt-5 sm:px-6 sm:pb-6">
        <div className="mx-auto flex max-w-[260px] flex-col items-center rounded-3xl border border-royal-100 bg-white p-4 shadow-sm">
          <div className="grid h-[212px] w-[212px] place-items-center rounded-2xl bg-royal-50/60">
            {dataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={dataUrl}
                alt={`${shopName} QR code`}
                width={212}
                height={212}
                className="h-[212px] w-[212px] rounded-xl"
              />
            ) : failed ? (
              <span className="px-4 text-center text-xs font-semibold text-ink-muted">
                {t("dashboard.qrHint")}
              </span>
            ) : (
              <Spinner className="h-7 w-7 text-royal-600" />
            )}
          </div>
          <p className="mt-3 text-center text-sm font-extrabold text-ink">
            {shopName}
          </p>
          <p className="max-w-full truncate text-center text-[11px] text-ink-muted">
            {url}
          </p>
        </div>

        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          {dataUrl && (
            <a
              href={dataUrl}
              download={`${slug}-qr.png`}
              className="btn-primary flex-1 px-4 py-3"
            >
              <Download className="h-4 w-4" />
              {t("dashboard.downloadQr")}
            </a>
          )}
          <CopyButton
            path={url}
            label={t("common.copyLink")}
            copiedLabel={t("common.copied")}
            className="flex-1 justify-center px-4 py-3"
            variant="soft"
          />
        </div>
      </div>
    </Modal>
  );
}
