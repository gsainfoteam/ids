// Every string a component renders on its own lives here, so a later locale provider only has to
// swap this object. Components expose an override for each through their own props.
export const messages = {
  avatarGroup: {
    overflow: (count: number) => `외 ${count}명`,
  },
  chip: {
    remove: '삭제',
  },
  otpField: {
    label: '인증 코드',
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
} as const;
