import type { ErrorObject } from 'ajv';

import type { ParseImportResult } from '$core/app/import-result.js';
import { app } from '$core/app/index.js';

//

const PASTE_VALIDATE_DEBOUNCE_MS = 350;

function emptyFileList() {
	return new DataTransfer().files;
}

function formatFixable(errors: ErrorObject[]): string {
	return errors
		.map((e) => {
			const path = e.instancePath || '';
			const message = e.message ?? 'Invalid';
			return path ? `${path}: ${message}` : message;
		})
		.join('\n');
}

export class ImportStreamDialogState {
	files = $state.raw<FileList | undefined>(undefined);
	fileText = $state.raw<string | undefined>(undefined);
	fileBlockingMessage = $state.raw<string | undefined>(undefined);
	fileFixable = $state.raw<ErrorObject[]>([]);
	pasteText = $state('');
	pasteBlockingMessage = $state.raw<string | undefined>(undefined);
	pasteFixable = $state.raw<ErrorObject[]>([]);
	unsavedConfirmOpen = $state(false);
	pendingImportText = $state.raw<string | undefined>(undefined);

	#pasteValidateTimer: ReturnType<typeof setTimeout> | undefined;
	/** Native paste: validate immediately on the following input (value already updated). */
	#validatePasteOnNextInput = false;

	canConfirm = $derived.by(() => {
		if (this.fileText !== undefined) return this.fileBlockingMessage === undefined;
		if (this.pasteText.trim().length > 0) return this.pasteBlockingMessage === undefined;
		return false;
	});

	fileFixableSummary = $derived(formatFixable(this.fileFixable));
	pasteFixableSummary = $derived(formatFixable(this.pasteFixable));

	#cancelPasteValidation() {
		if (this.#pasteValidateTimer !== undefined) {
			clearTimeout(this.#pasteValidateTimer);
			this.#pasteValidateTimer = undefined;
		}
	}

	#setFileParseResult(result: ParseImportResult) {
		if (result.status === 'blocking') {
			this.fileBlockingMessage = result.message;
			this.fileFixable = [];
		} else {
			this.fileBlockingMessage = undefined;
			this.fileFixable = result.fixable;
		}
	}

	#setPasteParseResult(result: ParseImportResult) {
		if (result.status === 'blocking') {
			this.pasteBlockingMessage = result.message;
			this.pasteFixable = [];
		} else {
			this.pasteBlockingMessage = undefined;
			this.pasteFixable = result.fixable;
		}
	}

	#validatePasteText(text: string) {
		if (!text.trim()) {
			this.pasteBlockingMessage = undefined;
			this.pasteFixable = [];
			return;
		}
		this.#setPasteParseResult(app.parseImport(text));
	}

	#schedulePasteValidation(text: string) {
		this.#cancelPasteValidation();
		this.#pasteValidateTimer = setTimeout(() => {
			this.#pasteValidateTimer = undefined;
			this.#validatePasteText(text);
		}, PASTE_VALIDATE_DEBOUNCE_MS);
	}

	reset() {
		this.#cancelPasteValidation();
		this.#validatePasteOnNextInput = false;
		this.fileText = undefined;
		this.fileBlockingMessage = undefined;
		this.fileFixable = [];
		this.pasteText = '';
		this.pasteBlockingMessage = undefined;
		this.pasteFixable = [];
		this.unsavedConfirmOpen = false;
		this.pendingImportText = undefined;
		this.files = emptyFileList();
	}

	clearFile() {
		this.fileText = undefined;
		this.fileBlockingMessage = undefined;
		this.fileFixable = [];
		this.files = emptyFileList();
	}

	clearPaste() {
		this.#cancelPasteValidation();
		this.pasteText = '';
		this.pasteBlockingMessage = undefined;
		this.pasteFixable = [];
	}

	onOpenChange(next: boolean, syncOpen: (v: boolean) => void) {
		syncOpen(next);
		if (!next) this.reset();
	}

	onFileChange() {
		const file = this.files?.[0];
		if (!file) {
			this.fileText = undefined;
			this.fileBlockingMessage = undefined;
			this.fileFixable = [];
			return;
		}
		this.clearPaste();
		const reader = new FileReader();
		reader.onload = () => {
			const text = reader.result as string;
			this.fileText = text;
			this.#setFileParseResult(app.parseImport(text));
		};
		reader.onerror = () => {
			this.fileText = undefined;
			this.fileBlockingMessage = 'Failed to read file';
			this.fileFixable = [];
		};
		reader.readAsText(file, 'utf-8');
	}

	onTextareaInput() {
		this.clearFile();
		if (this.#validatePasteOnNextInput) {
			this.#validatePasteOnNextInput = false;
			this.#cancelPasteValidation();
			this.#validatePasteText(this.pasteText);
			return;
		}
		if (!this.pasteText.trim()) {
			this.#cancelPasteValidation();
			this.pasteBlockingMessage = undefined;
			this.pasteFixable = [];
			return;
		}
		this.#schedulePasteValidation(this.pasteText);
	}

	onTextareaPaste() {
		this.clearFile();
		this.#cancelPasteValidation();
		this.#validatePasteOnNextInput = true;
	}

	async onPaste() {
		this.clearFile();
		this.#cancelPasteValidation();
		try {
			const text = await navigator.clipboard.readText();
			this.pasteText = text;
			this.#validatePasteText(text);
		} catch {
			this.pasteBlockingMessage = 'Unable to read clipboard. Check browser permissions.';
			this.pasteFixable = [];
		}
	}

	#activeSourceText(): string | undefined {
		if (this.fileText !== undefined) return this.fileText;
		if (this.pasteText.trim().length > 0) return this.pasteText;
		return undefined;
	}

	#setActiveSourceBlocking(message: string) {
		if (this.fileText !== undefined) {
			this.fileBlockingMessage = message;
			this.fileFixable = [];
		} else {
			this.pasteBlockingMessage = message;
			this.pasteFixable = [];
		}
	}

	applyImport(text: string, syncOpen: (v: boolean) => void) {
		const result = app.importFromString(text);
		if (result.status === 'loadable') {
			syncOpen(false);
			this.reset();
		} else {
			this.#setActiveSourceBlocking(result.message);
		}
	}

	onConfirm(syncOpen: (v: boolean) => void) {
		const text = this.#activeSourceText();
		if (text === undefined) return;

		const parsed = app.parseImport(text);
		if (parsed.status === 'blocking') {
			this.#setActiveSourceBlocking(parsed.message);
			return;
		}

		if (app.hasChanges) {
			this.pendingImportText = text;
			this.unsavedConfirmOpen = true;
			return;
		}

		this.applyImport(text, syncOpen);
	}

	onUnsavedContinue(syncOpen: (v: boolean) => void) {
		const text = this.pendingImportText;
		this.unsavedConfirmOpen = false;
		this.pendingImportText = undefined;
		if (text === undefined) return;
		this.applyImport(text, syncOpen);
	}

	onUnsavedOpenChange(next: boolean) {
		if (!next) {
			this.unsavedConfirmOpen = false;
			this.pendingImportText = undefined;
		}
	}
}
