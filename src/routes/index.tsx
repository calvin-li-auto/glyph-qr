import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import jsQR from "jsqr";
import QRCode from "qrcode";
import { Camera, ImageUp, ArrowLeft, Download, Copy, ExternalLink, CameraOff } from "lucide-react";
import { setupServiceWorker } from "@/lib/pwa";
import { isLink, normalizeLink } from "@/lib/qr-text";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Glyph — Offline QR Scanner & Maker" },
      {
        name: "description",
        content: "Scan QR codes with your camera or a photo, and make new ones — works fully offline.",
      },
      { property: "og:title", content: "Glyph — Offline QR Scanner & Maker" },
      { property: "og:description", content: "Scan, read, and create QR codes with zero reception." },
    ],
  }),
  component: Index,
});

function decodeImageData(img: ImageData) {
  return jsQR(img.data, img.width, img.height, { inversionAttempts: "attemptBoth" });
}

function Index() {
  const [result, setResult] = useState<string | null>(null);

  useEffect(() => {
    void setupServiceWorker();
  }, []);

  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col px-5 py-6">
      <header className="mb-6 flex items-center gap-3">
        <img src="/favicon.png" alt="" width={32} height={32} className="rounded-md" />
        <h1 className="text-xl font-bold tracking-tight">Glyph</h1>
        <span className="ml-auto rounded-full border px-2.5 py-0.5 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
          works offline
        </span>
      </header>
      {result === null ? (
        <Scanner onResult={setResult} />
      ) : (
        <ResultView initial={result} onBack={() => setResult(null)} />
      )}
    </main>
  );
}

function Scanner({ onResult }: { onResult: (t: string) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number>(0);
  const [active, setActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const stop = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setActive(false);
  }, []);

  useEffect(() => stop, [stop]);

  const tick = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video && canvas && video.readyState === video.HAVE_ENOUGH_DATA) {
      const scale = Math.min(1, 720 / Math.max(video.videoWidth, video.videoHeight));
      canvas.width = Math.round(video.videoWidth * scale);
      canvas.height = Math.round(video.videoHeight * scale);
      const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const code = decodeImageData(ctx.getImageData(0, 0, canvas.width, canvas.height));
      if (code && code.data) {
        navigator.vibrate?.(60);
        stop();
        onResult(code.data);
        return;
      }
    }
    rafRef.current = requestAnimationFrame(tick);
  }, [onResult, stop]);

  const start = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });
      streamRef.current = stream;
      const video = videoRef.current!;
      video.srcObject = stream;
      await video.play();
      setActive(true);
      rafRef.current = requestAnimationFrame(tick);
    } catch {
      setError("Couldn't open the camera. Check camera permission, or scan a saved image instead.");
    }
  };

  const onFile = async (file: File) => {
    setError(null);
    try {
      const bmp = await createImageBitmap(file);
      const canvas = document.createElement("canvas");
      const scale = Math.min(1, 1600 / Math.max(bmp.width, bmp.height));
      canvas.width = Math.round(bmp.width * scale);
      canvas.height = Math.round(bmp.height * scale);
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(bmp, 0, 0, canvas.width, canvas.height);
      const code = decodeImageData(ctx.getImageData(0, 0, canvas.width, canvas.height));
      if (code?.data) {
        stop();
        onResult(code.data);
      } else setError("No QR code found in that image.");
    } catch {
      setError("Couldn't read that image file.");
    }
  };

  return (
    <section className="flex flex-1 flex-col gap-4">
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl border bg-card shadow-glow">
        <video ref={videoRef} playsInline muted className="h-full w-full object-cover" />
        <canvas ref={canvasRef} className="hidden" />
        {active ? (
          <>
            <div className="pointer-events-none absolute inset-[12%] rounded-xl border-2 border-primary/80" />
            <div className="animate-scanline pointer-events-none absolute left-[12%] right-[12%] h-0.5 bg-primary" />
            <p className="absolute bottom-3 left-0 right-0 text-center font-mono text-xs text-foreground/80">
              scanning…
            </p>
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-muted-foreground">
            <Camera className="h-10 w-10" />
            <p className="text-sm">Camera is off</p>
          </div>
        )}
      </div>

      {error && <p className="rounded-lg border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm">{error}</p>}

      <div className="grid grid-cols-2 gap-3">
        {active ? (
          <button onClick={stop} className="btn-base bg-secondary text-secondary-foreground">
            <CameraOff className="h-4 w-4" /> Stop
          </button>
        ) : (
          <button onClick={start} className="btn-base bg-primary text-primary-foreground">
            <Camera className="h-4 w-4" /> Scan
          </button>
        )}
        <label className="btn-base cursor-pointer bg-secondary text-secondary-foreground">
          <ImageUp className="h-4 w-4" /> From image
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void onFile(f);
              e.target.value = "";
            }}
          />
        </label>
      </div>
      <button
        onClick={() => onResult("")}
        className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
      >
        Or create a new QR code
      </button>
    </section>
  );
}

function ResultView({ initial, onBack }: { initial: string; onBack: () => void }) {
  const [text, setText] = useState(initial);
  const [img, setImg] = useState<string>("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!text) {
      setImg("");
      return;
    }
    QRCode.toDataURL(text, { margin: 2, width: 640, errorCorrectionLevel: "M" })
      .then(setImg)
      .catch(() => setImg(""));
  }, [text]);

  const link = isLink(text) ? normalizeLink(text) : null;

  return (
    <section className="flex flex-col gap-5">
      <button
        onClick={onBack}
        className="flex items-center gap-2 self-start text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Scan another
      </button>

      <div className="rounded-2xl border bg-card p-4">
        <p className="mb-2 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">Content</p>
        {link ? (
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start gap-2 break-all font-mono text-primary underline underline-offset-4"
          >
            {text} <ExternalLink className="mt-1 h-4 w-4 shrink-0" />
          </a>
        ) : (
          <p className="whitespace-pre-wrap break-all font-mono">
            {text || <span className="text-muted-foreground">(empty)</span>}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="qr-text"
          className="mb-2 block font-mono text-[11px] uppercase tracking-wider text-muted-foreground"
        >
          Edit to make a new code
        </label>
        <textarea
          id="qr-text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
          className="w-full rounded-xl border bg-input/40 p-3 font-mono text-sm outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={async () => {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          }}
          className="btn-base bg-secondary text-secondary-foreground"
        >
          <Copy className="h-4 w-4" /> {copied ? "Copied" : "Copy text"}
        </button>
        <a
          href={img || undefined}
          download="qr-code.png"
          aria-disabled={!img}
          className="btn-base bg-primary text-primary-foreground aria-disabled:pointer-events-none aria-disabled:opacity-50"
        >
          <Download className="h-4 w-4" /> Save image
        </a>
      </div>

      <div className="mx-auto w-full max-w-xs rounded-2xl bg-paper p-3 shadow-glow">
        {img ? (
          <img src={img} alt="QR code" className="aspect-square w-full" />
        ) : (
          <div className="flex aspect-square items-center justify-center text-sm text-ink/50">Type text below</div>
        )}
      </div>
    </section>
  );
}
