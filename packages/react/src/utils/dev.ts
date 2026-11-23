declare const process: { env: { NODE_ENV?: string } };

function readDevelopment() {
  try {
    return process.env.NODE_ENV !== 'production';
  } catch {
    return false;
  }
}

export const isDevelopment = readDevelopment();

const warnedAbout = new Set<string>();

export function warnOnce(message: string, about = message) {
  if (!isDevelopment || warnedAbout.has(about)) return;
  warnedAbout.add(about);
  console.warn(message);
}
