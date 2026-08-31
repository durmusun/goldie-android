import { copyFile, mkdir, readdir, rm, stat, writeFile } from "node:fs/promises";
import { basename, join } from "node:path";
import { isScreenshot, type LoadedConfig, resolvedScenes, type ScreenshotScene } from "./config.ts";
import { DEVICES } from "./specs.ts";

export const PLAY_STORE = {
  screenshots: {
    minCount: 2,
    maxCount: 8,
    recommendedCount: 4,
    minDimension: 320,
    maxDimension: 3840,
    maxAspectRatio: 2,
    recommendedPortrait: { width: 1080, height: 1920 },
  },
  featureGraphic: { width: 1024, height: 500 },
  altTextMaxLength: 140,
} as const;

export type PlayIssue = {
  level: "error" | "warning";
  code: string;
  message: string;
};

export type PlayScreenshotProbe = {
  name: string;
  format: "png" | "jpeg" | "other";
  width: number;
  height: number;
  alpha: boolean;
};

export function validatePlayScreenshotSet(
  screenshots: PlayScreenshotProbe[],
  expectedCount?: number,
): PlayIssue[] {
  const issues: PlayIssue[] = [];
  const rules = PLAY_STORE.screenshots;
  if (screenshots.length < rules.minCount) {
    issues.push({
      level: "error",
      code: "screenshot-count-min",
      message: `Google Play needs at least ${rules.minCount} screenshots; found ${screenshots.length}.`,
    });
  }
  if (screenshots.length > rules.maxCount) {
    issues.push({
      level: "error",
      code: "screenshot-count-max",
      message: `Google Play allows at most ${rules.maxCount} phone screenshots; found ${screenshots.length}.`,
    });
  }
  if (screenshots.length >= rules.minCount && screenshots.length < rules.recommendedCount) {
    issues.push({
      level: "warning",
      code: "screenshot-count-recommended",
      message: `Provide at least ${rules.recommendedCount} phone screenshots for recommendation surfaces; found ${screenshots.length}.`,
    });
  }
  if (expectedCount !== undefined && screenshots.length !== expectedCount) {
    issues.push({
      level: "error",
      code: "screenshot-count-rendered",
      message: `Rendered ${screenshots.length} screenshots but the configured layouts require ${expectedCount}.`,
    });
  }

  for (const shot of screenshots) {
    if (shot.format !== "png" && shot.format !== "jpeg") {
      issues.push({
        level: "error",
        code: "screenshot-format",
        message: `${shot.name}: expected PNG or JPEG.`,
      });
    }
    if (shot.alpha) {
      issues.push({
        level: "error",
        code: "screenshot-alpha",
        message: `${shot.name}: alpha channel is not upload-ready.`,
      });
    }
    const short = Math.min(shot.width, shot.height);
    const long = Math.max(shot.width, shot.height);
    if (short < rules.minDimension || long > rules.maxDimension) {
      issues.push({
        level: "error",
        code: "screenshot-dimensions",
        message: `${shot.name}: ${shot.width}x${shot.height} is outside the ${rules.minDimension}-${rules.maxDimension}px range.`,
      });
    }
    if (long > short * rules.maxAspectRatio) {
      issues.push({
        level: "error",
        code: "screenshot-aspect",
        message: `${shot.name}: the long side may not exceed twice the short side.`,
      });
    }
    const recommended = rules.recommendedPortrait;
    if (shot.width !== recommended.width || shot.height !== recommended.height) {
      issues.push({
        level: "warning",
        code: "screenshot-recommended-size",
        message: `${shot.name}: ${recommended.width}x${recommended.height} portrait is recommended; found ${shot.width}x${shot.height}.`,
      });
    }
  }
  return issues;
}

const CTA = [
  /\b(download|install|play|try)\s+now\b/i,
  /(?:^|\s)(şimdi|hemen)\s+(indir|yükle|oyna|dene)(?=$|\s|[.!?])/i,
];
const CLAIM = [
  /(^|\s)#\s*1\b/i,
  /\b(best|top|new|free|discount|sale|million downloads)\b/i,
  /(?:^|\s)(en iyi|bir numara|yeni|ücretsiz|indirim|milyon indirme)(?=$|\s|[.!?])/i,
];

export function playCopyWarnings(cfg: LoadedConfig, locale: string): PlayIssue[] {
  const warnings: PlayIssue[] = [];
  const scenes = cfg.scenes.filter(isScreenshot);
  for (const scene of scenes) {
    const text = [scene.headline[locale], scene.subhead?.[locale]].filter(Boolean).join(" ");
    if (CTA.some((pattern) => pattern.test(text))) {
      warnings.push({
        level: "warning",
        code: "copy-call-to-action",
        message: `${scene.id}: avoid download/install/play/try calls to action in screenshot copy.`,
      });
    }
    if (CLAIM.some((pattern) => pattern.test(text))) {
      warnings.push({
        level: "warning",
        code: "copy-promotional-claim",
        message: `${scene.id}: review ranking, price, novelty or promotional claims against Play metadata policy.`,
      });
    }
  }

  const firstThreeSceneIds = resolvedScenes(cfg)
    .flatMap(({ scene, layout }) => Array.from({ length: layout.span }, () => scene.id))
    .slice(0, 3);
  if (firstThreeSceneIds.length >= 2 && new Set(firstThreeSceneIds).size < 2) {
    warnings.push({
      level: "warning",
      code: "first-three-ui-variety",
      message: "The first screenshots reuse one scene; show multiple real app capabilities early.",
    });
  }
  return warnings;
}

export function screenshotAltText(scene: ScreenshotScene, locale: string): string {
  const explicit = scene.altText?.[locale]?.trim();
  const fallback = [scene.headline[locale], scene.subhead?.[locale]].filter(Boolean).join(". ");
  const text = explicit || fallback || `App screen: ${scene.id}`;
  if (text.length <= PLAY_STORE.altTextMaxLength) return text;
  return `${text.slice(0, PLAY_STORE.altTextMaxLength - 1).trimEnd()}…`;
}

export function expectedPlayScreenshotCount(cfg: LoadedConfig): number {
  return resolvedScenes(cfg).reduce((count, { layout }) => count + layout.span, 0);
}

export async function writePlayStorePackage(cfg: LoadedConfig, locale: string): Promise<string> {
  const label = DEVICES["android-phone"].label;
  const sourceDir = join(cfg.outDir, "screenshots", label, locale);
  const root = join(cfg.outDir, "google-play", locale);
  const phoneDir = join(root, "phone");
  await rm(phoneDir, { recursive: true, force: true });
  await mkdir(phoneDir, { recursive: true });

  const scenes = cfg.scenes.filter(isScreenshot);
  const files = (await readdir(sourceDir).catch(() => [] as string[]))
    .filter((name) => name.endsWith(".png"))
    .sort();
  const screenshots: Array<{ file: string; sceneId: string; altText: string; bytes: number }> = [];
  for (const name of files) {
    const source = join(sourceDir, name);
    await copyFile(source, join(phoneDir, name));
    const scene = scenes.find((candidate) => name.includes(`-${candidate.id}`));
    screenshots.push({
      file: `phone/${name}`,
      sceneId: scene?.id ?? basename(name, ".png"),
      altText: scene ? screenshotAltText(scene, locale) : `App screenshot ${name}`,
      bytes: (await stat(source)).size,
    });
  }

  const altText = Object.fromEntries(screenshots.map((shot) => [shot.file, shot.altText]));
  await writeFile(join(root, "alt-text.json"), `${JSON.stringify(altText, null, 2)}\n`);

  const complianceIssues = [
    ...validatePlayScreenshotSet(
      screenshots.map((shot) => ({
        name: shot.file,
        format: "png" as const,
        width: PLAY_STORE.screenshots.recommendedPortrait.width,
        height: PLAY_STORE.screenshots.recommendedPortrait.height,
        alpha: false,
      })),
      expectedPlayScreenshotCount(cfg),
    ),
    ...playCopyWarnings(cfg, locale),
  ];

  const manifest = {
    schemaVersion: 1,
    store: "google-play",
    generatedAt: new Date().toISOString(),
    applicationId: cfg.android?.applicationId ?? null,
    locale,
    assets: {
      phoneScreenshots: screenshots,
      featureGraphic: "feature-graphic.png",
    },
    compliance: {
      requiredScreenshotCount: [PLAY_STORE.screenshots.minCount, PLAY_STORE.screenshots.maxCount],
      recommendedPhoneScreenshotCount: PLAY_STORE.screenshots.recommendedCount,
      phoneSize: PLAY_STORE.screenshots.recommendedPortrait,
      featureGraphicSize: PLAY_STORE.featureGraphic,
      issues: complianceIssues,
    },
  };
  const file = join(root, "listing-manifest.json");
  await writeFile(file, `${JSON.stringify(manifest, null, 2)}\n`);
  return file;
}
