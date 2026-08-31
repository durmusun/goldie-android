import type { GoldieConfig } from "./src/config.ts";

/**
 * Android template. Copy this file into a project-external store-assets
 * workspace and fill in the app's values. Every relative path resolves
 * against the config file, and out/ is created next to it. Point Goldie
 * Android at the file with the GOLDIE_CONFIG environment variable.
 *
 * Scene flows are Argent flows stored beside this config in .argent/flows.
 * They are named the way `argent flow run <name>` names them, so a recorded
 * flow replays here unchanged.
 */

const APP_ROOT = "/absolute/path/to/the/app/repo";

const config: GoldieConfig = {
  appRoot: APP_ROOT,
  flowsDir: ".argent/flows",

  // These inherited iOS fields remain part of the shared config contract but
  // are not used by the android-phone device.
  appPath: "",
  bundleId: "com.example.app",
  android: {
    appPath: "/absolute/path/to/app-release.apk",
    applicationId: "com.example.app",
  },

  devices: ["android-phone"],
  locales: ["en-US"],
  appearance: "light",

  // Bundled bezel art for the screenshots: "17-pro-silver" | "17-pro-blue" | "17-pro-orange".
  // Custom art instead: frame: { image: "path/to/bezel.png" } (re-measure src/frame.ts).
  frame: { variant: "17-pro-blue" },

  theme: {
    background: "linear-gradient(160deg, #E8F1FF 0%, #F7FAFF 55%, #FFFFFF 100%)",
    headlineColor: "#0E1B2A",
    subheadColor: "#5A6A7D",
    // System stack, or a bundled typeface first: "Merriweather", "DM Mono",
    // "Lato", "DM Sans", "Montserrat" (see src/fonts.ts).
    fontFamily: '"DM Sans", system-ui, sans-serif',
    copyHeightRatio: 0.24,
    deviceWidthRatio: 0.84,
    // The strip's rhythm: a built-in template ("editorial", "showcase",
    // "magazine", "storyboard", "dynamic") or your own sequence of layout keys
    // applied to the scenes in order. Layout keys, from src/layouts.ts:
    // "classic", "copy-below", "hero", "offset", "tilt", "tilt-right", "duo",
    // "duo-tilt", "panorama", "panorama-duo", "minimal".
    // template: ["panorama", "hero", "tilt", "minimal"],
    // Layout for every scene the template leaves out (or all, with no template).
    layout: "classic",
    // screenOnly: true,  bare screens with a shadow, no bezel
    // decorations: [{ kind: "badge", text: { "en-US": "Editors' Choice" }, position: "top-right" }],
  },

  // Renders the realistic store page around the assets in the studio.
  store: {
    name: "AppName",
    subtitle: { "en-US": "Under 30 characters" },
    developer: "Company Name",
    category: "Productivity",
    rating: 4.8, // cosmetic, studio only
    ratingCount: "1K reviews",
    ageRating: "4+",
    price: "Free",
    description: { "en-US": "Two or three short paragraphs, store voice." },
  },

  // Android configs automatically receive a 1024x500 Google Play feature
  // graphic. Omit this block to use store.name, store.subtitle and the theme
  // background, or override any localized copy/style here.
  googlePlay: {
    featureGraphic: {
      title: { "en-US": "AppName" },
      subtitle: { "en-US": "A short, benefit-led promise" },
      // background: "linear-gradient(135deg, #0F172A, #2563EB)",
      // titleColor: "#FFFFFF",
      // subtitleColor: "#D9E1EA",
    },
  },

  scenes: [
    // One entry per screenshot, in store-page order. The flow navigates to the
    // screen; Goldie Android takes the screenshot after its last step. Flow values are
    // argent flow names under .argent/flows (a path under it also works).
    {
      kind: "screenshot",
      id: "home",
      flow: "store-01-home",
      headline: { "en-US": "Benefit-led headline" },
      subhead: { "en-US": "One short sentence expanding the headline." },
      altText: { "en-US": "The app home screen showing the primary workflow." },
      // layout: "hero",             this tile only
      // secondScene: "detail",      the second screen of a duo / panorama-duo layout
      // decorations: [{ kind: "image", src: "art/sticker.png", x: 0.7, y: 0.1, width: 0.25 }],
    },

    // Add 2-8 distinct screenshot scenes. Four or more are recommended.
  ],
};

export default config;
