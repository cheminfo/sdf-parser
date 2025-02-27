/**
 *
 * @param {*} string
 * @param {*} substring
 * @param {*} eol
 * @returns
 */
export function getEntriesBoundaries(string, substring, eol) {
  const res = [];
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
