<script lang="ts">
	import type { Structure } from '$core/tree/types.js';

	import { Crud, Tree } from '$core';
	import {
		StepRepository,
		SubstepRepository,
		type Step,
		type Substep
	} from '$core/repositories/index.js';
	import { config } from '$core/state.svelte.js';
	import { toast } from 'svelte-sonner';
	import { fade } from 'svelte/transition';

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
	const stepCrud = new Crud(stepRepo, {
		form: { hide: { id: true, order: true, substeps: true } }
	});

	const substepRepo = new SubstepRepository(config);
	const substepCrud = new Crud(substepRepo, {
		form: { hide: { id: true, order: true, inputType: true } }
	});

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
					substepCrud.openDelete({ ...substep, id: `${step.id}:${substep.id}` });
				}
			}
		},
		onAddBranch(path) {
			tree.expand(path);
		},
		onAddLeaf(path) {
			tree.expand(path);
		}
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
					substepCrud.openEdit({ ...substep, id: `${step.id}:${substep.id}` });
				}
			}
		} else if (sel.state === 'adding') {
			if (sel.type === 'branch') {
				const insertIndex =
					sel.path.length === 1 && sel.path[0] === -1
						? steps.length
						: sel.path.length > 0
							? sel.path[0] + 1
							: 0;
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
				const draft: Substep = {
					id: `${step.id}:${crypto.randomUUID()}`,
					title: 'New substep',
					order: step.substeps.length,
					role: '',
					inputKey: '',
					inputType: 'formata',
					schema: {}
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
		title: 'Stream / Workflow'
	});

	const formMode = $derived.by(() => {
		const sel = tree.selection;
		if (sel.state === 'idle') return null;
		if (sel.state === 'selected') return sel.path.length === 1 ? 'step' : 'substep';
		return sel.type === 'branch' ? 'step' : 'substep';
	});
</script>

<div class="flex grow justify-stretch">
	<div class="w-[400px] shrink-0 overflow-auto border-r p-2">
		<p
			class="flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium text-sidebar-foreground/70 ring-sidebar-ring outline-hidden transition-[margin,opacity] duration-200 ease-linear group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0 focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0"
		>
			Steps
		</p>
		<tree.Tree self={tree} />
	</div>

	<div class="min-w-0 grow p-4">
		{#key tree.selection}
			{#if formMode === 'step'}
				<div transition:fade>
					<stepCrud.Forms
						self={stepCrud}
						formTitle="step"
						onConfirmDelete={() => tree.clearSelection()}
						onCancel={() => {
							tree.clearSelection();
						}}
						hideSubmitButton
					/>
				</div>
			{:else if formMode === 'substep'}
				<div transition:fade>
					<substepCrud.Forms
						self={substepCrud}
						formTitle="substep"
						onConfirmDelete={() => tree.clearSelection()}
						onCancel={() => {
							tree.clearSelection();
						}}
						hideSubmitButton
					/>
				</div>
			{:else}
				<div transition:fade>
					<p class="flex items-center justify-center text-sm text-muted-foreground">
						Select a step or substep in the tree, or use the add buttons to create one.
					</p>
				</div>
			{/if}
		{/key}
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
