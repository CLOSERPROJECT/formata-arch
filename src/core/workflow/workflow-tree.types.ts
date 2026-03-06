import type { Step, Substep } from '$core/config/types.js';

//

export type WorkflowTreeSelection =
	| { type: 'idle' }
	| { type: 'step'; step: Step }
	| { type: 'substep'; substep: Substep; step: Step };
