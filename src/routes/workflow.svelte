<script lang="ts">
	import { SaveIcon } from '@lucide/svelte';
	import { Crud, Tree } from '$core';
	import type { Structure } from '$core/tree/types.js';
	import {
		StepRepository,
		SubstepRepository,
		type Step,
		type SubstepWithStepId
	} from '$core/repositories/index.js';
	import { config } from '$core/state.svelte.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { toast } from 'svelte-sonner';

	import { setTopbar } from './_layout.svelte';

	//

	function configToTree(c: typeof config): Structure {
		return c.workflow.steps.map((step) => ({
			type: 'branch' as const,
			label: step.title,
			key: step.id,
			children: step.substeps.map((sub) => ({
				type: 'leaf' as const,
				label: sub.title,
				key: `${step.id}-${sub.id}`
			}))
		}));
	}

	const stepRepo = new StepRepository(config);
	const substepRepo = new SubstepRepository(config);
	const stepCrud = new Crud<Step>(stepRepo);
	const substepCrud = new Crud<SubstepWithStepId>(substepRepo);

	const tree = new Tree(() => configToTree(config), {
		maxBranchDepth: 1,
		addTypesByDepth: { 0: ['branch'], 1: ['leaf'] },
		onMoveUp(path) {
			if (path.length === 1) {
				stepRepo.moveUp(path[0]);
			} else if (path.length === 2) {
				const step = config.workflow.steps[path[0]];
				if (step) substepRepo.moveUp(step.id, path[1]);
			}
		},
		onMoveDown(path) {
			if (path.length === 1) {
				stepRepo.moveDown(path[0]);
			} else if (path.length === 2) {
				const step = config.workflow.steps[path[0]];
				if (step) substepRepo.moveDown(step.id, path[1]);
			}
		},
		onDelete(path) {
			if (path.length === 1) {
				const step = config.workflow.steps[path[0]];
				if (step) stepCrud.openDelete(step);
			} else if (path.length === 2) {
				const step = config.workflow.steps[path[0]];
				const substep = step?.substeps[path[1]];
				if (step && substep) {
					substepCrud.openDelete({ ...substep, __stepId: step.id });
				}
			}
		},
		onAddBranch() {},
		onAddLeaf() {}
	});

	$effect(() => {
		const sel = tree.selection;
		const steps = config.workflow.steps;

		if (sel.state === 'selected') {
			if (sel.path.length === 1) {
				const step = steps[sel.path[0]];
				if (step) stepCrud.openEdit(step);
			} else if (sel.path.length === 2) {
				const step = steps[sel.path[0]];
				const substep = step?.substeps[sel.path[1]];
				if (step && substep) {
					substepCrud.openEdit({ ...substep, __stepId: step.id });
				}
			}
		} else if (sel.state === 'adding') {
			if (sel.type === 'branch') {
				const insertIndex = sel.path.length > 0 ? sel.path[0] + 1 : 0;
				const draft: Step = {
					id: crypto.randomUUID(),
					title: 'New step',
					order: insertIndex,
					substeps: []
				};
				stepCrud.openCreateWithCallback(draft, (value) => {
					const result = stepRepo.createAt(value, insertIndex);
					if (result.isOk) {
						toast.success('Record created');
						stepCrud.isFormOpen = false;
						tree.clearSelection();
					} else {
						toast.error(result.error.message);
					}
				});
			} else {
				const step = steps[sel.path[0]];
				if (!step) return;
				const draft: SubstepWithStepId = {
					__stepId: step.id,
					id: crypto.randomUUID(),
					title: 'New substep',
					order: step.substeps.length,
					role: '',
					inputKey: '',
					inputType: 'string'
				};
				substepCrud.openCreateWithCallback(draft, (value) => {
					const result = substepRepo.create(value);
					if (result.isOk) {
						toast.success('Record created');
						substepCrud.isFormOpen = false;
						tree.clearSelection();
					} else {
						toast.error(result.error.message);
					}
				});
			}
		}
	});

	setTopbar({
		title: 'Workflow',
		right: topbarRight
	});

	const formMode = $derived.by(() => {
		const sel = tree.selection;
		if (sel.state === 'idle') return null;
		if (sel.state === 'selected') return sel.path.length === 1 ? 'step' : 'substep';
		return sel.type === 'branch' ? 'step' : 'substep';
	});
</script>

{#snippet topbarRight()}
	<Button
		onclick={() => {
			if (stepCrud.isFormOpen) stepCrud.submitForm();
			else if (substepCrud.isFormOpen) substepCrud.submitForm();
		}}
	>
		<SaveIcon />
		Save
	</Button>
{/snippet}

<div class="grid grid-cols-[280px_1fr] gap-6">
	<div class="min-h-0 overflow-auto rounded-md border">
		<tree.Tree self={tree} />
	</div>
	<div class="min-w-0">
		{#if formMode === 'step'}
			<stepCrud.Forms
				self={stepCrud}
				hideSubmitButton
				formTitle="step"
				onConfirmDelete={() => tree.clearSelection()}
			/>
		{:else if formMode === 'substep'}
			<substepCrud.Forms
				self={substepCrud}
				hideSubmitButton
				formTitle="substep"
				onConfirmDelete={() => tree.clearSelection()}
			/>
		{:else}
			<p class="flex items-center justify-center text-muted-foreground text-sm">
				Select a step or substep in the tree, or use the add buttons to create one.
			</p>
		{/if}
	</div>
</div>

<style lang="postcss">
	@reference "../app.css";

	:global([data-layout='array-item']) {
		@apply relative rounded-md border bg-gray-100 p-4;
	}

	:global([data-layout='array-item'] [data-layout='array-item']) {
		@apply bg-gray-200;
	}

	:global([data-layout='array-item-controls']) {
		@apply absolute top-2 right-2;
	}

	:global([data-layout='field']) {
		@apply gap-1;
	}

	:global([data-layout='object-properties']) {
		@apply gap-5;
	}

	:global([data-slot='select-trigger']) {
		@apply bg-background;
	}
</style>
