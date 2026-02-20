import type { Repository } from "./index.js";
import type { AttestaConfig, AttestaConfigSchema } from "$core/schema.js";
import type { FromSchema } from "json-schema-to-ts";
import type { Schema } from "@sjsf/form";
import { getEntitySchema } from "./utils.js";
import Result from "true-myth/result";

export type Substep = FromSchema<AttestaConfigSchema["$defs"]["Substep"]>;

/** Listed substeps include stepId for composite key (stepId:substepId) */
export type SubstepWithStepId = Substep & { __stepId: string };

function parseKey(key: string): { stepId: string; substepId: string } {
	const idx = key.indexOf(":");
	if (idx === -1) {
		return { stepId: "", substepId: key };
	}
	return { stepId: key.slice(0, idx), substepId: key.slice(idx + 1) };
}

export class SubstepRepository implements Repository<SubstepWithStepId> {
	constructor(private readonly config: AttestaConfig) {}

	getKey(record: SubstepWithStepId): string {
		return `${record.__stepId}:${record.id}`;
	}

	getSchema(): Schema {
		return getEntitySchema("Substep");
	}

	list(): SubstepWithStepId[] {
		return this.config.workflow.steps.flatMap((step) =>
			step.substeps.map((sub) => ({ ...sub, __stepId: step.id }))
		);
	}

	getOne(key: string): Result<SubstepWithStepId, Error> {
		const { stepId, substepId } = parseKey(key);
		const step = this.config.workflow.steps.find((s) => s.id === stepId);
		if (!step) {
			return Result.err(new Error(`Substep not found: ${key}`));
		}
		const substep = step.substeps.find((s) => s.id === substepId);
		if (!substep) {
			return Result.err(new Error(`Substep not found: ${key}`));
		}
		return Result.ok({ ...substep, __stepId: step.id });
	}

	create(data: SubstepWithStepId): Result<SubstepWithStepId, Error> {
		const stepId = data.__stepId;
		const step = this.config.workflow.steps.find((s) => s.id === stepId);
		if (!step) {
			return Result.err(new Error(`Step not found: ${stepId}`));
		}
		if (step.substeps.some((s) => s.id === data.id)) {
			return Result.err(new Error(`Substep already exists: ${data.id}`));
		}
		const { __stepId: _, ...substep } = data;
		step.substeps = [...step.substeps, substep].sort((a, b) => a.order - b.order);
		return Result.ok(data);
	}

	update(key: string, data: SubstepWithStepId): Result<SubstepWithStepId, Error> {
		const { stepId, substepId } = parseKey(key);
		const step = this.config.workflow.steps.find((s) => s.id === stepId);
		if (!step) {
			return Result.err(new Error(`Substep not found: ${key}`));
		}
		const index = step.substeps.findIndex((s) => s.id === substepId);
		if (index === -1) {
			return Result.err(new Error(`Substep not found: ${key}`));
		}
		const { __stepId: _, ...substep } = data;
		step.substeps = step.substeps.map((s) => (s.id === substepId ? substep : s));
		return Result.ok(data);
	}

	delete(key: string): Result<void, Error> {
		const { stepId, substepId } = parseKey(key);
		const step = this.config.workflow.steps.find((s) => s.id === stepId);
		if (!step) {
			return Result.err(new Error(`Substep not found: ${key}`));
		}
		const index = step.substeps.findIndex((s) => s.id === substepId);
		if (index === -1) {
			return Result.err(new Error(`Substep not found: ${key}`));
		}
		step.substeps = step.substeps.filter((s) => s.id !== substepId);
		return Result.ok(undefined);
	}
}
