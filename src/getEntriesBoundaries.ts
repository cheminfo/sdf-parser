/**
 * Get the [start, end] boundaries of each SDF entry in a string.
 *
 * Uses `indexOf` for fast splitting without regex overhead.
 * @param string - The full SDF string.
 * @param substring - The delimiter to search for (e.g. `'\n$$$$'`).
 * @param eol - The end-of-line character used to skip past the delimiter line.
 * @returns An array of `[start, end]` index pairs, one per SDF entry.
 */
export function getEntriesBoundaries(
  string: string,
  substring: string,
  eol: string,
): Array<[number, number]> {
  const res: Array<[number, number]> = [];
  let previous = 0;
  let next = 0;
  while (next !== -1) {
    next = string.indexOf(substring, previous);
    if (next !== -1) {
      res.push([previous, next]);
      const nextMatch = string.indexOf(eol, next + substring.length);
      if (nextMatch === -1) {
        next = -1;
      } else {
        previous = nextMatch + eol.length;
        next = previous;
      }
    } else {
      res.push([previous, string.length]);
    }
  }
  return res;
}
