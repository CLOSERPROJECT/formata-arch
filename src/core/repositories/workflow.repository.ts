import type { Repository } from "./index.js";
import type { AttestaConfig, AttestaConfigSchema } from "$core/schema.js";
import type { FromSchema } from "json-schema-to-ts";
import type { Schema } from "@sjsf/form";
import { getEntitySchema } from "./utils.js";
import Result from "true-myth/result";

const WORKFLOW_KEY = "workflow";

export type Workflow = FromSchema<AttestaConfigSchema["$defs"]["Workflow"]>;

export class WorkflowRepository implements Repository<Workflow> {
	constructor(private readonly config: AttestaConfig) {}

	getSchema(): Schema {
		return getEntitySchema("Workflow");
	}

	getKey(_record: Workflow): string {
		return WORKFLOW_KEY;
	}

	list(): Workflow[] {
		return [this.config.workflow];
	}

	getOne(key: string): Result<Workflow, Error> {
		if (key !== WORKFLOW_KEY) {
			return Result.err(new Error(`Workflow not found: ${key}`));
		}
		return Result.ok(this.config.workflow);
	}

	create(data: Workflow): Result<Workflow, Error> {
		this.config.workflow = data;
		return Result.ok(this.config.workflow);
	}

	update(key: string, data: Workflow): Result<Workflow, Error> {
		if (key !== WORKFLOW_KEY) {
			return Result.err(new Error(`Workflow not found: ${key}`));
		}
		this.config.workflow = data;
		return Result.ok(this.config.workflow);
	}

	delete(_key: string): Result<void, Error> {
		return Result.err(new Error("Cannot delete workflow"));
	}
}
