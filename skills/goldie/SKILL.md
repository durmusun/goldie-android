---
name: goldie-android
description: >-
  Create Google Play screenshots and listing assets for an Android app with
  Goldie Android: explore the app on an emulator, author Argent flows, capture
  real screens, render Android-native device frames and localized marketing
  copy, generate the 1024x500 feature graphic, verify Play constraints, and
  export the store package. Use whenever the user asks for Android or Google
  Play screenshots, Play Store assets, a feature graphic, framed Android
  marketing screenshots, or mentions Goldie Android. Do not use this fork for
  iOS/App Store work; use the original Goldie project there.
---

# Goldie Android

Goldie Android turns deterministic captures from a real Android app into a
Google Play package. It owns capture orchestration, Android framing,
localized copy, the feature graphic, manifests, compliance checks, Studio,
and ZIP export. The agent owns scene selection, replayable flows, truthful
marketing copy, and final human visual review.

The required end state is:

- 2–8 distinct phone screenshots, with 4 or more preferred;
- 1080x1920 opaque PNG output unless the project requires another valid Play
  size;
- one opaque 1024x500 feature graphic;
- `alt-text.json` and `listing-manifest.json`;
- a successful `verify` run;
- a visually reviewed Studio export.

## Platform boundary

This skill is Android-only.

- Android / Google Play: Goldie Android.
- iOS / App Store: upstream Goldie at
  <https://github.com/kacperkapusciak/goldie>.

Never silently route an iOS request through this fork.

## Keep store automation outside the app repo

Do not add Goldie config, Argent marketing flows, captures, rendered assets,
ZIPs, or temporary files to the target application repository unless the user
explicitly asks for that layout. Use a separate working directory and point
the config's `appRoot` and `android.appPath` at the application.

Example:

```text
<workspace>/
├── app/                         target app; no Goldie output
└── app-store-assets/            external Goldie workspace
    ├── goldie.config.ts
    ├── .argent/flows/
    └── out/
```

## Resolve the CLI

Install the prebuilt release when the CLI is not already available:

```bash
npm install -g https://github.com/durmusun/goldie-android/releases/latest/download/goldie-android.tgz
```

Then use the stable command:

```bash
goldie-android help
```

Set `GOLDIE_CONFIG` on every command because shell state may not persist
between tool calls. Source checkout execution is an advanced development
fallback, not the normal installation path.

Goldie Android runs on macOS, Linux, and Windows with Node 20+, ffmpeg, the
Android SDK, and Argent available. Capture reuses a running emulator or boots
the first installed AVD; physical Android devices are never eligible.

## 1. Inspect before changing anything

Read any existing external `goldie.config.ts`, `goldie.design.json`, and every
flow referenced by its scenes. Treat them as the source of truth for scene
order, copy, theme, frame, listing metadata, and output.

From the Android app, determine:

- application ID;
- newest release APK path;
- supported locales;
- first-run state and any required seed data;
- exact visible text and accessibility IDs for stable flow selectors.

Use Argent discovery against a running emulator. Do not invent selectors or
tap coordinates from a screenshot. Prefer IDs, then stable text. A coordinate
fallback needs a preceding `echo` and a hard destination assertion.

## 2. Choose a Play story

Choose at least two genuinely different screens. Four to six usually gives a
stronger listing. Lead with the clearest product value, then cover distinct
capabilities rather than repeating one screen with different headlines.

Write short, truthful, benefit-led copy. Avoid install/download CTAs, ranking
claims, unverifiable superlatives, prices, discounts, awards, and guarantees.
Match the app's existing voice and locale.

When a Play promo video is requested, add a three- or four-segment preview
scene that tells one short user journey. Goldie joins the raw Android clips
without captions or framing into a portrait video for the user to publish on
YouTube; Google's Play listing links to that video instead of accepting an
upload, so App Store duration rules do not apply.

## 3. Author config and flows

Read `references/config.md` for the full schema and `references/flows.md` for
Argent YAML. The minimum Android config includes:

```ts
android: {
  appPath: "/absolute/path/to/app-release.apk",
  applicationId: "com.example.app",
},
devices: ["android-phone"],
locales: ["en-US"],
```

Every screenshot scene needs localized `headline`, optional `subhead`, useful
`altText`, and a replayable flow. Add localized `googlePlay.featureGraphic`
copy when the store name/subtitle defaults are not sufficient.

Flows must establish deterministic state, prove the intended destination,
and finish with readiness. Run each flow directly with Argent before the full
capture.

## 4. Run the mandatory pipeline

Run in this order and stop on failure:

```bash
GOLDIE_CONFIG=/absolute/path/goldie.config.ts goldie-android doctor
GOLDIE_CONFIG=/absolute/path/goldie.config.ts goldie-android capture
GOLDIE_CONFIG=/absolute/path/goldie.config.ts goldie-android frame
GOLDIE_CONFIG=/absolute/path/goldie.config.ts goldie-android preview
GOLDIE_CONFIG=/absolute/path/goldie.config.ts goldie-android manifest
GOLDIE_CONFIG=/absolute/path/goldie.config.ts goldie-android verify
```

When a preview scene exists, `preview` renders a portrait Android video for a
self-hosted YouTube Play promo. With no preview scene it remains a harmless
step in the shared pipeline.

`doctor` must confirm ADB, Argent, ffmpeg, release APK, emulator, flow paths,
and watermark state. Never capture a Debug build with development overlays.

## 5. Review in Studio

```bash
GOLDIE_CONFIG=/absolute/path/goldie.config.ts goldie-android studio --no-open
```

Open <http://localhost:4321>. Review every tile at full size:

- Android frame, punch-hole, and screen crop look native;
- headline and subhead are not clipped;
- app UI is sharp and in the intended locale;
- screenshots are distinct and ordered well;
- no debug, notification, account, or private data is visible;
- feature graphic is legible and does not misuse device art.

Studio export must end with `[done]`. A failed verification must not leave an
old ZIP available.

## 6. Report completion

Report:

- exact output directory and ZIP path;
- screenshot count, dimensions, and locale;
- feature graphic dimensions;
- preview video path and duration when configured;
- whether `verify` passed;
- every remaining warning;
- any item that still needs human Play Console review.

Never call the work complete when `verify` reports `FAIL`.
