<script lang="ts">
	import type { Step } from '$core/repositories/step.repository.js';
	import type { Substep } from '$core/repositories/substep.repository.svelte.js';
	import type { WorkflowTree } from '$core/workflow/workflow-tree.svelte.js';

	import {
		ArrowDown,
		ArrowUp,
		ChevronDown,
		ChevronRight,
		FolderPlusIcon,
		Plus,
		Trash2
	} from '@lucide/svelte';
	import TreeButton from '$core/tree/tree-button.svelte';
	import StepForm from '$core/workflow/step-form.svelte';
	import SubstepForm from '$core/workflow/substep-form.svelte';
	import { flip } from 'svelte/animate';
	import { fade } from 'svelte/transition';

	//

	interface Props {
		self: WorkflowTree;
		showIndices?: boolean;
	}

	let { self, showIndices = false }: Props = $props();

	function stepLabel(step: Step): string {
		return step.title?.trim() || '(Untitled step)';
	}

	function substepLabel(substep: Substep): string {
		return substep.title?.trim() || '(Untitled substep)';
	}

	function isStepSelected(step: Step): boolean {
		return self.selection.type === 'step' && self.selection.step === step;
	}

	function isSubstepSelected(substep: Substep): boolean {
		return self.selection.type === 'substep' && self.selection.substep === substep;
	}

	function toggleExpanded(step: Step) {
		if (self.expanded.has(step.id)) {
			self.expanded.delete(step.id);
		} else {
			self.expanded.add(step.id);
			self.selectStep(step);
		}
	}
</script>

<div class="flex grow justify-stretch">
	<div class="w-[400px] shrink-0 overflow-auto border-r p-2">
		<p
			class="flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium text-sidebar-foreground/70 ring-sidebar-ring outline-hidden transition-[margin,opacity] duration-200 ease-linear group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0 focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0"
		>
			Steps
		</p>
		<div class="flex grow flex-col gap-1 text-sm">
			{#each self.steps as step, stepIndex (step.id)}
				<div class="flex flex-col gap-1" animate:flip={{ duration: 500 }}>
					<div
						role="button"
						tabindex="0"
						class={[
							'flex min-h-8 items-center gap-1 rounded-sm p-1 transition-colors',
							'ring-primary',
							!isStepSelected(step) && 'hover:ring-1',
							isStepSelected(step) && 'ring-2',
							'group hover:cursor-pointer'
						]}
						style="padding-left: 0.25rem"
						onclick={() => self.selectStep(step)}
						onkeydown={(e) => e.key === 'Enter' && self.selectStep(step)}
					>
						<TreeButton
							onclick={() => toggleExpanded(step)}
							icon={self.expanded.has(step.id) ? ChevronDown : ChevronRight}
							aria-label={self.expanded.has(step.id) ? 'Collapse' : 'Expand'}
						/>
						<span class="flex shrink-0 items-center gap-1.5">
							{#if showIndices}
								<span class="shrink-0 text-muted-foreground tabular-nums">{stepIndex + 1}</span>
							{/if}
							<span>{stepLabel(step)}</span>
						</span>
						<span class="min-w-2 flex-1"></span>
						<div class="flex shrink-0 items-center gap-0.5">
							{#if self.canMoveStepUp(step)}
								<TreeButton
									onclick={() => self.moveStepUp(step)}
									icon={ArrowUp}
									aria-label="Move up"
									class="invisible group-hover:visible"
								/>
							{/if}
							{#if self.canMoveStepDown(step)}
								<TreeButton
									onclick={() => self.moveStepDown(step)}
									icon={ArrowDown}
									aria-label="Move down"
									class="invisible group-hover:visible"
								/>
							{/if}
							<TreeButton
								onclick={() => self.removeStep(step)}
								icon={Trash2}
								aria-label="Remove step"
								class="invisible group-hover:visible"
							/>
							<TreeButton
								onclick={() => self.addSubstep(step)}
								icon={Plus}
								aria-label="Add substep"
								class="font-semibold text-primary hover:bg-primary/10"
								iconClass="stroke-3"
							/>
						</div>
					</div>
					{#if self.expanded.has(step.id)}
						{#each step.substeps as substep, subIndex (substep.id)}
							<div
								role="button"
								tabindex="0"
								class={[
									'flex min-h-8 items-center gap-1 rounded-sm p-1 transition-colors',
									'ring-primary',
									!isSubstepSelected(substep) && 'hover:ring-1',
									isSubstepSelected(substep) && 'ring-2',
									'group hover:cursor-pointer'
								]}
								style="padding-left: 1.5rem"
								animate:flip={{ duration: 500 }}
								onclick={() => self.selectSubstep(substep)}
								onkeydown={(e) => e.key === 'Enter' && self.selectSubstep(substep)}
							>
								<span class="w-5 shrink-0" aria-hidden="true"></span>
								<span class="flex shrink-0 items-center gap-1.5">
									{#if showIndices}
										<span class="shrink-0 text-muted-foreground tabular-nums"
											>{stepIndex + 1}.{subIndex + 1}</span
										>
									{/if}
									<span>{substepLabel(substep)}</span>
								</span>
								<span class="min-w-2 flex-1"></span>
								<div class="flex shrink-0 items-center gap-0.5">
									{#if self.canMoveSubstepUp(step, substep)}
										<TreeButton
											onclick={() => self.moveSubstepUp(step, substep)}
											icon={ArrowUp}
											aria-label="Move up"
											class="invisible group-hover:visible"
										/>
									{/if}
									{#if self.canMoveSubstepDown(step, substep)}
										<TreeButton
											onclick={() => self.moveSubstepDown(step, substep)}
											icon={ArrowDown}
											aria-label="Move down"
											class="invisible group-hover:visible"
										/>
									{/if}
									<TreeButton
										onclick={() => self.removeSubstep(step, substep)}
										icon={Trash2}
										aria-label="Remove substep"
										class="invisible group-hover:visible"
									/>
								</div>
							</div>
						{/each}
					{/if}
				</div>
			{/each}

			<button
				tabindex="0"
				class={[
					'flex min-h-8 items-center gap-1 rounded-sm p-1 transition-colors',
					'font-semibold text-primary hover:bg-primary/10'
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
			{#if self.selection.type === 'idle'}
				<div transition:fade>
					<p class="flex items-center justify-center text-sm text-muted-foreground">
						Select a step or substep in the tree, or use the add buttons to create one.
					</p>
				</div>
			{:else if self.selection.type === 'step'}
				<div transition:fade>
					<StepForm step={self.selection.step} />
				</div>
			{:else if self.selection.type === 'substep'}
				<div transition:fade>
					<SubstepForm substep={self.selection.substep} />
				</div>
			{/if}
		{/key}
	</div>
</div>
