export const isNodeFromAnyWindow = (value: unknown): value is Node =>
  typeof value === 'object' && value !== null && 'nodeType' in value;

export const keepFocusWhereItIs = (event: { preventDefault(): void }) => event.preventDefault();
