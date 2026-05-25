/**
 * Normalise CRLF sequences in `chunk` to LF. Lone `\r` (old Mac OS 9 line
 * endings, pre-2001) is not supported and passes through unchanged.
 *
 * A `\r` at the very end of a chunk is held in `state.pendingCR` so that a
 * `\r\n` pair split across a chunk boundary is still collapsed to a single
 * `\n`.
 * @param chunk - The incoming text chunk to normalise.
 * @param state - Mutable state shared between chunk invocations.
 * @param state.pendingCR - Whether a `\r` was held over from the previous chunk.
 * @returns The chunk with CRLF sequences replaced by LF.
 */
export function normaliseChunk(
  chunk: string,
  state: { pendingCR: boolean },
): string {
  let text = chunk;
  let prefix = '';

  if (state.pendingCR) {
    state.pendingCR = false;
    if (text.startsWith('\n')) {
      prefix = '\n';
      text = text.slice(1);
    } else {
      prefix = '\r';
    }
  }

  if (text.endsWith('\r')) {
    state.pendingCR = true;
    text = text.slice(0, -1);
  }

  return prefix + text.replaceAll('\r\n', '\n');
}
