import type { Repository } from "./index.js";
import type { AttestaConfig } from "$core/schema.js";
import type { Schema } from "@sjsf/form";
import { getEntitySchema } from "./utils.js";
import Result from "true-myth/result";

const CONFIG_KEY = "config";

export class ConfigRepository implements Repository<AttestaConfig> {
	constructor(private readonly config: AttestaConfig) {}

	getSchema(): Schema {
		return getEntitySchema("Config");
	}

	getKey(_record: AttestaConfig): string {
		return CONFIG_KEY;
	}

	list(): AttestaConfig[] {
		return [this.config];
	}

	getOne(key: string): Result<AttestaConfig, Error> {
		if (key !== CONFIG_KEY) {
			return Result.err(new Error(`Config not found: ${key}`));
		}
		return Result.ok(this.config);
	}

	create(data: AttestaConfig): Result<AttestaConfig, Error> {
		this.config.workflow = data.workflow;
		this.config.departments = data.departments;
		this.config.users = data.users;
		this.config.dpp = data.dpp;
		return Result.ok(this.config);
	}

	update(key: string, data: AttestaConfig): Result<AttestaConfig, Error> {
		if (key !== CONFIG_KEY) {
			return Result.err(new Error(`Config not found: ${key}`));
		}
		this.config.workflow = data.workflow;
		this.config.departments = data.departments;
		this.config.users = data.users;
		this.config.dpp = data.dpp;
		return Result.ok(this.config);
	}

	delete(_key: string): Result<void, Error> {
		return Result.err(new Error("Cannot delete config"));
	}
}
