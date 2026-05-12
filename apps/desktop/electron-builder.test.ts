import { describe, expect, it } from "bun:test";
import config from "./electron-builder";
import pkg from "./package.json";

describe("electron-builder config", () => {
	it("packages prepared native modules without running node-gyp rebuilds", () => {
		expect(config.npmRebuild).toBe(false);
	});

	it("keeps the macOS metrics addon optional for non-macOS packages", () => {
		expect(pkg.dependencies).not.toHaveProperty(
			"@superset/macos-process-metrics",
		);
		expect(pkg.optionalDependencies).toHaveProperty(
			"@superset/macos-process-metrics",
			"workspace:*",
		);
	});

	it("builds a portable Windows x64 artifact without NSIS uninstaller extraction", () => {
		expect(config.win?.target).toEqual([
			{
				target: "portable",
				arch: ["x64"],
			},
		]);
	});

	it("prepares Electron ABI native modules before materializing them", () => {
		expect(pkg.scripts).toHaveProperty("prepare:electron-native-modules");
		expect(pkg.scripts.prebuild).toContain(
			"bun run prepare:electron-native-modules && bun run copy:native-modules",
		);
		expect(pkg.scripts.prepackage).toContain(
			"bun run prepare:electron-native-modules && bun run copy:native-modules",
		);
	});
});
