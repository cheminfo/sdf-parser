import { normaliseChunk } from './normaliseChunk.ts';

/**
 * Options for {@link MolfileStream}.
 */
export interface MolfileStreamOptions {
  /**
   * Controls EOL normalisation:
   * - `undefined` (default): inspect the first 10 000 characters; normalise only if `\r` is
   *   detected. Zero cost for pure-LF files. Assumes the EOL style is consistent throughout.
   * - `true`: always normalise CRLF to LF.
   * - `false`: never normalise; use when the file is known to be pure LF.
   */
  mixedEOL?: boolean;
}

const SNIFF_LENGTH = 10_000;

/**
 * A `TransformStream` that splits an incoming SDF text stream on the `$$$$`
 * record delimiter and emits individual molfile strings.
 *
 * Handles CRLF, LF, and mixed line endings. By default (`mixedEOL: undefined`)
 * the stream sniffs the first 10 000 characters to detect `\r` and activates
 * normalisation only when needed — zero overhead for pure-LF files.
 *
 * Entries shorter than 40 characters are discarded.
 * @example
 * ```ts
 * const stream = readStream.pipeThrough(new MolfileStream());
 * for await (const molfile of stream) {
 *   console.log(molfile);
 * }
 * ```
 */
export class MolfileStream extends TransformStream<string, string> {
  constructor({ mixedEOL }: MolfileStreamOptions = {}) {
    let splitBuffer = '';
    const crState = { pendingCR: false };

    // auto-detection state
    let sniffBuffer = '';
    let decided = mixedEOL !== undefined;
    let normalise = mixedEOL === true;

    function splitRecords(
      text: string,
      controller: TransformStreamDefaultController<string>,
    ) {
      const combined = splitBuffer + text;
      splitBuffer = '';

      let begin = 0;
      let index = 0;
      while ((index = combined.indexOf('$$$$', index)) !== -1) {
        const endOfDelimiter = combined.indexOf('\n', index);
        if (endOfDelimiter === -1) {
          index = begin;
          break;
        }
        const eolLength = combined[endOfDelimiter - 1] === '\r' ? 2 : 1;
        if (index - eolLength - begin > 40) {
          controller.enqueue(combined.slice(begin, index - eolLength));
        }
        index = endOfDelimiter + 1;
        begin = index;
      }
      if (begin < combined.length) {
        splitBuffer = combined.slice(begin);
      }
    }

    super({
      transform(chunk, controller) {
        if (decided) {
          splitRecords(
            normalise ? normaliseChunk(chunk, crState) : chunk,
            controller,
          );
          return;
        }

        sniffBuffer += chunk;
        if (sniffBuffer.length < SNIFF_LENGTH) return;

        decided = true;
        normalise = sniffBuffer.includes('\r');
        const text = normalise
          ? normaliseChunk(sniffBuffer, crState)
          : sniffBuffer;
        sniffBuffer = '';
        splitRecords(text, controller);
      },
      flush(controller) {
        if (!decided) {
          // Stream ended before SNIFF_LENGTH chars were seen.
          normalise = sniffBuffer.includes('\r');
          const text = normalise
            ? normaliseChunk(sniffBuffer, crState)
            : sniffBuffer;
          splitRecords(text, controller);
        }
        if (normalise && crState.pendingCR) {
          splitBuffer += '\r';
          crState.pendingCR = false;
        }
        if (splitBuffer.length > 40) {
          controller.enqueue(splitBuffer);
        }
      },
    });
  }
}
