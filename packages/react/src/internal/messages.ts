// Every string a component renders on its own lives here, so a later locale provider only has to
// swap this object. Components expose an override for each through their own props.
export const messages = {
  otpField: {
    label: '인증 코드',
  },
  checkboxGroup: {
    required: '하나 이상 선택하세요.',
  },
  slider: {
    start: '시작',
    end: '끝',
  },
  rating: {
    label: '평점',
    required: '점수를 선택하세요.',
    valueLabel: (value: number, max: number) => `${max}점 만점에 ${value}점`,
  },
} as const;
