// Every string a component renders on its own lives here, so a later locale provider only has to
// swap this object. Components expose an override for each through their own props.
export const messages = {
  avatarGroup: {
    overflow: (count: number) => `외 ${count}명`,
  },
  otpField: {
    label: '인증 코드',
  },
} as const;
