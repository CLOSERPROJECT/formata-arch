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

	const categoryTriggerLabel = $derived(selectedCategory?.name ?? 'Category');
	const subCategoryTriggerLabel = $derived(selectedSubCategory?.name ?? 'Sub-category');

	const hasSelection = $derived(Boolean(categorySlug || subCategorySlug));
</script>

<div class="flex items-center gap-1">
	<Select.Root
		type="single"
		value={categorySlug}
		onValueChange={(value) => setWorkflowCategorySlug(workflow, value)}
	>
		<Select.Trigger size="sm" class={[!categorySlug && 'text-muted-foreground']}>
			<span class="flex items-center gap-2">
				{#if selectedCategory?.iconURL}
					<img src={selectedCategory.iconURL} alt="" class="size-4 shrink-0" />
				{/if}
				{categoryTriggerLabel}
			</span>
		</Select.Trigger>
		<Select.Content>
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

	<Select.Root
		type="single"
		disabled={!categorySlug}
		value={subCategorySlug}
		onValueChange={(value) => setWorkflowSubCategorySlug(workflow, value)}
	>
		<Select.Trigger
			size="sm"
			class={[!subCategorySlug && 'text-muted-foreground', !categorySlug && 'opacity-50']}
		>
			<span class="flex items-center gap-2">
				{#if selectedSubCategory?.iconURL}
					<img src={selectedSubCategory.iconURL} alt="" class="size-4 shrink-0" />
				{/if}
				{subCategoryTriggerLabel}
			</span>
		</Select.Trigger>
		<Select.Content>
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

	{#if hasSelection}
		<Button
			variant="ghost"
			size="icon-sm"
			class="text-muted-foreground"
			aria-label="Clear category selection"
			onclick={() => clearWorkflowCategorySlugs(workflow)}
		>
			<XIcon size={14} />
		</Button>
	{/if}
</div>
