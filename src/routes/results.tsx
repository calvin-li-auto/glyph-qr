import { createFileRoute, Link, useLocation } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { ArrowLeft, Copy, ExternalLink, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlyphShell } from "@/components/glyph-shell";
import { isLink, normalizeLink } from "@/lib/qr-text";
import { resolveResultContent, validateResultSearch } from "@/lib/result-content";

declare module "@tanstack/react-router" {
  interface HistoryState { qrText?: string }
}

export const Route = createFileRoute("/results")({
  validateSearch: validateResultSearch,
  head: () => ({ meta: [
    { title: "QR Results — Glyph" },
    { name: "description", content: "Read, copy, and edit your QR code text with Glyph, fully offline." },
    { property: "og:title", content: "QR Results — Glyph" },
    { property: "og:description", content: "View and edit a clean QR code with no reception required." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: Results,
});

function Results() {
  const { content } = Route.useSearch();
  const scannedText = useLocation({ select: (location) => location.state.qrText });
  const initial = resolveResultContent(content, scannedText);
  const navigate = Route.useNavigate();
  const [text, setText] = useState(initial);
  const [img, setImg] = useState<string>("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setText(initial);
  }, [initial]);

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
    <GlyphShell>
    <section className="flex flex-col gap-5">
      <Button asChild variant="ghost" className="self-start px-0 text-muted-foreground">
        <Link to="/"><ArrowLeft className="h-4 w-4" /> Scan another</Link>
      </Button>

        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="secondary"
            size="sm"
            className="w-full min-w-0"
            onClick={async () => {
              await navigator.clipboard.writeText(text);
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            }}
          >
            <Copy className="h-4 w-4" /> {copied ? "Copied" : "Copy text"}
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className="w-full min-w-0"
            onClick={() => void navigate({
              search: (prev) => ({ ...prev, content: text }),
              replace: true,
            })}
          >
            <Link2 className="h-4 w-4" /> Move text to URL
          </Button>
        </div>
      <div className="rounded-2xl border bg-card p-4">
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
        <textarea
          id="qr-text"
          aria-label="QR code text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
          className="w-full rounded-xl border bg-input/40 p-3 font-mono text-sm outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <div className="mx-auto w-full max-w-xs rounded-2xl bg-paper p-3 shadow-glow">
        {img ? (
          <img src={img} alt="QR code" className="aspect-square w-full" />
        ) : (
          <div className="flex aspect-square items-center justify-center text-sm text-ink/50">Type text below</div>
        )}
      </div>
    </section>
    </GlyphShell>
  );
}
