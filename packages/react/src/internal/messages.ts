// Every string a component renders on its own lives here, so a later locale provider only has to
// swap this object. Components expose an override for each through their own props.
export const messages = {
  // Month, weekday and period names come from Intl in this locale unless a component is given its
  // own `locale`, so they read in the same language as the strings below.
  locale: 'ko-KR',
  otpField: {
    label: '인증 코드',
  },
  calendar: {
    label: '달력',
    previousMonth: '이전 달',
    nextMonth: '다음 달',
    month: '월',
    year: '연도',
  },
  timePicker: {
    label: '시간',
    hour: '시',
    minute: '분',
    second: '초',
    period: '오전/오후',
  },
} as const;
