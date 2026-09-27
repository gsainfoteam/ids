// Every string a component renders on its own lives here, so a later locale provider only has to
// swap this object. Components expose an override for each through their own props.
export const messages = {
  otpField: {
    label: '인증 코드',
  },
  textField: {
    clear: '지우기',
  },
  passwordField: {
    show: '비밀번호 표시',
    capsLock: 'Caps Lock이 켜져 있습니다.',
  },
  textArea: {
    count: (count: number, maxLength: number | undefined) =>
      maxLength === undefined ? `${count}` : `${count} / ${maxLength}`,
    remaining: (remaining: number) => `${remaining}자 남았습니다.`,
    limitReached: '글자 수 제한에 도달했습니다.',
  },
} as const;
