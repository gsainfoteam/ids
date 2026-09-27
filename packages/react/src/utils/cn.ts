import { createCn, validators, type ConfigExtension, type DefaultClassGroupIds } from 'cn/config';

import type { CnFunction } from 'cn';

const isTextStyle = (value: string) => /^(headline|subtitle|body|caption|button)-/.test(value);

// concentric-p-* sets both padding and radius, so it replaces an earlier p-* or rounded-*.
// The reverse is left alone on purpose: a later p-6 must not strip the concentric radius.
const paddingGroups: DefaultClassGroupIds[] = ['p', 'px', 'py', 'ps', 'pe', 'pt', 'pr', 'pb', 'pl'];
const roundedGroups: DefaultClassGroupIds[] = [
  'rounded',
  'rounded-s',
  'rounded-e',
  'rounded-t',
  'rounded-r',
  'rounded-b',
  'rounded-l',
];

const config = {
  extend: {
    theme: {
      radius: ['standard', 'indicator'],
    },
    classGroups: {
      'font-size': [{ text: [isTextStyle] }],
      'concentric-p': [{ 'concentric-p': [validators.isNumber] }],
    },
    conflictingClassGroups: {
      'concentric-p': [...paddingGroups, ...roundedGroups],
    },
  },
} satisfies ConfigExtension;

export const cn: CnFunction = createCn(config);
