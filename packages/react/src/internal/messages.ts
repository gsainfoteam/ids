// Every string a component renders on its own lives here, so a later locale provider only has to
// swap this object. Components expose an override for each through their own props.
export const messages = {
  otpField: {
    label: '인증 코드',
  },
  spinner: {
    label: '불러오는 중',
  },
  alert: {
    close: '닫기',
  },
} as const;
