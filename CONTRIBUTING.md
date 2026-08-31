# Contributing to Goldie Android

Thank you for helping improve the Android and Google Play workflow.

Goldie Android is an unofficial fork of
[`kacperkapusciak/goldie`](https://github.com/kacperkapusciak/goldie). Keep
changes focused, preserve upstream attribution, and avoid changes that break
the original iOS code paths even though this distribution targets Android.

## Development setup

```bash
git clone https://github.com/durmusun/goldie-android.git
cd goldie-android
bun install --frozen-lockfile
```

Before submitting a pull request, run:

```bash
bun test
bun run check:ci
bunx tsc --noEmit
(cd studio && bunx tsc --noEmit)
bun run build
```

Changes to Android capture or rendering should also be exercised with a
release APK on a running emulator. A Google Play export is complete only when
`verify` exits successfully.

## Pull requests

- Explain the user-visible problem and the chosen fix.
- Add or update focused tests.
- Keep app-specific configs, flows, APKs, screenshots, recordings, and output
  archives out of the repository.
- Do not add third-party device artwork without a redistribution-compatible
  license and complete attribution.
- Preserve `LICENSE`, `assets/ATTRIBUTION.md`, and `assets/fonts/OFL.txt`.
- Call out any behavior inherited from or intended for upstream Goldie.

Small, reviewable changes are preferred. A contribution is provided under the
repository's existing license unless a separate written agreement applies.
