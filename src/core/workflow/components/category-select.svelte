<script lang="ts">
	import { XIcon } from '@lucide/svelte';
	import { app } from '$core/app/index.js';
	import { appData } from '$core/app/app.svelte.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Select from '$lib/components/ui/select/index.js';

	import {
		clearWorkflowCategorySlugs,
		filteredSubCategories,
		setWorkflowCategorySlug,
		setWorkflowSubCategorySlug
	} from './category-select.helpers.js';

	const workflow = $derived(appData.config.workflow);

	const categorySlug = $derived(workflow.categorySlug);
	const subCategorySlug = $derived(workflow.subCategorySlug);

	const subCategories = $derived(filteredSubCategories(app.availableCategories, categorySlug));

	const selectedCategory = $derived(
		app.availableCategories.find((category) => category.slug === categorySlug)
	);
	const selectedSubCategory = $derived(
		subCategories.find((subCategory) => subCategory.slug === subCategorySlug)
	);

	const categoryTriggerLabel = $derived(selectedCategory?.name ?? 'Select category');
	const subCategoryTriggerLabel = $derived(selectedSubCategory?.name ?? 'Select sub-category');

	const hasSelection = $derived(Boolean(categorySlug || subCategorySlug));
</script>

<div class="flex flex-col gap-3">
	<div class="flex flex-col gap-1.5">
		<div class="flex items-center justify-between gap-1">
			<p class="text-sm font-medium">Category</p>
			<Button
				variant="link"
				size="xs"
				class={[
					'h-auto gap-0.5 px-0 py-0 text-xs has-[>svg]:px-0',
					!hasSelection && 'invisible'
				]}
				aria-hidden={!hasSelection}
				tabindex={hasSelection ? undefined : -1}
				disabled={!hasSelection}
				onclick={() => clearWorkflowCategorySlugs()}
			>
				Clear
				<XIcon size={11} />
			</Button>
		</div>
		<Select.Root
			type="single"
			value={categorySlug}
			onValueChange={(value) => setWorkflowCategorySlug(value)}
		>
			<Select.Trigger size="sm" class={['w-full', !categorySlug && 'text-muted-foreground']}>
				<span class="flex items-center gap-2">
					{#if selectedCategory?.iconURL}
						<img src={selectedCategory.iconURL} alt="" class="size-4 shrink-0" />
					{/if}
					{categoryTriggerLabel}
				</span>
			</Select.Trigger>
			<Select.Content portalProps={{ disabled: true }}>
				<Select.Group>
					{#each app.availableCategories as category (category.slug)}
						<Select.Item value={category.slug} label={category.name}>
							<span class="flex items-center gap-2">
								{#if category.iconURL}
									<img src={category.iconURL} alt="" class="size-4 shrink-0" />
								{/if}
								{category.name}
							</span>
						</Select.Item>
					{/each}
				</Select.Group>
			</Select.Content>
		</Select.Root>
	</div>

	<div class="flex flex-col gap-1.5">
		<p class="text-sm font-medium">Sub-category</p>
		<Select.Root
			type="single"
			disabled={!categorySlug}
			value={subCategorySlug}
			onValueChange={(value) => setWorkflowSubCategorySlug(value)}
		>
			<Select.Trigger
				size="sm"
				class={[
					'w-full',
					!subCategorySlug && 'text-muted-foreground',
					!categorySlug && 'opacity-50'
				]}
			>
				<span class="flex items-center gap-2">
					{#if selectedSubCategory?.iconURL}
						<img src={selectedSubCategory.iconURL} alt="" class="size-4 shrink-0" />
					{/if}
					{subCategoryTriggerLabel}
				</span>
			</Select.Trigger>
			<Select.Content portalProps={{ disabled: true }}>
				<Select.Group>
					{#each subCategories as subCategory (subCategory.slug)}
						<Select.Item value={subCategory.slug} label={subCategory.name}>
							<span class="flex items-center gap-2">
								{#if subCategory.iconURL}
									<img src={subCategory.iconURL} alt="" class="size-4 shrink-0" />
								{/if}
								{subCategory.name}
							</span>
						</Select.Item>
					{/each}
				</Select.Group>
			</Select.Content>
		</Select.Root>
	</div>
</div>
