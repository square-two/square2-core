/**
 * Join multiple path segments into a single path string.
 * @param parts The array of path segments to join.
 * @param sep The separator to use between segments, default is '/'.
 * @returns The joined path string.
 */
export function joinPaths(parts: string[], sep: string = '/'): string {
  return parts.join(sep).replace(new RegExp(`${sep}{1,}`, 'g'), sep);
}
