import type { ErrorObject } from 'ajv';
import type { ZodError } from 'zod';

//

export type ValidationIssue = {
	path: string;
	message: string;
};

export class ValidationError extends Error {
	readonly issues: readonly ValidationIssue[];

	constructor(message: string, issues: readonly ValidationIssue[], options?: ErrorOptions) {
		super(message, options);
		this.name = 'ValidationError';
		this.issues = issues;
	}

	static fromIssues(issues: readonly ValidationIssue[], message?: string): ValidationError {
		return new ValidationError(message ?? defaultSummaryMessage(issues), issues);
	}

	static fromZod(error: ZodError): ValidationError {
		const issues: ValidationIssue[] = error.issues.map((i) => ({
			path: i.path.join('/'),
			message: i.message
		}));
		return ValidationError.fromIssues(issues);
	}

	static fromAjv(errors: readonly ErrorObject[]): ValidationError {
		const issues: ValidationIssue[] = errors.map((e) => ({
			path: e.instancePath ?? '',
			message: e.message ?? ''
		}));
		return ValidationError.fromIssues(issues);
	}
}

function defaultSummaryMessage(issues: readonly ValidationIssue[]): string {
	let message = 'Validation failed';
	for (const issue of issues) {
		message += `\n- ${issue.path}: ${issue.message}`;
	}
	return message;
}
