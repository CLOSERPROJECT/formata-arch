import { describe, it, expect } from "vitest";
import type { AttestaConfig } from "$core/schema.js";
import { ConfigRepository } from "./config.repository.js";

function createTestConfig(): AttestaConfig {
	return {
		workflow: { name: "Test", steps: [] },
		departments: [{ id: "d1", name: "Dept", color: "#000", border: "#000" }],
		users: [],
		dpp: {
			enabled: false,
			gtin: "",
			lotInputKey: "",
			lotDefault: "",
			serialInputKey: "",
			serialStrategy: "",
			productName: "",
			productDescription: "",
			ownerName: ""
		}
	};
}

describe("ConfigRepository", () => {
	describe("getSchema", () => {
		it("returns schema with $ref to Config", () => {
			const config = createTestConfig();
			const repo = new ConfigRepository(config);
			const schema = repo.getSchema();
			expect(schema.$ref).toBe("#/$defs/Config");
		});
	});

	describe("list", () => {
		it("returns array with single config", () => {
			const config = createTestConfig();
			const repo = new ConfigRepository(config);
			const list = repo.list();
			expect(list).toHaveLength(1);
			expect(list[0]).toBe(config);
		});
	});

	describe("getOne", () => {
		it("returns Ok(config) when key is 'config'", () => {
			const config = createTestConfig();
			const repo = new ConfigRepository(config);
			const result = repo.getOne("config");
			expect(result.isOk).toBe(true);
			if (result.isOk) {
				expect(result.value).toBe(config);
			}
		});

		it("returns Err when key is not 'config'", () => {
			const config = createTestConfig();
			const repo = new ConfigRepository(config);
			const result = repo.getOne("other");
			expect(result.isErr).toBe(true);
			if (result.isErr) {
				expect(result.error.message).toBe("Config not found: other");
			}
		});
	});

	describe("create", () => {
		it("updates config and returns Ok(config)", () => {
			const config = createTestConfig();
			const repo = new ConfigRepository(config);
			const newWorkflow = { name: "NewWorkflow", steps: [] };
			const result = repo.create({
				...config,
				workflow: newWorkflow
			});
			expect(result.isOk).toBe(true);
			if (result.isOk) {
				expect(result.value.workflow).toEqual(newWorkflow);
			}
			expect(config.workflow).toEqual(newWorkflow);
		});
	});

	describe("update", () => {
		it("updates config when key is 'config'", () => {
			const config = createTestConfig();
			const repo = new ConfigRepository(config);
			const updated = {
				...config,
				workflow: { name: "Updated", steps: [] }
			};
			const result = repo.update("config", updated);
			expect(result.isOk).toBe(true);
			expect(config.workflow.name).toBe("Updated");
		});

		it("returns Err when key is not 'config'", () => {
			const config = createTestConfig();
			const repo = new ConfigRepository(config);
			const result = repo.update("other", config);
			expect(result.isErr).toBe(true);
		});
	});

	describe("delete", () => {
		it("returns Err (cannot delete config)", () => {
			const config = createTestConfig();
			const repo = new ConfigRepository(config);
			const result = repo.delete("config");
			expect(result.isErr).toBe(true);
			if (result.isErr) {
				expect(result.error.message).toBe("Cannot delete config");
			}
		});
	});
});
