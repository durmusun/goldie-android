import { describe, expect, test } from "bun:test";
import type { LoadedConfig, ScreenshotScene } from "./config.ts";
import {
  expectedPlayScreenshotCount,
  playCopyWarnings,
  screenshotAltText,
  validatePlayScreenshotSet,
} from "./play-store.ts";

const validShot = (name: string) => ({
  name,
  format: "png" as const,
  width: 1080,
  height: 1920,
  alpha: false,
});

describe("Google Play validation", () => {
  test("requires 2-8 screenshots and recommends at least four", () => {
    expect(
      validatePlayScreenshotSet([]).some((issue) => issue.code === "screenshot-count-min"),
    ).toBe(true);
    expect(
      validatePlayScreenshotSet([validShot("1.png"), validShot("2.png")]).some(
        (issue) => issue.code === "screenshot-count-recommended",
      ),
    ).toBe(true);
    expect(
      validatePlayScreenshotSet(Array.from({ length: 4 }, (_, i) => validShot(`${i}.png`))),
    ).toEqual([]);
    expect(
      validatePlayScreenshotSet(Array.from({ length: 9 }, (_, i) => validShot(`${i}.png`))).some(
        (issue) => issue.code === "screenshot-count-max",
      ),
    ).toBe(true);
  });

  test("rejects alpha, unsupported formats and invalid aspect ratios", () => {
    const issues = validatePlayScreenshotSet([
      { name: "bad.webp", format: "other", width: 320, height: 900, alpha: true },
      validShot("ok.png"),
    ]);
    expect(issues.map((issue) => issue.code)).toEqual(
      expect.arrayContaining(["screenshot-format", "screenshot-alpha", "screenshot-aspect"]),
    );
  });

  test("builds bounded alt text with an explicit value taking precedence", () => {
    const explicit: ScreenshotScene = {
      kind: "screenshot",
      id: "home",
      flow: "home",
      headline: { tr: "Başlık" },
      altText: { tr: "Açıklama" },
    };
    expect(screenshotAltText(explicit, "tr")).toBe("Açıklama");

    const long = { ...explicit, altText: { tr: "x".repeat(180) } };
    expect(screenshotAltText(long, "tr")).toHaveLength(140);
    expect(screenshotAltText(long, "tr").endsWith("…")).toBe(true);
  });

  test("warns about risky copy and repeated early UI", () => {
    const cfg = {
      theme: { template: undefined, layout: "classic" },
      sceneLayouts: { launch: "panorama" },
      scenes: [
        {
          kind: "screenshot",
          id: "launch",
          flow: "launch",
          headline: { tr: "Şimdi indir" },
          subhead: { tr: "En iyi ücretsiz uygulama" },
        },
      ],
    } as unknown as LoadedConfig;

    expect(expectedPlayScreenshotCount(cfg)).toBe(2);
    expect(playCopyWarnings(cfg, "tr").map((issue) => issue.code)).toEqual(
      expect.arrayContaining([
        "copy-call-to-action",
        "copy-promotional-claim",
        "first-three-ui-variety",
      ]),
    );
  });
});
