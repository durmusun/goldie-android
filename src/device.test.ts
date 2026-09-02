import { describe, expect, test } from "bun:test";
import { parseAndroidEmulatorSerials } from "./device.ts";

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
