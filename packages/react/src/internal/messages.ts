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
  chipField: {
    placeholder: '항목 추가…',
    listbox: '옵션',
    search: '항목 검색',
    empty: '검색 결과가 없습니다.',
    create: (text: string) => `“${text}” 추가`,
    invalid: '추가할 수 없는 값입니다.',
    limit: (count: number) => `최대 ${count}개까지 고를 수 있습니다.`,
    remove: (label: string) => `${label} 삭제`,
  },
} as const;
