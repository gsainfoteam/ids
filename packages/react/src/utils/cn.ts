import { createCn, validators, type ConfigExtension, type DefaultClassGroupIds } from 'cn/config';

import { IDS_COLOR_FAMILIES } from '../tokens/color-roles';

import type { CnFunction } from 'cn';

const isTextStyle = (value: string) => /^(headline|subtitle|body|caption|button)-/.test(value);

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
      scheme: [{ scheme: [...IDS_COLOR_FAMILIES] }],
      'focus-ring': ['focus-ring', 'focus-ring-scheme', 'focus-ring-current'],
      'state-color': ['state-scheme', 'state-fill'],
    },
    conflictingClassGroups: {
      'concentric-p': [...paddingGroups, ...roundedGroups],
    },
  },
} satisfies ConfigExtension;

export const cn: CnFunction = createCn(config);
