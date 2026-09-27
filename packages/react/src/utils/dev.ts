declare const process: { env: { NODE_ENV?: string } };

// Vite bakes `import.meta.env.DEV` into the library build as `false`, which would strip every
// development warning from the published package. `process.env.NODE_ENV` is left for the app's
// bundler to replace, so warnings show in the app's development build and drop out of its
// production build. Loaded unbundled, `process` does not exist, which counts as production.
function readDevelopment() {
  try {
    return process.env.NODE_ENV !== 'production';
  } catch {
    return false;
  }
}

export const isDevelopment = readDevelopment();
