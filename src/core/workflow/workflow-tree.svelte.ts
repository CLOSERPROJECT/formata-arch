import type { Step } from '$core/repositories/step.repository.js';
import type { Substep } from '$core/repositories/substep.repository.svelte.js';

import { workflowEditorState } from '$core/workflow/state.svelte.js';
import { SvelteSet } from 'svelte/reactivity';

import type { WorkflowTreeSelection } from './workflow-tree.types.js';

//

const DEFAULT_SUBSTEP_SCHEMA = {
	type: 'object' as const,
	properties: { placeholder: { type: 'string' as const, title: 'Placeholder' } }
};

export class WorkflowTree {
	constructor(private opts: { steps: Step[] }) {}

	selection = $state<WorkflowTreeSelection>({ type: 'idle' });
	expanded = new SvelteSet<string>();

	private stableKeys = new WeakMap<Step | Substep, string>();

	getKey(item: Step | Substep): string {
		let key = this.stableKeys.get(item);
		if (!key) {
			key = crypto.randomUUID();
			this.stableKeys.set(item, key);
		}
		return key;
	}

	get steps(): Step[] {
		return this.opts.steps;
	}

	addStep(): void {
		const steps = this.steps;
		const newStep: Step = {
			id: String(steps.length + 1),
			title: '',
			order: steps.length + 1,
			organization: '',
			substeps: []
		};
		steps.push(newStep);
		this.selectStep(newStep);
	}

	addSubstep(step: Step): void {
		const position = step.substeps.length + 1;
		const newSubstep: Substep = {
			id: `${step.id}.${position}`,
			title: '',
			order: position,
			roles: [],
			inputKey: '',
			inputType: 'formata',
			schema: DEFAULT_SUBSTEP_SCHEMA,
			uiSchema: {}
		};
		step.substeps = [...step.substeps, newSubstep];
		this.selectSubstep(newSubstep);
	}

	removeStep(step: Step): void {
		const steps = this.steps;
		const index = steps.findIndex((s) => s.id === step.id);
		if (index === -1) return;
		const sel = this.selection;
		const wasSelectedStep = sel.type === 'step' && sel.step.id === step.id;
		const wasSelectedSubstep =
			sel.type === 'substep' && step.substeps.some((s) => s.id === sel.substep.id);
		steps.splice(index, 1);
		renumberSteps(steps);
		this.expanded.delete(this.getKey(step));
		if (wasSelectedStep || wasSelectedSubstep) {
			this.clearSelection();
		}
	}

	removeSubstep(step: Step, substep: Substep): void {
		const index = step.substeps.findIndex((s) => s.id === substep.id);
		if (index === -1) return;
		const wasSelected =
			this.selection.type === 'substep' && this.selection.substep.id === substep.id;
		step.substeps = step.substeps.filter((s) => s.id !== substep.id);
		renumberSubsteps(step);
		if (wasSelected) {
			this.clearSelection();
		}
	}

	moveStepUp(step: Step): void {
		const steps = this.steps;
		const i = steps.findIndex((s) => s.id === step.id);
		if (i <= 0) return;
		[steps[i - 1], steps[i]] = [steps[i]!, steps[i - 1]!];
		renumberSteps(steps);
		const sel = this.selection;
		if (sel.type === 'step' && sel.step.id === step.id) {
			this.selection = { type: 'step', step: steps[i - 1]! };
		} else if (sel.type === 'substep') {
			this.selection = { type: 'substep', substep: sel.substep };
		}
	}

	moveStepDown(step: Step): void {
		const steps = this.steps;
		const i = steps.findIndex((s) => s.id === step.id);
		if (i === -1 || i >= steps.length - 1) return;
		[steps[i], steps[i + 1]] = [steps[i + 1]!, steps[i]!];
		renumberSteps(steps);
		const sel = this.selection;
		if (sel.type === 'step' && sel.step.id === step.id) {
			this.selection = { type: 'step', step: steps[i + 1]! };
		} else if (sel.type === 'substep') {
			this.selection = { type: 'substep', substep: sel.substep };
		}
	}

	moveSubstepUp(step: Step, substep: Substep): void {
		const subs = step.substeps;
		const i = subs.findIndex((s) => s.id === substep.id);
		if (i <= 0) return;
		[subs[i - 1], subs[i]] = [subs[i]!, subs[i - 1]!];
		const renumbered = renumberSubsteps(step);
		if (this.selection.type === 'substep' && this.selection.substep.id === substep.id) {
			this.selection = { type: 'substep', substep: renumbered.substeps[i - 1]! };
		}
	}

	moveSubstepDown(step: Step, substep: Substep): void {
		const subs = step.substeps;
		const i = subs.findIndex((s) => s.id === substep.id);
		if (i === -1 || i >= subs.length - 1) return;
		[subs[i], subs[i + 1]] = [subs[i + 1]!, subs[i]!];
		const renumbered = renumberSubsteps(step);
		if (this.selection.type === 'substep' && this.selection.substep.id === substep.id) {
			this.selection = { type: 'substep', substep: renumbered.substeps[i + 1]! };
		}
	}

	selectStep(step: Step): void {
		this.selection = { type: 'step', step };
		this.expanded.add(this.getKey(step));
		workflowEditorState.currentStep = step;
	}

	selectSubstep(substep: Substep): void {
		this.selection = { type: 'substep', substep };
		const step = this.steps.find((s) => s.substeps.some((sub) => sub.id === substep.id));
		if (step) {
			this.expanded.add(this.getKey(step));
			workflowEditorState.currentStep = step;
		}
	}

	clearSelection(): void {
		this.selection = { type: 'idle' };
		workflowEditorState.currentStep = undefined;
	}

	canMoveStepUp(step: Step): boolean {
		const i = this.steps.findIndex((s) => s.id === step.id);
		return i > 0;
	}

	canMoveStepDown(step: Step): boolean {
		const i = this.steps.findIndex((s) => s.id === step.id);
		return i !== -1 && i < this.steps.length - 1;
	}

	canMoveSubstepUp(step: Step, substep: Substep): boolean {
		const i = step.substeps.findIndex((s) => s.id === substep.id);
		return i > 0;
	}

	canMoveSubstepDown(step: Step, substep: Substep): boolean {
		const i = step.substeps.findIndex((s) => s.id === substep.id);
		return i !== -1 && i < step.substeps.length - 1;
	}

	getStepForSubstep(substep: Substep): Step | undefined {
		return this.steps.find((s) => s.substeps.some((sub) => sub.id === substep.id));
	}

	//

	isStepSelected(step: Step): boolean {
		return this.selection.type === 'step' && this.selection.step.id === step.id;
	}

	isSubstepSelected(substep: Substep): boolean {
		return this.selection.type === 'substep' && this.selection.substep.id === substep.id;
	}

	toggleStepExpanded(step: Step) {
		const key = this.getKey(step);
		if (this.expanded.has(key)) {
			this.expanded.delete(key);
		} else {
			this.selectStep(step);
		}
	}
}

function renumberSubsteps(step: Step): Step {
	for (let j = 0; j < step.substeps.length; j++) {
		const sub = step.substeps[j];
		sub.order = j + 1;
		sub.id = `${step.id}.${j + 1}`;
	}
	return step;
}

function renumberSteps(steps: Step[]): void {
	for (let i = 0; i < steps.length; i++) {
		const step = steps[i];
		if (!step) continue;
		step.order = i + 1;
		step.id = String(i + 1);
		renumberSubsteps(step);
	}
}
