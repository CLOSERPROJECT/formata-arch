import { describe, it, expect } from "vitest";
import type { AttestaConfig } from "$core/schema.js";
import { WorkflowRepository } from "./workflow.repository.js";

function createTestConfig(workflow?: AttestaConfig["workflow"]): AttestaConfig {
	return {
		workflow: workflow ?? { name: "Test", steps: [] },
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

describe("WorkflowRepository", () => {
	describe("getSchema", () => {
		it("returns schema with $ref to Workflow", () => {
			const config = createTestConfig();
			const repo = new WorkflowRepository(config);
			const schema = repo.getSchema();
			expect(schema.$ref).toBe("#/$defs/Workflow");
		});
	});

	describe("list", () => {
		it("returns array with single workflow", () => {
			const config = createTestConfig();
			const repo = new WorkflowRepository(config);
			const list = repo.list();
			expect(list).toHaveLength(1);
			expect(list[0]).toBe(config.workflow);
		});
	});

	describe("getOne", () => {
		it("returns Ok(workflow) when key is 'workflow'", () => {
			const config = createTestConfig();
			const repo = new WorkflowRepository(config);
			const result = repo.getOne("workflow");
			expect(result.isOk).toBe(true);
			if (result.isOk) {
				expect(result.value).toBe(config.workflow);
			}
		});

		it("returns Err when key is not 'workflow'", () => {
			const config = createTestConfig();
			const repo = new WorkflowRepository(config);
			const result = repo.getOne("other");
			expect(result.isErr).toBe(true);
			if (result.isErr) {
				expect(result.error.message).toBe("Workflow not found: other");
			}
		});
	});

	describe("create", () => {
		it("sets workflow and returns Ok(workflow)", () => {
			const config = createTestConfig();
			const repo = new WorkflowRepository(config);
			const newWorkflow = { name: "NewFlow", steps: [] };
			const result = repo.create(newWorkflow);
			expect(result.isOk).toBe(true);
			if (result.isOk) {
				expect(result.value).toEqual(newWorkflow);
			}
			expect(config.workflow).toEqual(newWorkflow);
		});
	});

	describe("update", () => {
		it("updates workflow when key is 'workflow'", () => {
			const config = createTestConfig();
			const repo = new WorkflowRepository(config);
			const updated = { name: "Updated", steps: [] };
			const result = repo.update("workflow", updated);
			expect(result.isOk).toBe(true);
			expect(config.workflow).toEqual(updated);
		});

		it("returns Err when key is not 'workflow'", () => {
			const config = createTestConfig();
			const repo = new WorkflowRepository(config);
			const result = repo.update("other", { name: "X", steps: [] });
			expect(result.isErr).toBe(true);
		});
	});

	describe("delete", () => {
		it("returns Err (cannot delete workflow)", () => {
			const config = createTestConfig();
			const repo = new WorkflowRepository(config);
			const result = repo.delete("workflow");
			expect(result.isErr).toBe(true);
			if (result.isErr) {
				expect(result.error.message).toBe("Cannot delete workflow");
			}
		});
	});
});
