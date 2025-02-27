export class MolfileStream extends TransformStream {
  #buffer = '';

  constructor() {
    super({
      transform: (chunk, controller) => {
        this.#buffer += chunk;
        let begin = 0;
        let index = 0;
        while ((index = this.#buffer.indexOf('\n$$$$', index)) !== -1) {
          controller.enqueue(this.#buffer.slice(begin, index));
          index += 5;
          if (this.#buffer[index] === '\r') {
            index++;
          }
          begin = index;
        }
        this.#buffer = this.#buffer.slice(begin);
      },
      flush: (controller) => {
        if (this.#buffer) {
          controller.enqueue(this.#buffer);
        }
      },
    });
  }
}
