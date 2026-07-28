import type { Step, Substep } from '$core/stream/types.js';

//

export type WorkflowTreeSelection =
	| { type: 'idle' }
	| { type: 'step'; step: Step }
	| { type: 'substep'; substep: Substep; step: Step };
