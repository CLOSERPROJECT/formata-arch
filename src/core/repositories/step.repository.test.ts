import { describe, it, expect } from "vitest";
import type { AttestaConfig } from "$core/schema.js";
import { StepRepository } from "./step.repository.js";

function createTestConfig(steps: AttestaConfig["workflow"]["steps"] = []): AttestaConfig {
	return {
		workflow: { name: "Test", steps: [...steps] },
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

const step1 = {
	id: "s1",
	title: "Step 1",
	order: 0,
	substeps: [
		{
			id: "sub1",
			title: "Sub 1",
			order: 0,
			role: "r1",
			inputKey: "k1",
			inputType: "string" as const
		}
	]
};

describe("StepRepository", () => {
	describe("getSchema", () => {
		it("returns schema with $ref to Step", () => {
			const config = createTestConfig();
			const repo = new StepRepository(config);
			const schema = repo.getSchema();
			expect(schema.$ref).toBe("#/$defs/Step");
		});
	});

	describe("list", () => {
		it("returns all steps", () => {
			const config = createTestConfig([step1]);
			const repo = new StepRepository(config);
			expect(repo.list()).toEqual([step1]);
			expect(repo.list()).toHaveLength(1);
		});

		it("returns empty array when no steps", () => {
			const config = createTestConfig();
			const repo = new StepRepository(config);
			expect(repo.list()).toEqual([]);
		});
	});

	describe("getOne", () => {
		it("returns Ok(step) when step exists", () => {
			const config = createTestConfig([step1]);
			const repo = new StepRepository(config);
			const result = repo.getOne("s1");
			expect(result.isOk).toBe(true);
			if (result.isOk) {
				expect(result.value).toEqual(step1);
			}
		});

		it("returns Err when step does not exist", () => {
			const config = createTestConfig();
			const repo = new StepRepository(config);
			const result = repo.getOne("missing");
			expect(result.isErr).toBe(true);
			if (result.isErr) {
				expect(result.error.message).toBe("Step not found: missing");
			}
		});
	});

	describe("create", () => {
		it("adds step and returns Ok(data)", () => {
			const config = createTestConfig();
			const repo = new StepRepository(config);
			const result = repo.create(step1);
			expect(result.isOk).toBe(true);
			if (result.isOk) {
				expect(result.value).toEqual(step1);
			}
			expect(config.workflow.steps).toHaveLength(1);
			expect(config.workflow.steps[0]).toEqual(step1);
		});

		it("returns Err when step id already exists", () => {
			const config = createTestConfig([step1]);
			const repo = new StepRepository(config);
			const result = repo.create({ ...step1, title: "Other" });
			expect(result.isErr).toBe(true);
			if (result.isErr) {
				expect(result.error.message).toBe("Step already exists: s1");
			}
		});
	});

	describe("update", () => {
		it("replaces step and returns Ok(data)", () => {
			const config = createTestConfig([step1]);
			const repo = new StepRepository(config);
			const updated = { ...step1, title: "Updated" };
			const result = repo.update("s1", updated);
			expect(result.isOk).toBe(true);
			expect(config.workflow.steps[0].title).toBe("Updated");
		});

		it("returns Err when step does not exist", () => {
			const config = createTestConfig();
			const repo = new StepRepository(config);
			const result = repo.update("missing", step1);
			expect(result.isErr).toBe(true);
		});
	});

	describe("delete", () => {
		it("removes step and returns Ok(undefined)", () => {
			const config = createTestConfig([step1]);
			const repo = new StepRepository(config);
			const result = repo.delete("s1");
			expect(result.isOk).toBe(true);
			expect(config.workflow.steps).toHaveLength(0);
		});

		it("returns Err when step does not exist", () => {
			const config = createTestConfig();
			const repo = new StepRepository(config);
			const result = repo.delete("missing");
			expect(result.isErr).toBe(true);
		});
	});
});
