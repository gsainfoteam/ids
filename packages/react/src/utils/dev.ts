declare const process: { env: { NODE_ENV?: string } };

function readDevelopment() {
  try {
    return process.env.NODE_ENV !== 'production';
  } catch {
    return false;
  }
}

export const isDevelopment = readDevelopment();
