import type { Step } from '$core/repositories/step.repository.js';
import type { Substep } from '$core/repositories/substep.repository.svelte.js';

//

export type WorkflowTreeSelection =
	| { type: 'idle' }
	| { type: 'step'; step: Step }
	| { type: 'substep'; substep: Substep };
