export function getEntriesBoundaries(string, substring, eol) {
  const res = [];
  let previous = 0;
  let next = 0;
  while (next !== -1) {
    next = string.indexOf(substring, previous);
    if (next !== -1) {
      res.push([previous, next]);
      previous = next =
        string.indexOf(eol, next + substring.length) + eol.length;
    } else {
      res.push([previous, string.length]);
    }
  }
  return res;
}
