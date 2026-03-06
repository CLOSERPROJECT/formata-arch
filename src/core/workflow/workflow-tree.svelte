<script lang="ts">
	import type { Step } from '$core/repositories/step.repository.js';
	import type { Substep } from '$core/repositories/substep.repository.svelte.js';
	import type { WorkflowTree } from '$core/workflow/workflow-tree.svelte.js';

	import { FolderPlusIcon } from '@lucide/svelte';
	import StepForm from '$core/workflow/step-form.svelte';
	import SubstepForm from '$core/workflow/substep-form.svelte';
	import { flip } from 'svelte/animate';
	import { fly } from 'svelte/transition';

	import WorkflowTreeItem from './workflow-tree-item.svelte';

	//

	interface Props {
		self: WorkflowTree;
		showIndices?: boolean;
	}

	let { self = $bindable(), showIndices = false }: Props = $props();

	//

	function stepLabel(step: Step): string {
		return step.title?.trim() || '(Untitled step)';
	}

	function substepLabel(substep: Substep): string {
		return substep.title?.trim() || '(Untitled substep)';
	}
</script>

<div class="flex grow justify-stretch">
	<div class="w-[400px] shrink-0 overflow-auto border-r p-2">
		<p
			class="flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium text-sidebar-foreground/70 ring-sidebar-ring outline-hidden transition-[margin,opacity] duration-200 ease-linear group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0 focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0"
		>
			Steps
		</p>

		<div class="">
			{#each self.steps as step (self.getKey(step))}
				<div class="space-y-1" animate:flip={{ duration: 500 }}>
					<WorkflowTreeItem
						isSelected={self.isStepSelected(step)}
						onSelect={() => self.selectStep(step)}
						expandable
						expanded={self.expanded.has(self.getKey(step))}
						toggleExpanded={() => self.toggleStepExpanded(step)}
						label={stepLabel(step)}
						index={step.id}
						canMoveUp={self.canMoveStepUp(step)}
						canMoveDown={self.canMoveStepDown(step)}
						onMoveUp={() => self.moveStepUp(step)}
						onMoveDown={() => self.moveStepDown(step)}
						onRemove={() => self.removeStep(step)}
						onAdd={() => self.addSubstep(step)}
						showIndex={showIndices}
					/>
					{#if self.expanded.has(self.getKey(step))}
						{#each step.substeps as substep (self.getKey(substep))}
							<div animate:flip={{ duration: 250 }}>
								<WorkflowTreeItem
									isSelected={self.isSubstepSelected(substep)}
									onSelect={() => self.selectSubstep(substep)}
									label={substepLabel(substep)}
									index={substep.id}
									canMoveUp={self.canMoveSubstepUp(step, substep)}
									canMoveDown={self.canMoveSubstepDown(step, substep)}
									onMoveUp={() => self.moveSubstepUp(step, substep)}
									onMoveDown={() => self.moveSubstepDown(step, substep)}
									onRemove={() => self.removeSubstep(step, substep)}
									showIndex={showIndices}
									indent={1}
								/>
							</div>
						{/each}
					{/if}
				</div>
			{/each}

			<button
				tabindex="0"
				class={[
					'flex min-h-8 items-center gap-1 rounded-sm p-1 transition-colors',
					'font-semibold text-primary hover:bg-primary/10',
					'w-full text-sm'
				]}
				onclick={() => self.addStep()}
			>
				<div class="flex size-[24px] items-center justify-center">
					<FolderPlusIcon class="size-3.5" />
				</div>
				Add step
			</button>
		</div>
	</div>

	<div class="min-w-0 grow p-4">
		{#key self.selection}
			<div in:fly={{ duration: 700, y: 20 }}>
				{#if self.selection.type === 'idle'}
					<p class="flex items-center justify-center text-sm text-muted-foreground">
						Select a step or substep in the tree, or use the add buttons to create one.
					</p>
				{:else if self.selection.type === 'step'}
					<StepForm bind:step={self.selection.step} />
				{:else if self.selection.type === 'substep'}
					<SubstepForm bind:substep={self.selection.substep} />
				{/if}
			</div>
		{/key}
	</div>
</div>
