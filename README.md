# Goldie Android

Google Play screenshot and listing-asset automation for coding agents and
humans. Goldie Android drives a real Android app through
[Argent](https://github.com/software-mansion/argent), captures deterministic
screens, frames them with an Android-native bezel, generates localized
marketing artwork, validates the result, and exports an upload-ready package.

> [!IMPORTANT]
> Goldie Android is an independent, unofficial Android-focused fork of
> [Kacper Kapuściak's Goldie](https://github.com/kacperkapusciak/goldie).
> For iOS and App Store assets, use the original Goldie project.

## What it produces

For every configured locale:

```text
out/google-play/<locale>/
├── phone/                  1080x1920 RGB PNG screenshots
├── feature-graphic.png     1024x500 RGB PNG
├── alt-text.json           accessibility copy by filename
└── listing-manifest.json   package metadata and compliance findings
```

The verifier enforces the Google Play requirements it can determine
mechanically:

- 2–8 phone screenshots;
- PNG/JPEG-compatible, opaque output;
- dimensions between 320 and 3840 pixels;
- no more than a 2:1 long-to-short aspect ratio;
- exactly one opaque 1024x500 feature graphic;
- expected render count, alt text, and listing metadata.

It recommends 1080x1920 screenshots and warns below four screenshots, for
repeated early scenes, and for common calls-to-action or risky promotional
claims. A human must still review visual quality and misleading-content risk.

## Requirements

- macOS;
- Node.js 20.12 or newer;
- [Bun](https://bun.sh);
- Android SDK tools (`adb` and a running emulator);
- `ffmpeg` and `ffprobe`;
- a release APK;
- Argent 0.22 or newer.

Goldie Android deliberately does not boot an arbitrary AVD. Start one first:

```bash
emulator -list-avds
emulator -avd <name>
```

## Install from source

The first public release is source-first; no npm package has been published
yet.

```bash
git clone https://github.com/durmusun/goldie-android.git
cd goldie-android
bun install --frozen-lockfile
bun run build
./dist/cli.js help
```

The intended package and CLI name is `goldie-android`. When working from the
source checkout, the examples below can be run as
`bun src/cli.ts <command>` or `./dist/cli.js <command>`.

To install the included agent skill directly from GitHub:

```bash
npx skills add durmusun/goldie-android
```

## Configure

Copy `goldie.config.example.ts` to a project-external working directory and
set `GOLDIE_CONFIG` to its absolute path. Keeping configs, Argent flows, raw
captures, and store output outside the target app repository prevents
marketing automation from polluting the app's source tree.

The essential Android fields are:

```ts
android: {
  appPath: "/absolute/path/to/app-release.apk",
  applicationId: "com.example.app",
},
devices: ["android-phone"],
locales: ["en-US"],
```

Scenes point to replayable Argent YAML flows. See
[`goldie.config.example.ts`](goldie.config.example.ts) and the
[`skills/goldie/references`](skills/goldie/references) documentation for the
full schema and flow conventions.

## Run

Always run the complete validation sequence before treating an export as
finished:

```bash
GOLDIE_CONFIG=/absolute/path/goldie.config.ts ./dist/cli.js doctor
GOLDIE_CONFIG=/absolute/path/goldie.config.ts ./dist/cli.js capture
GOLDIE_CONFIG=/absolute/path/goldie.config.ts ./dist/cli.js frame
GOLDIE_CONFIG=/absolute/path/goldie.config.ts ./dist/cli.js preview
GOLDIE_CONFIG=/absolute/path/goldie.config.ts ./dist/cli.js manifest
GOLDIE_CONFIG=/absolute/path/goldie.config.ts ./dist/cli.js verify
```

Or run the whole pipeline:

```bash
GOLDIE_CONFIG=/absolute/path/goldie.config.ts ./dist/cli.js all
```

Open the visual editor with:

```bash
GOLDIE_CONFIG=/absolute/path/goldie.config.ts ./dist/cli.js studio
```

Studio runs at <http://localhost:4321>. Its export action renders the selected
design, generates the Google Play package, runs verification, and creates a
ZIP only when the required checks pass.

## Android rendering

The default Android frame is code-native and uses Pixel-class geometry with a
punch-hole camera. Silver, Deep Blue, and Cosmic Orange bezel tints are
available in both the CLI and Studio. Custom Android frame art and screen
cutout geometry can be supplied through `android.frame`; external device art
is never bundled automatically.

Google Play accepts a YouTube URL rather than an uploaded app-preview video,
so Android devices skip the video render while retaining the shared command
pipeline.

## Development

```bash
bun install --frozen-lockfile
bun test
bun run check:ci
bunx tsc --noEmit
(cd studio && bunx tsc --noEmit)
bun run build
```

Please read [`CONTRIBUTING.md`](CONTRIBUTING.md) before opening a pull request.

## Project lineage

- **Original Goldie:** Kacper Kapuściak and upstream contributors.
- **Initial Android capture support:** Craig de Gouveia (`HughZurname`).
- **Goldie Android Play packaging, compliance, Android framing, and Studio
  integration:** Durmuş Ün.

Commit history is preserved so every contribution remains attributable. This
fork is not endorsed by Kacper Kapuściak, Craig de Gouveia, Software Mansion,
or the upstream Goldie project.

## License and third-party notices

The software is distributed under the MIT License; retain the copyright and
permission notice in [`LICENSE`](LICENSE).

Bundled iPhone bezel images inherited from upstream are not MIT-licensed.
They are derived from Kelly Hu's device frames under CC BY 4.0; see
[`assets/ATTRIBUTION.md`](assets/ATTRIBUTION.md). Bundled fonts are licensed
under the SIL Open Font License 1.1; see
[`assets/fonts/OFL.txt`](assets/fonts/OFL.txt).
