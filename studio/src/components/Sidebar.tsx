import { ExternalLinkIcon, MoonIcon, SunIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  SelectContent,
  SelectItem,
  Select as SelectRoot,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { StoreManifest } from "../manifest";
import { DesignPanel } from "./DesignPanel";
import { ExportPanel } from "./ExportPanel";

/**
 * The left rail: the goldie wordmark with the appearance toggle, what the
 * strip shows (device and locale, when there is a choice), the design
 * controls, and a sticky Export footer.
 */
export function Sidebar({
  manifest,
  device,
  locale,
  dark,
  onDevice,
  onLocale,
  onDark,
  background,
  frame,
  fontFamily,
  template,
  layout,
  screenOnly,
  onBackground,
  onFrame,
  onFontFamily,
  onTemplate,
  onLayout,
  onScreenOnly,
}: {
  manifest: StoreManifest;
  device: string;
  locale: string;
  dark: boolean;
  onDevice: (v: string) => void;
  onLocale: (v: string) => void;
  onDark: (v: boolean) => void;
  background: string;
  frame: string;
  fontFamily: string;
  template: string;
  layout: string;
  screenOnly: boolean;
  onBackground: (v: string) => void;
  onFrame: (v: string) => void;
  onFontFamily: (v: string) => void;
  onTemplate: (v: string) => void;
  onLayout: (v: string) => void;
  onScreenOnly: (v: boolean) => void;
}) {
  const playAssets = manifest.googlePlay?.locales[locale];
  return (
    <aside className="flex w-[300px] shrink-0 flex-col overflow-hidden rounded-2xl border border-sidebar-border bg-sidebar text-sidebar-foreground">
      <header className="flex h-14 shrink-0 items-center justify-between pr-3 pl-5">
        <h1 className="text-base font-semibold tracking-tight select-none">
          <span className="goldie-wordmark">goldie</span>
        </h1>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => onDark(!dark)}
          aria-label={dark ? "Switch to light appearance" : "Switch to dark appearance"}
        >
          {dark ? <SunIcon /> : <MoonIcon />}
        </Button>
      </header>

      <div className="sidebar-scroll flex-1 overflow-y-auto">
        {manifest.devices.length > 1 || manifest.locales.length > 1 ? (
          <div className="flex flex-col gap-4 p-5">
            {manifest.devices.length > 1 ? (
              <Field label="Device">
                <Select
                  value={device}
                  onChange={onDevice}
                  options={manifest.devices.map((d) => [d.key, d.label])}
                />
              </Field>
            ) : null}
            {manifest.locales.length > 1 ? (
              <Field label="Locale">
                <Select
                  value={locale}
                  onChange={onLocale}
                  options={manifest.locales.map((l) => [l, l])}
                />
              </Field>
            ) : null}
          </div>
        ) : null}
        <DesignPanel
          design={manifest.design}
          background={background}
          frame={frame}
          fontFamily={fontFamily}
          template={template}
          layout={layout}
          screenOnly={screenOnly}
          onBackground={onBackground}
          onFrame={onFrame}
          onFontFamily={onFontFamily}
          onTemplate={onTemplate}
          onLayout={onLayout}
          onScreenOnly={onScreenOnly}
        />
      </div>

      <footer className="shrink-0 bg-sidebar p-4">
        {playAssets ? (
          <div className="mb-3 flex items-center gap-3 text-[11px] text-muted-foreground">
            <a
              className="inline-flex items-center gap-1 hover:text-foreground"
              href={`/${playAssets.featureGraphic}`}
              target="_blank"
              rel="noreferrer"
            >
              Feature graphic <ExternalLinkIcon className="size-3" />
            </a>
            <a
              className="inline-flex items-center gap-1 hover:text-foreground"
              href={`/${playAssets.listingManifest}`}
              target="_blank"
              rel="noreferrer"
            >
              Play manifest <ExternalLinkIcon className="size-3" />
            </a>
          </div>
        ) : null}
        <ExportPanel
          background={background}
          frame={frame}
          font={fontKey(manifest.design, fontFamily)}
          template={template}
          layout={layout}
          screenOnly={screenOnly}
        />
      </footer>
    </aside>
  );
}

/**
 * The CLI's --font key for the current font stack: a bundled font's key when
 * the stack names its family, "system" when it is the config's own stack
 * (the CLI then leaves theme.fontFamily alone), else undefined.
 */
function fontKey(design: StoreManifest["design"], fontFamily: string): string | undefined {
  if (fontFamily === design.theme.fontFamily) return undefined;
  return design.fonts.find((f) => fontFamily.startsWith(`"${f.family}"`))?.key ?? "system";
}

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between">
        <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
        {hint ? <span className="text-[11px] text-muted-foreground/70">{hint}</span> : null}
      </div>
      {children}
    </div>
  );
}

/**
 * Radix Select treats "" as "no value", so the custom-frame option (an empty
 * slug) rides on a sentinel that is mapped back on change.
 */
const EMPTY = "__none__";

export function Select({
  value,
  onChange,
  options,
  size = "default",
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  options: Array<[string, string]>;
  size?: "sm" | "default";
  className?: string;
}) {
  return (
    <SelectRoot value={value || EMPTY} onValueChange={(v) => onChange(v === EMPTY ? "" : v)}>
      <SelectTrigger size={size} className={className ?? "w-full"}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map(([v, label]) => (
          <SelectItem key={v} value={v || EMPTY}>
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </SelectRoot>
  );
}
