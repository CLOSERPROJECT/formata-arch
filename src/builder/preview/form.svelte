<script lang="ts">
  import { isRecordEmpty } from '@sjsf/form/lib/object';

  import { getBuilderContext } from "../context.svelte.js";

  const ctx = getBuilderContext();

  const schemaJson = $derived(JSON.stringify(ctx.schema));
  const uiSchema = $derived(ctx.uiSchema ?? {});
  const hasUiSchema = $derived(uiSchema && !isRecordEmpty(uiSchema));
  const uiSchemaJson = $derived(JSON.stringify(uiSchema));
</script>

<div class="flex flex-col gap-2">
  <div class="rounded-md border border-(--global-border) p-4">
    <formata-form
      schema={schemaJson}
      ui-schema={hasUiSchema ? uiSchemaJson : undefined}
    ></formata-form>
  </div>
</div>
