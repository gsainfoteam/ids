export function isUnread(unread: number | boolean | undefined): unread is number | true {
  return unread === true || (typeof unread === 'number' && unread > 0);
}
