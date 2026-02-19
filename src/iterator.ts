import { parseString } from 'dynamic-typing';

import { MolfileStream } from './MolfileStream.ts';

/**
 * A molecule entry returned by the {@link iterator} async generator.
 * The `molfile` field contains the raw V2000/V3000 molfile block.
 * Additional fields are populated from the SDF `> <field>` sections.
 */
export interface IteratorMolecule {
  /** The raw V2000/V3000 molfile block. */
  molfile: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [label: string]: any;
}

/**
 * Options for the {@link iterator} async generator.
 */
export interface IteratorOptions {
  /**
   * End-of-line character used to split field entries.
   * @default '\n'
   */
  eol?: string;
  /**
   * When `true`, numeric string values are automatically converted to numbers.
   * @default true
   */
  dynamicTyping?: boolean;
  /**
   * A predicate function to filter molecules. Only molecules for which this
   * function returns `true` are yielded.
   */
  filter?: (molecule: IteratorMolecule) => boolean;
}

/**
 * Asynchronously iterate over molecules from a text-decoded SDF stream.
 * @param readStream - A `ReadableStream<string>` supplying SDF text content.
 * @param options - Iterator options.
 * @yields {IteratorMolecule} Individual molecule objects.
 * @example
 * ```ts
 * import { openAsBlob } from 'node:fs';
 * import { iterator } from 'sdf-parser';
 *
 * const blob = await openAsBlob('compounds.sdf');
 * const textDecoder = new TextDecoderStream();
 * for await (const molecule of iterator(blob.stream().pipeThrough(textDecoder))) {
 *   console.log(molecule.molfile);
 * }
 * ```
 */
export async function* iterator(
  readStream: ReadableStream<string>,
  options: IteratorOptions = {},
): AsyncGenerator<IteratorMolecule> {
  const { eol = '\n', dynamicTyping = true } = options;
  const moleculeStream = readStream.pipeThrough(new MolfileStream({ eol }));
  for await (const entry of moleculeStream) {
    const molecule = parseMolecule(entry, { eol, dynamicTyping });
    if (!options.filter || options.filter(molecule)) {
      yield molecule;
    }
  }
}

interface ParseMoleculeOptions {
  eol: string;
  dynamicTyping: boolean;
}

function parseMolecule(
  sdfPart: string,
  options: ParseMoleculeOptions,
): IteratorMolecule {
  const { eol, dynamicTyping } = options;
  const parts = sdfPart.split(`${eol}>`);
  const molecule: IteratorMolecule = {
    molfile: parts.length > 0 && parts[0].length > 5 ? parts[0] + eol : '',
  };

  for (let j = 1; j < parts.length; j++) {
    const lines = parts[j].split(eol);
    const from = lines[0].indexOf('<');
    const to = lines[0].indexOf('>');
    const label = lines[0].slice(from + 1, to);

    for (let k = 1; k < lines.length - 1; k++) {
      if (molecule[label]) {
        molecule[label] = `${molecule[label] as string}${eol}${lines[k]}`;
      } else {
        molecule[label] = lines[k];
      }
    }

    if (dynamicTyping) {
      molecule[label] = parseString(molecule[label]);
    }
  }

  return molecule;
}
