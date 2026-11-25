export const GENERATED_HEADER = '// GENERATED — do not edit manually';

export const STATEMENT_SEPARATOR = '\n\n';

const IDENTIFIER = /^[A-Za-z_$][\w$]*$/;

export const isIdentifier = (key: string) => IDENTIFIER.test(key);
