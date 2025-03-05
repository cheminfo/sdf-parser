export class MolfileStream extends TransformStream {
  #buffer = '';

  constructor() {
    super({
      transform: (chunk, controller) => {
        this.#buffer += chunk;
        let begin = 0;
        let index = 0;
        while ((index = this.#buffer.indexOf('$$$$', index)) !== -1) {
          // we need to check if the delimiter '\n' is in the current buffer
          // if it is not we need to wait for the next chunk
          const endOfDelimiter = this.#buffer.indexOf('\n', index);
          if (endOfDelimiter === -1) {
            index = begin;
            break;
          }
          const eolLength = this.#buffer[endOfDelimiter - 1] === '\r' ? 2 : 1;
          // need to remove the last eol because we will split on eol+'>' in getMolecule
          if (index - eolLength - begin > 40) {
            controller.enqueue(this.#buffer.slice(begin, index - eolLength));
          }
          index = endOfDelimiter + eolLength;
          begin = index;
        }
        this.#buffer = this.#buffer.slice(begin);
      },
      flush: (controller) => {
        if (this.#buffer && this.#buffer.length > 40) {
          controller.enqueue(this.#buffer);
        }
      },
    });
  }
}
