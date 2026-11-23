import js from '@eslint/js';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';

const OUTPUT_IS_BUILT_FROM_THE_IR =
  'Emitters build output as target nodes from the IR. A literal the target spells goes in literals.ts.';

export default defineConfig(
  { ignores: ['node_modules', 'out', 'dart'] },
  { extends: [js.configs.recommended, ...tseslint.configs.recommended], files: ['**/*.ts'] },
  {
    files: ['src/targets/**/*.ts'],
    ignores: ['src/targets/**/literals.ts'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector:
            'TemplateLiteral[expressions.length>0]:not(NewExpression[callee.name=/Error$/] > TemplateLiteral)',
          message: OUTPUT_IS_BUILT_FROM_THE_IR,
        },
        {
          selector: "BinaryExpression[operator='+'] > Literal[raw=/^['\"]/]",
          message: OUTPUT_IS_BUILT_FROM_THE_IR,
        },
        {
          selector: "BinaryExpression[operator='+'] > TemplateLiteral",
          message: OUTPUT_IS_BUILT_FROM_THE_IR,
        },
        {
          selector:
            'CallExpression[callee.property.name=/^(replace|replaceAll|concat|padStart|padEnd)$/]',
          message: OUTPUT_IS_BUILT_FROM_THE_IR,
        },
      ],
    },
  },
);
