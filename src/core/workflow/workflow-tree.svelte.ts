import type { Step } from '$core/repositories/step.repository.js';
import type { Substep } from '$core/repositories/substep.repository.svelte.js';

import { workflowEditorState } from '$core/workflow/state.svelte.js';
import { SvelteSet } from 'svelte/reactivity';

import type { WorkflowTreeSelection } from './workflow-tree.types.js';

//

function renumberSubsteps(step: Step): Step {
	return {
		...step,
		substeps: step.substeps.map((sub, j) => ({
			...sub,
			order: j + 1,
			id: `${step.id}.${j + 1}`
		}))
	};
}

function renumberSteps(steps: Step[]): void {
	for (let i = 0; i < steps.length; i++) {
		const step = steps[i];
		if (!step) continue;
		const renumbered: Step = {
			...step,
			order: i + 1,
			id: String(i + 1)
		};
		steps[i] = renumberSubsteps(renumbered);
	}
}

const DEFAULT_SUBSTEP_SCHEMA = {
	type: 'object' as const,
	properties: { placeholder: { type: 'string' as const, title: 'Placeholder' } }
};

export class WorkflowTree {
	constructor(private opts: { steps: Step[]; defaultOrganization?: string }) {}

	selection = $state<WorkflowTreeSelection>({ type: 'idle' });
	expanded = new SvelteSet<string>();

	get steps(): Step[] {
		return this.opts.steps;
	}

	addStep(): void {
		const steps = this.steps;
		const newStep: Step = {
			id: String(steps.length + 1),
			title: '',
			order: steps.length + 1,
			organization: this.opts.defaultOrganization ?? '',
			substeps: []
		};
		steps.push(newStep);
		renumberSteps(steps);
		const added = steps[steps.length - 1];
		if (added) {
			this.expanded.add(added.id);
			this.selectStep(added);
		}
	}

	addSubstep(step: Step): void {
		const newSubstep: Substep = {
			id: '',
			title: '',
			order: step.substeps.length + 1,
			roles: [],
			inputKey: '',
			inputType: 'formata',
			schema: DEFAULT_SUBSTEP_SCHEMA,
			uiSchema: {}
		};
		step.substeps = [...step.substeps, newSubstep];
		const renumbered = renumberSubsteps(step);
		const stepIndex = this.steps.indexOf(step);
		if (stepIndex !== -1) {
			this.steps[stepIndex] = renumbered;
		}
		const added = renumbered.substeps[renumbered.substeps.length - 1];
		if (added) {
			this.expanded.add(renumbered.id);
			this.selectSubstep(added);
		}
	}

	removeStep(step: Step): void {
		const steps = this.steps;
		const index = steps.indexOf(step);
		if (index === -1) return;
		const sel = this.selection;
		const wasSelectedStep = sel.type === 'step' && sel.step === step;
		const wasSelectedSubstep =
			sel.type === 'substep' && step.substeps.some((s) => s === sel.substep);
		steps.splice(index, 1);
		renumberSteps(steps);
		this.expanded.delete(step.id);
		if (wasSelectedStep || wasSelectedSubstep) {
			this.clearSelection();
		}
	}

	removeSubstep(step: Step, substep: Substep): void {
		const index = step.substeps.indexOf(substep);
		if (index === -1) return;
		const wasSelected = this.selection.type === 'substep' && this.selection.substep === substep;
		step.substeps = step.substeps.filter((s) => s !== substep);
		const renumbered = renumberSubsteps(step);
		const stepIndex = this.steps.indexOf(step);
		if (stepIndex !== -1) {
			this.steps[stepIndex] = renumbered;
		}
		if (wasSelected) {
			this.clearSelection();
		}
	}

	moveStepUp(step: Step): void {
		const steps = this.steps;
		const i = steps.indexOf(step);
		if (i <= 0) return;
		const prevId = steps[i - 1]?.id;
		const stepId = step.id;
		[steps[i - 1], steps[i]] = [steps[i]!, steps[i - 1]!];
		renumberSteps(steps);
		remapExpanded(this.expanded, stepId, prevId ?? '', i - 1, i);
		const sel = this.selection;
		if (sel.type === 'step' && sel.step === step) {
			this.selection = { type: 'step', step: steps[i - 1]! };
		} else if (sel.type === 'substep') {
			this.selection = { type: 'substep', substep: sel.substep };
		}
	}

	moveStepDown(step: Step): void {
		const steps = this.steps;
		const i = steps.indexOf(step);
		if (i === -1 || i >= steps.length - 1) return;
		const nextId = steps[i + 1]?.id;
		const stepId = step.id;
		[steps[i], steps[i + 1]] = [steps[i + 1]!, steps[i]!];
		renumberSteps(steps);
		remapExpanded(this.expanded, stepId, nextId ?? '', i, i + 1);
		const sel = this.selection;
		if (sel.type === 'step' && sel.step === step) {
			this.selection = { type: 'step', step: steps[i + 1]! };
		} else if (sel.type === 'substep') {
			this.selection = { type: 'substep', substep: sel.substep };
		}
	}

	moveSubstepUp(step: Step, substep: Substep): void {
		const subs = step.substeps;
		const i = subs.indexOf(substep);
		if (i <= 0) return;
		[subs[i - 1], subs[i]] = [subs[i]!, subs[i - 1]!];
		const renumbered = renumberSubsteps(step);
		const stepIndex = this.steps.indexOf(step);
		if (stepIndex !== -1) {
			this.steps[stepIndex] = renumbered;
		}
		if (this.selection.type === 'substep' && this.selection.substep === substep) {
			this.selection = { type: 'substep', substep: renumbered.substeps[i - 1]! };
		}
	}

	moveSubstepDown(step: Step, substep: Substep): void {
		const subs = step.substeps;
		const i = subs.indexOf(substep);
		if (i === -1 || i >= subs.length - 1) return;
		[subs[i], subs[i + 1]] = [subs[i + 1]!, subs[i]!];
		const renumbered = renumberSubsteps(step);
		const stepIndex = this.steps.indexOf(step);
		if (stepIndex !== -1) {
			this.steps[stepIndex] = renumbered;
		}
		if (this.selection.type === 'substep' && this.selection.substep === substep) {
			this.selection = { type: 'substep', substep: renumbered.substeps[i + 1]! };
		}
	}

	selectStep(step: Step): void {
		this.selection = { type: 'step', step };
		this.expanded.add(step.id);
		workflowEditorState.currentStep = step;
	}

	selectSubstep(substep: Substep): void {
		this.selection = { type: 'substep', substep };
		const step = this.steps.find((s) => s.substeps.includes(substep));
		if (step) {
			this.expanded.add(step.id);
			workflowEditorState.currentStep = step;
		}
	}

	clearSelection(): void {
		this.selection = { type: 'idle' };
		workflowEditorState.currentStep = undefined;
	}

	canMoveStepUp(step: Step): boolean {
		return this.steps.indexOf(step) > 0;
	}

	canMoveStepDown(step: Step): boolean {
		const i = this.steps.indexOf(step);
		return i !== -1 && i < this.steps.length - 1;
	}

	canMoveSubstepUp(step: Step, substep: Substep): boolean {
		return step.substeps.indexOf(substep) > 0;
	}

	canMoveSubstepDown(step: Step, substep: Substep): boolean {
		const i = step.substeps.indexOf(substep);
		return i !== -1 && i < step.substeps.length - 1;
	}

	getStepForSubstep(substep: Substep): Step | undefined {
		return this.steps.find((s) => s.substeps.includes(substep));
	}
}

function remapExpanded(
	expanded: SvelteSet<string>,
	oldIdA: string,
	oldIdB: string,
	indexA: number,
	indexB: number
): void {
	const hadA = expanded.has(oldIdA);
	const hadB = expanded.has(oldIdB);
	expanded.delete(oldIdA);
	expanded.delete(oldIdB);
	const newIds = [String(indexA + 1), String(indexB + 1)];
	if (hadA) expanded.add(newIds[0]!);
	if (hadB) expanded.add(newIds[1]!);
}
