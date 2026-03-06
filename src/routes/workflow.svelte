<script lang="ts">
	import { CheckIcon, Pencil, TriangleAlert } from '@lucide/svelte';
	import { config, getConfigErrors } from '$core/state.svelte.js';
	import WorkflowTreeComponent from '$core/workflow/workflow-tree.svelte';
	import { WorkflowTree } from '$core/workflow/workflow-tree.svelte.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import Input from '$lib/components/ui/input/input.svelte';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import { Textarea } from '$lib/components/ui/textarea/index.js';

	import { setTopbar } from './_layout.svelte';

	//

	let workflowTree = new WorkflowTree({ steps: config.workflow.steps });

	setTopbar({
		title: 'Stream / Workflow',
		left: navbarLeft,
		right: navbarRight
	});

	const configErrors = $derived(getConfigErrors());

	const descriptionBinding = {
		get value() {
			return config.workflow.description ?? '';
		},
		set value(v: string) {
			config.workflow.description = v || undefined;
		}
	};
</script>

{#snippet navbarLeft()}
	<div class="flex max-w-md grow items-center gap-1">
		<Input
			bind:value={config.workflow.name}
			class="h-8 grow font-medium md:text-sm"
			placeholder="Workflow name"
		/>
		<Popover.Root>
			<Popover.Trigger>
				{#snippet child({ props })}
					<Button {...props} variant="ghost" size="sm" class="text-xs text-muted-foreground">
						<Pencil size={12} />
						<span>Edit description</span>
					</Button>
				{/snippet}
			</Popover.Trigger>
			<Popover.Content>
				<p class="mb-2 text-sm font-medium">Description</p>
				<Textarea
					bind:value={descriptionBinding.value}
					placeholder="Workflow description"
					class="w-full"
				/>
			</Popover.Content>
		</Popover.Root>
	</div>
{/snippet}

{#snippet navbarRight()}
	<Popover.Root>
		<Popover.Trigger>
			{#snippet child({ props })}
				<Button
					{...props}
					disabled={configErrors.length === 0}
					variant="outline"
					class={[
						configErrors.length > 0 &&
							'border-destructive text-destructive hover:bg-destructive/10 hover:text-destructive'
					]}
				>
					{#if configErrors.length > 0}
						<TriangleAlert size={14} />
						<span>{configErrors.length} errors</span>
					{:else}
						<CheckIcon size={14} />
						<span>Config is valid</span>
					{/if}
				</Button>
			{/snippet}
		</Popover.Trigger>
		<Popover.Content
			class={configErrors.length > 0
				? 'max-h-60 w-80 overflow-y-auto border-destructive text-destructive'
				: ''}
		>
			{#if configErrors.length > 0}
				<p class="mb-2 text-sm font-medium">Validation errors</p>
				<ul class="list-inside list-disc space-y-1 text-sm">
					{#each configErrors as err, i (i)}
						<li>{err}</li>
					{/each}
				</ul>
			{:else}
				<p class="text-sm text-muted-foreground">Config is valid.</p>
			{/if}
		</Popover.Content>
	</Popover.Root>
{/snippet}

<WorkflowTreeComponent bind:self={workflowTree} showIndices />
