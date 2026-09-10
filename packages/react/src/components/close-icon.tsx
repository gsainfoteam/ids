/** Close 버튼의 기본 글리프. 아이콘 세트를 의존하지 않으려고 여기 인라인으로 둔다. */
export function CloseIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
    >
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}
