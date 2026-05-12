import { describe, expect, it } from "bun:test";
import pkg from "../package.json";
import {
	electronPrebuiltNativeModules,
	getElectronVersion,
} from "./prepare-electron-native-modules";

describe("prepare-electron-native-modules", () => {
	it("prepares better-sqlite3 for Electron before packaging", () => {
		expect(electronPrebuiltNativeModules).toContain("better-sqlite3");
	});

	it("uses the exact Electron version from the desktop package", () => {
		expect(getElectronVersion()).toBe(
			pkg.devDependencies.electron.replace(/^[^\d]*/, ""),
		);
	});
});
