import type { PromptInputInstance } from '../hooks/use-prompt-input';

export const NO_FILES: File[] = [];
export const NO_TOOLS: string[] = [];

export const UNCONTROLLED_AND_UNLIMITED: PromptInputInstance = { attachments: {}, tools: {} };
