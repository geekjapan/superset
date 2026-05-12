/**
 * Prepare native modules that need Electron ABI prebuilds before packaging.
 *
 * Bun installs native modules for the local Node ABI. Electron loads native
 * addons with its own ABI, so modules like better-sqlite3 must be replaced with
 * the matching Electron prebuild before copy-native-modules materializes them.
 */

import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import pkg from "../package.json";

export const electronPrebuiltNativeModules = ["better-sqlite3"] as const;

export function getElectronVersion(): string {
	return pkg.devDependencies.electron.replace(/^[^\d]*/, "");
}

type PrepareElectronNativeModulesOptions = {
	nodeModulesDir?: string;
	electronVersion?: string;
	targetArch?: string;
	targetPlatform?: string;
};

export function prepareElectronNativeModules({
	nodeModulesDir = join(dirname(import.meta.dirname), "node_modules"),
	electronVersion = getElectronVersion(),
	targetArch = process.env.TARGET_ARCH || process.arch,
	targetPlatform = process.env.TARGET_PLATFORM || process.platform,
}: PrepareElectronNativeModulesOptions = {}): void {
	console.log("Preparing Electron ABI native modules...");
	console.log(`  Electron: ${electronVersion}`);
	console.log(
		`  Target: ${targetPlatform}/${targetArch} (host: ${process.platform}/${process.arch})`,
	);

	for (const moduleName of electronPrebuiltNativeModules) {
		const modulePath = join(nodeModulesDir, moduleName);
		if (!existsSync(modulePath)) {
			console.warn(`  ${moduleName}: not found at ${modulePath} (skipping)`);
			continue;
		}

		console.log(`  ${moduleName}: installing Electron prebuild`);
		execFileSync(
			process.execPath,
			[
				"x",
				"prebuild-install",
				"--runtime=electron",
				`--target=${electronVersion}`,
				`--platform=${targetPlatform}`,
				`--arch=${targetArch}`,
			],
			{
				cwd: modulePath,
				stdio: "inherit",
			},
		);
	}
}

if (import.meta.main) {
	prepareElectronNativeModules();
}
