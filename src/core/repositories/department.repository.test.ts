import { describe, it, expect } from "vitest";
import type { AttestaConfig } from "$core/schema.js";
import { DepartmentRepository } from "./department.repository.js";

function createTestConfig(departments: AttestaConfig["departments"] = []): AttestaConfig {
	return {
		workflow: { name: "Test", steps: [] },
		departments: [...departments],
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

describe("DepartmentRepository", () => {
	describe("getSchema", () => {
		it("returns schema with $ref to Department", () => {
			const config = createTestConfig();
			const repo = new DepartmentRepository(config);
			const schema = repo.getSchema();
			expect(schema.$ref).toBe("#/$defs/Department");
		});
	});

	describe("list", () => {
		it("returns all departments", () => {
			const dept = { id: "d1", name: "Dept", color: "#000", border: "#000" };
			const config = createTestConfig([dept]);
			const repo = new DepartmentRepository(config);
			expect(repo.list()).toEqual([dept]);
			expect(repo.list()).toHaveLength(1);
		});

		it("returns empty array when no departments", () => {
			const config = createTestConfig();
			const repo = new DepartmentRepository(config);
			expect(repo.list()).toEqual([]);
		});
	});

	describe("getOne", () => {
		it("returns Ok(department) when department exists", () => {
			const dept = { id: "d1", name: "Dept", color: "#000", border: "#000" };
			const config = createTestConfig([dept]);
			const repo = new DepartmentRepository(config);
			const result = repo.getOne("d1");
			expect(result.isOk).toBe(true);
			if (result.isOk) {
				expect(result.value).toEqual(dept);
			}
		});

		it("returns Err when department does not exist", () => {
			const config = createTestConfig();
			const repo = new DepartmentRepository(config);
			const result = repo.getOne("missing");
			expect(result.isErr).toBe(true);
			if (result.isErr) {
				expect(result.error.message).toBe("Department not found: missing");
			}
		});
	});

	describe("create", () => {
		it("adds department and returns Ok(data)", () => {
			const config = createTestConfig();
			const repo = new DepartmentRepository(config);
			const newDept = { id: "d1", name: "Sales", color: "#f00", border: "#f00" };
			const result = repo.create(newDept);
			expect(result.isOk).toBe(true);
			if (result.isOk) {
				expect(result.value).toEqual(newDept);
			}
			expect(config.departments).toHaveLength(1);
			expect(config.departments[0]).toEqual(newDept);
		});

		it("returns Err when department id already exists", () => {
			const existing = { id: "d1", name: "Dept", color: "#000", border: "#000" };
			const config = createTestConfig([existing]);
			const repo = new DepartmentRepository(config);
			const result = repo.create({ id: "d1", name: "Other", color: "#fff", border: "#fff" });
			expect(result.isErr).toBe(true);
			if (result.isErr) {
				expect(result.error.message).toBe("Department already exists: d1");
			}
			expect(config.departments).toHaveLength(1);
			expect(config.departments[0]).toEqual(existing);
		});
	});

	describe("update", () => {
		it("replaces department and returns Ok(data)", () => {
			const dept = { id: "d1", name: "Dept", color: "#000", border: "#000" };
			const config = createTestConfig([dept]);
			const repo = new DepartmentRepository(config);
			const updated = { id: "d1", name: "Dept Updated", color: "#111", border: "#111" };
			const result = repo.update("d1", updated);
			expect(result.isOk).toBe(true);
			if (result.isOk) {
				expect(result.value).toEqual(updated);
			}
			expect(config.departments).toHaveLength(1);
			expect(config.departments[0]).toEqual(updated);
		});

		it("returns Err when department does not exist", () => {
			const config = createTestConfig();
			const repo = new DepartmentRepository(config);
			const result = repo.update("missing", {
				id: "missing",
				name: "X",
				color: "#000",
				border: "#000"
			});
			expect(result.isErr).toBe(true);
			if (result.isErr) {
				expect(result.error.message).toBe("Department not found: missing");
			}
		});
	});

	describe("delete", () => {
		it("removes department and returns Ok(undefined)", () => {
			const dept = { id: "d1", name: "Dept", color: "#000", border: "#000" };
			const config = createTestConfig([dept]);
			const repo = new DepartmentRepository(config);
			const result = repo.delete("d1");
			expect(result.isOk).toBe(true);
			expect(config.departments).toHaveLength(0);
		});

		it("returns Err when department does not exist", () => {
			const config = createTestConfig();
			const repo = new DepartmentRepository(config);
			const result = repo.delete("missing");
			expect(result.isErr).toBe(true);
			if (result.isErr) {
				expect(result.error.message).toBe("Department not found: missing");
			}
		});
	});
});
