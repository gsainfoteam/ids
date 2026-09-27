// Every string a component renders on its own lives here, so a later locale provider only has to
// swap this object. Components expose an override for each through their own props.
export const messages = {
  otpField: {
    label: '인증 코드',
  },
  select: {
    placeholder: '선택하세요',
    listbox: '옵션',
    search: '옵션 검색',
    searchPlaceholder: '검색…',
    empty: '검색 결과가 없습니다.',
    clear: '선택 지우기',
    more: (count: number) => `+${count}`,
  },
} as const;
