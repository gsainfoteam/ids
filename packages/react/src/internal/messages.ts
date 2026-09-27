// Every string a component renders on its own lives here, so a later locale provider only has to
// swap this object. Components expose an override for each through their own props.
export const messages = {
  // Month, weekday and period names come from the date-fns locale for this tag unless a component
  // is given its own `locale`, so they read in the same language as the strings below.
  locale: 'ko-KR',
  avatarGroup: {
    overflow: (count: number) => `외 ${count}명`,
  },
  chip: {
    remove: '삭제',
  },
  otpField: {
    label: '인증 코드',
  },
  calendar: {
    label: '달력',
    previousMonth: '이전 달',
    nextMonth: '다음 달',
    month: '월',
    year: '연도',
    today: '오늘',
    selected: '선택됨',
    weekNumber: (week: number) => `${week}주차`,
    weekNumberHeader: '주차',
  },
  timePicker: {
    label: '시간',
    hour: '시',
    minute: '분',
    second: '초',
    period: '오전/오후',
  },
  dateField: {
    placeholder: '날짜 선택',
    title: '날짜 선택',
    rangePlaceholder: '기간 선택',
    rangeTitle: '기간 선택',
    clear: '날짜 지우기',
    close: '닫기',
    open: '달력 열기',
  },
  timeField: {
    placeholder: '시간 선택',
    title: '시간 선택',
    clear: '시간 지우기',
    close: '닫기',
  },
  dateTimeField: {
    placeholder: '날짜와 시간 선택',
    title: '날짜와 시간 선택',
    clear: '날짜와 시간 지우기',
    close: '닫기',
    pickDateFirst: '고를 수 있는 날짜를 먼저 고르세요.',
  },
  spinner: {
    label: '불러오는 중',
  },
  alert: {
    close: '닫기',
  },
  kbd: {
    command: '커맨드',
    windows: '윈도우',
    control: '컨트롤',
    option: '옵션',
    alt: '알트',
    shift: '시프트',
    return: '리턴',
    enter: '엔터',
    macDelete: '딜리트',
    backspace: '백스페이스',
    forwardDelete: '포워드 딜리트',
    delete: '딜리트',
    escape: '이스케이프',
    tab: '탭',
    space: '스페이스',
    capsLock: '캡스 락',
    up: '위쪽 화살표',
    down: '아래쪽 화살표',
    left: '왼쪽 화살표',
    right: '오른쪽 화살표',
    pageUp: '페이지 업',
    pageDown: '페이지 다운',
    home: '홈',
    end: '엔드',
    fn: '펑션',
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
