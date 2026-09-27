// Every string a component renders on its own lives here, so a later locale provider only has to
// swap this object. Components expose an override for each through their own props.
export const messages = {
  otpField: {
    label: '인증 코드',
  },
  checkboxGroup: {
    required: '하나 이상 선택하세요.',
  },
} as const;
