import { afterEach, describe, expect, it } from "bun:test";
import { existsSync, mkdtempSync, mkdirSync, symlinkSync } from "node:fs";
import { rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { requiredMaterializedNodeModules } from "../runtime-dependencies";
import { removeModulePathForReplacement } from "./copy-native-modules";

const tempRoots: string[] = [];

afterEach(async () => {
	await Promise.all(
		tempRoots.splice(0).map((path) =>
			rm(path, {
				force: true,
				recursive: true,
			}),
		),
	);
});

describe("copy-native-modules", () => {
	it("does not require the macOS metrics addon on non-macOS targets", () => {
		if (process.platform === "darwin") {
			return;
		}

		expect(requiredMaterializedNodeModules).not.toContain(
			"@superset/macos-process-metrics",
		);
	});

	it("removes a directory symlink without deleting its target", () => {
		const root = mkdtempSync(join(tmpdir(), "superset-native-modules-"));
		tempRoots.push(root);

		const targetPath = join(root, "target");
		const linkPath = join(root, "node_modules", "native-module");
		mkdirSync(targetPath, { recursive: true });
		mkdirSync(join(root, "node_modules"), { recursive: true });
		symlinkSync(targetPath, linkPath, "dir");

		removeModulePathForReplacement(linkPath);

		expect(existsSync(linkPath)).toBe(false);
		expect(existsSync(targetPath)).toBe(true);
	});
});
