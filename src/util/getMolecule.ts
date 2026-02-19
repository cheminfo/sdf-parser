import type { Molecule } from '../parse.ts';

/**
 * Internal per-label tracking information used during parsing.
 */
export interface LabelInfo {
  /** Number of molecules that contain this label. */
  counter: number;
  /**
   * Whether all seen values for this label are numeric.
   * Starts as `true` when `dynamicTyping` is enabled.
   */
  isNumeric: boolean;
  /** Whether this label is included in molecule output (not excluded). */
  keep: boolean;
  /** Minimum numeric value (set after all molecules are parsed). */
  minValue?: number;
  /** Maximum numeric value (set after all molecules are parsed). */
  maxValue?: number;
  /** Whether every molecule in the result contains this label. Set after parsing. */
  always?: boolean;
  /** Optional modifier function applied to the raw string value. */
  modifier?: (value: string) => unknown;
  /** Optional callback stored for this label (for statistics). */
  forEach?: (value: unknown) => void;
}

/** Options consumed by {@link getMolecule} (a resolved subset of ParseOptions). */
export interface GetMoleculeOptions {
  eol: string;
  dynamicTyping: boolean;
  include?: string[];
  exclude?: string[];
  modifiers: Record<string, (value: string) => unknown>;
  forEach: Record<string, (value: unknown) => void>;
}

/**
 * Parse a single SDF entry string into a molecule object.
 * @param sdfPart - A single SDF record (everything before the `$$$$` line).
 * @param labels - Shared label tracking object, mutated in place.
 * @param currentLabels - Array to collect label names found in this entry.
 * @param options - Resolved parse options.
 * @returns The molecule object, or `undefined` if the entry is too short.
 */
export function getMolecule(
  sdfPart: string,
  labels: Record<string, LabelInfo>,
  currentLabels: string[],
  options: GetMoleculeOptions,
): Molecule | undefined {
  const { eol, dynamicTyping, include, exclude, modifiers, forEach } = options;
  const parts = sdfPart.split(`${eol}>`);
  if (parts.length === 0 || parts[0].length <= 5) return undefined;
  const molecule: Molecule = { molfile: parts[0] + eol };

  for (let j = 1; j < parts.length; j++) {
    const lines = parts[j].split(eol);
    const from = lines[0].indexOf('<');
    const to = lines[0].indexOf('>');
    const label = lines[0].slice(from + 1, to);
    currentLabels.push(label);

    if (!labels[label]) {
      labels[label] = {
        counter: 0,
        isNumeric: dynamicTyping,
        keep: false,
      };
      if (!exclude?.includes(label) && (!include || include.includes(label))) {
        labels[label].keep = true;
        if (modifiers[label]) labels[label].modifier = modifiers[label];
        if (forEach[label]) labels[label].forEach = forEach[label];
      }
    }

    if (labels[label].keep) {
      for (let k = 1; k < lines.length - 1; k++) {
        if (molecule[label]) {
          molecule[label] = `${molecule[label] as string}${eol}${lines[k]}`;
        } else {
          molecule[label] = lines[k];
        }
      }

      if (labels[label].modifier) {
        const modifiedValue = labels[label].modifier(molecule[label]);
        if (modifiedValue === undefined || modifiedValue === null) {
          // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
          delete molecule[label];
        } else {
          molecule[label] = modifiedValue;
        }
      }

      if (
        labels[label].isNumeric &&
        (!Number.isFinite(+(molecule[label] as string)) ||
          (molecule[label] as string).match(/^0[0-9]/))
      ) {
        labels[label].isNumeric = false;
      }
    }
  }

  return molecule;
}
