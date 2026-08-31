/**
 * Geometry of the bezel PNGs in assets/ (the 17-pro-* variants): the bezel
 * image and the transparent screen cutout inside it, both in the source PNG's
 * own pixels. All bundled variants share this geometry. Measured from the
 * alpha channel; re-measure if custom bezel art is used instead. Layouts built on it live
 * in layouts.ts.
 */
export const FRAME = {
  width: 606,
  height: 1252,
  screen: { x: 24, y: 21, width: 557, height: 1210 },
  /**
   * Corner radius of the screen cutout. The bezel ring is thinner than this
   * radius, so square screen content would poke past the phone's outer corner;
   * the compositor clips the content with the scaled radius instead.
   */
  screenRadius: 82,
} as const;

/**
 * License-free generic Android phone geometry. It follows the Pixel 5-class
 * 1080x2340 display used by the Android emulator, with a much thinner bezel
 * and tighter corners than the bundled iPhone artwork. The camera cutout is
 * drawn by the compositor so the result reads as Android even without
 * shipping proprietary Pixel device art.
 */
export const ANDROID_FRAME = {
  width: 1140,
  height: 2400,
  screen: { x: 30, y: 30, width: 1080, height: 2340 },
  screenRadius: 72,
} as const;

export type AndroidBezelStyle = {
  fill: string;
  stroke: string;
  camera: string;
};

const ANDROID_BEZEL_STYLES: Record<string, AndroidBezelStyle> = {
  "17-pro-silver": { fill: "#C8CDD4", stroke: "#F4F6F8", camera: "#050607" },
  "17-pro-blue": { fill: "#294B73", stroke: "#5E82AD", camera: "#050607" },
  "17-pro-orange": { fill: "#D96B2B", stroke: "#F2A16F", camera: "#050607" },
};

/** Maps the existing bezel selector onto license-free Android frame tints. */
export function androidBezelStyle(variant: string): AndroidBezelStyle {
  return ANDROID_BEZEL_STYLES[variant] ?? ANDROID_BEZEL_STYLES["17-pro-blue"]!;
}
