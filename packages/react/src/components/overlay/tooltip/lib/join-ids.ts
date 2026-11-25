export const joinIds = (...ids: Array<unknown>) =>
  ids.filter((id) => typeof id === 'string' && id !== '').join(' ') || undefined;
