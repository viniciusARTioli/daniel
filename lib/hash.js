// A small, fast, non-cryptographic hash (djb2). Only needs to be stable
// across visits so a bookmark can be tied to a specific passage - not
// suitable for anything security-sensitive.
export function hashString(str) {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i);
  }
  return (hash >>> 0).toString(36);
}
