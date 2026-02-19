import { ensureString } from 'ensure-string';

import { getEntriesBoundaries } from './getEntriesBoundaries.ts';
import type { LabelInfo } from './util/getMolecule.ts';
import { getMolecule } from './util/getMolecule.ts';

/**
 * A parsed SDF molecule entry. The `molfile` field contains the raw molfile
 * string. Additional fields are populated from the SDF `> <field>` sections.
 */
export interface Molecule {
  /** The raw V2000/V3000 molfile block. */
  molfile: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [label: string]: any;
}

/**
 * Options for the {@link parse} function.
 */
export interface ParseOptions {
  /**
   * Modifier functions applied to field values after parsing. The function
   * receives the raw string value and may return a transformed value. Returning
   * `undefined` or `null` removes the field from the molecule.
   */
  modifiers?: Record<string, (value: string) => unknown>;
  /**
   * Callback functions called for each field value. The callbacks are stored
   * on the label info and available in statistics.
   */
  forEach?: Record<string, (value: unknown) => void>;
  /**
   * When `true`, numeric string values are automatically converted to numbers.
   * @default true
   */
  dynamicTyping?: boolean;
  /**
   * End-of-line character. Auto-detected from the file content when not set.
   * @default '\n'
   */
  eol?: string;
  /**
   * When `true`, normalises all `\r\n` and `\r` sequences to `\n` before
   * parsing. Useful for SDF files with mixed or Windows-style line endings.
   * @default false
   */
  mixedEOL?: boolean;
  /**
   * Only include fields whose names appear in this list.
   * When combined with `exclude`, the field must satisfy both constraints.
   */
  include?: string[];
  /**
   * Exclude fields whose names appear in this list.
   * When combined with `include`, the field must satisfy both constraints.
   */
  exclude?: string[];
  /**
   * A predicate function to filter molecules. Only molecules for which this
   * function returns `true` are included in the result.
   */
  filter?: (molecule: Molecule) => boolean;
}

/**
 * Statistics for a single SDF field label, as returned in
 * {@link ParseResult.statistics}.
 */
export interface LabelStatistic {
  /** Field label name. */
  label: string;
  /** Number of molecules that contain this field. */
  counter: number;
  /** Whether all parsed values are numeric. */
  isNumeric: boolean;
  /** Whether this field is included in the output (not excluded). */
  keep: boolean;
  /** Minimum numeric value, only set when `isNumeric` is `true`. */
  minValue?: number;
  /** Maximum numeric value, only set when `isNumeric` is `true`. */
  maxValue?: number;
  /** Whether every molecule in the result contains this field. */
  always: boolean;
}

/**
 * Return value of the {@link parse} function.
 */
export interface ParseResult {
  /** Wall-clock time taken to parse, in milliseconds. */
  time: number;
  /** Parsed molecule entries. */
  molecules: Molecule[];
  /** Sorted list of all field label names found in the file. */
  labels: string[];
  /** Per-label statistics. */
  statistics: LabelStatistic[];
}

/**
 * Synchronously parse an SDF file into an array of molecule objects.
 * @param sdf - The SDF content as a string, `ArrayBuffer`, or `ArrayBufferView`.
 * @param options - Parsing options.
 * @returns A {@link ParseResult} containing molecules and statistics.
 * @example
 * ```ts
 * import { readFileSync } from 'node:fs';
 * import { parse } from 'sdf-parser';
 *
 * const sdf = readFileSync('compounds.sdf', 'utf8');
 * const { molecules, statistics } = parse(sdf);
 * ```
 */
export function parse(sdf: unknown, options: ParseOptions = {}): ParseResult {
  options = { ...options };
  if (options.modifiers === undefined) options.modifiers = {};
  if (options.forEach === undefined) options.forEach = {};
  if (options.dynamicTyping === undefined) options.dynamicTyping = true;

  // ensureString converts ArrayBuffer/ArrayBufferView to string
  const sdfString = ensureString(sdf as Parameters<typeof ensureString>[0]);
  if (typeof sdfString !== 'string') {
    throw new TypeError('Parameter "sdf" must be a string');
  }

  if (options.eol === undefined) {
    options.eol = '\n';
    if (options.mixedEOL) {
      // Normalize all line endings to \n
      // We work on a local variable so no issue here
    } else {
      // Note: new Set(string) creates a Set of individual characters.
      // '\r\n' is two characters so header.has('\r\n') would always be false.
      // This preserves the original detection behaviour.
      const header = new Set(sdfString.slice(0, 1000));
      if (header.has('\r\n' as unknown as string)) {
        options.eol = '\r\n';
      } else if (header.has('\r')) {
        options.eol = '\r';
      }
    }
  }

  let workingSdf = sdfString;
  if (options.mixedEOL) {
    workingSdf = workingSdf.replaceAll('\r\n', '\n');
    workingSdf = workingSdf.replaceAll('\r', '\n');
  }

  const eol = options.eol;
  const modifiers = options.modifiers;
  const forEachMap = options.forEach;
  const dynamicTyping = options.dynamicTyping;

  const entriesBoundaries = getEntriesBoundaries(workingSdf, `${eol}$$$$`, eol);
  const molecules: Molecule[] = [];
  const labels: Record<string, LabelInfo> = {};
  const start = Date.now();

  for (const boundary of entriesBoundaries) {
    const sdfPart = workingSdf.slice(...boundary);
    if (sdfPart.length < 40) continue;
    const currentLabels: string[] = [];
    const molecule = getMolecule(sdfPart, labels, currentLabels, {
      eol,
      dynamicTyping,
      modifiers,
      forEach: forEachMap,
      include: options.include,
      exclude: options.exclude,
    });
    if (!molecule) continue;
    if (!options.filter || options.filter(molecule)) {
      molecules.push(molecule);
      for (const label of currentLabels) {
        labels[label].counter++;
      }
    }
  }

  // Convert all numeric fields and compute min/max
  for (const label in labels) {
    const currentLabel = labels[label];
    if (currentLabel.isNumeric) {
      currentLabel.minValue = Infinity;
      currentLabel.maxValue = -Infinity;
      for (const molecule of molecules) {
        if (molecule[label]) {
          const value = Number.parseFloat(molecule[label]);
          molecule[label] = value;
          if (value > (currentLabel.maxValue ?? -Infinity)) {
            currentLabel.maxValue = value;
          }
          if (value < (currentLabel.minValue ?? Infinity)) {
            currentLabel.minValue = value;
          }
        }
      }
    }
  }

  for (const key in labels) {
    labels[key].always = labels[key].counter === molecules.length;
  }

  const statistics: LabelStatistic[] = [];
  for (const key in labels) {
    const info = labels[key];
    statistics.push({
      label: key,
      counter: info.counter,
      isNumeric: info.isNumeric,
      keep: info.keep,
      minValue: info.minValue,
      maxValue: info.maxValue,
      always: info.always ?? false,
    });
  }

  return {
    time: Date.now() - start,
    molecules,
    labels: Object.keys(labels),
    statistics,
  };
}
