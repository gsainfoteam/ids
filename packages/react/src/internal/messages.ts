// Every string a component renders on its own lives here, so a later locale provider only has to
// swap this object. Components expose an override for each through their own props.
export const messages = {
  otpField: {
    label: '인증 코드',
  },
  textField: {
    clear: '지우기',
  },
  input: {
    clearSearch: '검색어 지우기',
  },
  numberField: {
    increment: '값 늘리기',
    decrement: '값 줄이기',
    rangeUnderflow: (min: string) => `값은 ${min} 이상이어야 합니다.`,
    rangeOverflow: (max: string) => `값은 ${max} 이하여야 합니다.`,
  },
  telField: {
    country: '국가',
    countrySearch: '국가 또는 국가 번호 검색',
    invalid: '올바른 전화번호를 입력하세요.',
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
