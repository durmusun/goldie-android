import { describe, expect, test } from "bun:test";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { availableAvds, parseAndroidEmulatorSerials } from "./device.ts";

describe("parseAndroidEmulatorSerials", () => {
  test("ignores physical devices even when they appear before an emulator", () => {
    const output = [
      "List of devices attached",
      "adb-physical-demo._adb-tls-connect._tcp\tdevice",
      "emulator-5554\tdevice",
      "",
    ].join("\n");

    expect(parseAndroidEmulatorSerials(output)).toEqual(["emulator-5554"]);
  });

  test("ignores offline and unauthorized emulators", () => {
    const output = [
      "List of devices attached",
      "emulator-5554\toffline",
      "emulator-5556\tunauthorized",
      "emulator-5558\tdevice",
      "",
    ].join("\n");

    expect(parseAndroidEmulatorSerials(output)).toEqual(["emulator-5558"]);
  });

  test("returns no target when only physical devices are connected", () => {
    const output = ["List of devices attached", "PHYSICAL-DEMO-001\tdevice", ""].join("\n");

    expect(parseAndroidEmulatorSerials(output)).toEqual([]);
  });
});

describe("availableAvds", () => {
  test("returns installed AVD directories in deterministic order", async () => {
    const root = await mkdtemp(join(tmpdir(), "goldie-avds-"));
    const original = process.env.ANDROID_AVD_HOME;
    process.env.ANDROID_AVD_HOME = root;
    try {
      await mkdir(join(root, "Pixel_Z.avd"));
      await mkdir(join(root, "Pixel_A.avd"));
      await mkdir(join(root, "not-an-avd"));
      await writeFile(join(root, "file.avd"), "not a directory");

      expect(await availableAvds()).toEqual(["Pixel_A", "Pixel_Z"]);
    } finally {
      if (original === undefined) delete process.env.ANDROID_AVD_HOME;
      else process.env.ANDROID_AVD_HOME = original;
      await rm(root, { recursive: true, force: true });
    }
  });
});
