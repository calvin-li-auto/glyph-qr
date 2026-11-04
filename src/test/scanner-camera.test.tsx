import { cleanup, render, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Route } from "@/routes/index";

vi.mock("@tanstack/react-router", async (importOriginal) => ({
  ...await importOriginal<typeof import("@tanstack/react-router")>(),
  useNavigate: () => vi.fn(),
}));
vi.mock("@/components/glyph-shell", () => ({
  GlyphShell: ({ children }: { children: React.ReactNode }) => children,
}));

const getUserMedia = vi.fn();
const stopTrack = vi.fn();
const stream = { getTracks: () => [{ stop: stopTrack }] } as unknown as MediaStream;

function renderScanner() {
  const Page = Route.options.component;
  if (!Page) throw new Error("Scanner page missing");
  return render(<Page />);
}

beforeEach(() => {
  vi.clearAllMocks();
  Object.defineProperty(navigator, "mediaDevices", { configurable: true, value: { getUserMedia } });
  vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue();
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); });

describe("Automatic camera scanning", () => {
  it("requests the rear camera on opening the scanner without a button click", async () => {
    getUserMedia.mockResolvedValue(stream);
    const view = renderScanner();
    await waitFor(() => expect(getUserMedia).toHaveBeenCalledWith({
      video: { facingMode: { ideal: "environment" } }, audio: false,
    }));
    view.unmount();
    expect(stopTrack).toHaveBeenCalledTimes(1);
  });

  it("releases a camera granted after the scanner has been left", async () => {
    let grant: ((value: MediaStream) => void) | undefined;
    getUserMedia.mockReturnValue(new Promise<MediaStream>((resolve) => { grant = resolve; }));
    const view = renderScanner();
    view.unmount();
    if (!grant) throw new Error("Camera request did not start");
    grant(stream);
    await waitFor(() => expect(stopTrack).toHaveBeenCalledTimes(1));
  });
});