/**
 * A Web Streams API `TransformStream` that splits an incoming text stream on
 * the `$$$$` SDF record delimiter and emits individual molfile strings.
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
  readonly #buffer: string[] = [];

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(_options?: { eol?: string }) {
    super({
      transform: (chunk, controller) => {
        this.#buffer.push(chunk);
        const combined = this.#buffer.join('');
        this.#buffer.length = 0;

        let begin = 0;
        let index = 0;
        while ((index = combined.indexOf('$$$$', index)) !== -1) {
          const endOfDelimiter = combined.indexOf('\n', index);
          if (endOfDelimiter === -1) {
            index = begin;
            break;
          }
          const eolLength = combined[endOfDelimiter - 1] === '\r' ? 2 : 1;
          // Remove the last eol before enqueuing
          if (index - eolLength - begin > 40) {
            controller.enqueue(combined.slice(begin, index - eolLength));
          }
          index = endOfDelimiter + eolLength;
          begin = index;
        }
        if (begin < combined.length) {
          this.#buffer.push(combined.slice(begin));
        }
      },
      flush: (controller) => {
        const remaining = this.#buffer.join('');
        if (remaining && remaining.length > 40) {
          controller.enqueue(remaining);
        }
      },
    });
  }
}
