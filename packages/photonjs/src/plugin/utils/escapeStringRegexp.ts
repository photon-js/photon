// Credit: https://github.com/sindresorhus/escape-string-regexp/blob/main/index.js
export function escapeStringRegexp(subject: string) {
  return subject.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&').replace(/-/g, '\\x2d')
}
