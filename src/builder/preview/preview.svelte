<script lang="ts">
  import type { PreviewRoute } from '../model.js';
  import PreviewContent from "./content.svelte";
  import PreviewControls from "./controls.svelte";

  const { route }: { route: PreviewRoute } = $props()
</script>

<div class="grid grid-cols-[1fr_6fr] gap-6 mx-auto">
  <div
    class="sticky top-(--header-height) h-[calc(100vh-var(--header-height))] pb-4 overflow-y-auto pl-8 min-w-[120px]"
  >
    <PreviewControls />
  </div>

  <div class="pb-4 pr-8 overflow-x-hidden">
    <PreviewContent {route} />
  </div>
</div>
