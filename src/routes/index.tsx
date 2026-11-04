import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import jsQR from "jsqr";
import { Camera, ImageUp, CameraOff } from "lucide-react";
import { GlyphShell } from "@/components/glyph-shell";
import { Button } from "@/components/ui/button";

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
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

function decodeImageData(img: ImageData) {
  return jsQR(img.data, img.width, img.height, { inversionAttempts: "attemptBoth" });
}

function Index() {
  const navigate = useNavigate();
  const onResult = useCallback((text: string) => {
    void navigate({ to: "/results", state: { qrText: text } });
  }, [navigate]);
  return <GlyphShell><Scanner onResult={onResult} /></GlyphShell>;
}

function Scanner({ onResult }: { onResult: (t: string) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number>(0);
  const cameraRequestRef = useRef(0);
  const [active, setActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const stop = useCallback(() => {
    cameraRequestRef.current += 1;
    cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setActive(false);
  }, []);

  const tick = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video && canvas && video.readyState === video.HAVE_ENOUGH_DATA) {
      const scale = Math.min(1, 720 / Math.max(video.videoWidth, video.videoHeight));
      canvas.width = Math.round(video.videoWidth * scale);
      canvas.height = Math.round(video.videoHeight * scale);
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return;
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

  const start = useCallback(async () => {
    const request = ++cameraRequestRef.current;
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });
      const video = videoRef.current;
      if (request !== cameraRequestRef.current || !video) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }
      streamRef.current = stream;
      video.srcObject = stream;
      await video.play();
      if (request !== cameraRequestRef.current) return;
      setActive(true);
      rafRef.current = requestAnimationFrame(tick);
    } catch {
      if (request !== cameraRequestRef.current) return;
      stop();
      setError("Couldn't open the camera. Check camera permission, or scan a saved image instead.");
    }
  }, [stop, tick]);

  useEffect(() => {
    void start();
    return stop;
  }, [start, stop]);

  const onFile = async (file: File) => {
    setError(null);
    try {
      const bmp = await createImageBitmap(file);
      const canvas = document.createElement("canvas");
      const scale = Math.min(1, 1600 / Math.max(bmp.width, bmp.height));
      canvas.width = Math.round(bmp.width * scale);
      canvas.height = Math.round(bmp.height * scale);
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        bmp.close();
        setError("Couldn't read that image file.");
        return;
      }
      ctx.drawImage(bmp, 0, 0, canvas.width, canvas.height);
      bmp.close();
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
            <Camera className="size-10" />
            <p className="text-sm">Camera is off</p>
          </div>
        )}
      </div>

      {error && <p className="rounded-lg border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm">{error}</p>}

      <div className="grid grid-cols-2 gap-3">
        {active ? (
          <Button onClick={stop} variant="secondary" className="h-12 w-full">
            <CameraOff className="h-4 w-4" /> Stop
          </Button>
        ) : (
          <Button onClick={() => void start()} className="h-12 w-full">
            <Camera className="h-4 w-4" /> Scan
          </Button>
        )}
        <Button asChild variant="secondary" className="h-12 w-full cursor-pointer">
        <label>
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
        </Button>
      </div>
      <Button
        variant="link"
        onClick={() => onResult("")}
        className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
      >
        Or create a new QR code
      </Button>
    </section>
  );
}

