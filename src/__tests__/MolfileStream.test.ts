import { expect, test } from 'vitest';

import type { MolfileStreamOptions } from '../MolfileStream.ts';
import { MolfileStream } from '../MolfileStream.ts';
import { iterator } from '../iterator.ts';

/**
 * Feed `sdf` as a `ReadableStream<string>` split into chunks of `chunkSize`
 * characters, pipe through a `MolfileStream`, and collect all emitted records.
 * @param sdf - The SDF text to stream.
 * @param options - Options forwarded to `MolfileStream`.
 * @param chunkSize - Characters per chunk; defaults to the full string length.
 * @returns The array of emitted molfile record strings.
 */
async function streamRecords(
  sdf: string,
  options?: MolfileStreamOptions,
  chunkSize?: number,
): Promise<string[]> {
  const size = chunkSize ?? sdf.length;
  const stream = new ReadableStream<string>({
    start(controller) {
      for (let offset = 0; offset < sdf.length; offset += size) {
        controller.enqueue(sdf.slice(offset, offset + size));
      }
      controller.close();
    },
  });

  const records: string[] = [];
  const molfileStream = stream.pipeThrough(new MolfileStream(options));
  for await (const record of molfileStream) {
    records.push(record);
  }
  return records;
}

/**
 * A minimal but valid-looking molfile body used to build synthetic SDF
 * fixtures. It is 50 characters long (> 40) so it is not discarded by the
 * stream filter.
 */
const RECORD_A =
  'Record-A\n  CDK\n\n  1  0  0  0  0  0  0  0  0  0999 V2000\nM  END\n> <ID>\nAAA\n\n';
const RECORD_B =
  'Record-B\n  CDK\n\n  1  0  0  0  0  0  0  0  0  0999 V2000\nM  END\n> <ID>\nBBB\n\n';
const RECORD_C =
  'Record-C\n  CDK\n\n  1  0  0  0  0  0  0  0  0  0999 V2000\nM  END\n> <ID>\nCCC\n\n';

function makeLF(...records: string[]): string {
  return records.map((r) => `${r}$$$$\n`).join('');
}

function makeCRLF(...records: string[]): string {
  return records.map((r) => `${r.replaceAll('\n', '\r\n')}$$$$\r\n`).join('');
}

// ---------------------------------------------------------------------------
// Core correctness — single-record files
// ---------------------------------------------------------------------------

test('LF file: single record is emitted without trailing CR', async () => {
  const sdf = makeLF(RECORD_A);
  const records = await streamRecords(sdf);

  expect(records).toHaveLength(1);
  expect(records[0].endsWith('\r')).toBe(false);
  expect(records[0]).toContain('Record-A');
});

test('CRLF file: single record is normalised — no trailing CR', async () => {
  const sdf = makeCRLF(RECORD_A);
  const records = await streamRecords(sdf);

  expect(records).toHaveLength(1);
  expect(records[0].endsWith('\r')).toBe(false);
  expect(records[0]).toContain('Record-A');
});

// ---------------------------------------------------------------------------
// Multi-record files — this is where the original bug manifested
// ---------------------------------------------------------------------------

test('LF 2 records: both records are complete', async () => {
  const sdf = makeLF(RECORD_A, RECORD_B);
  const records = await streamRecords(sdf);

  expect(records).toHaveLength(2);
  expect(records[0]).toContain('Record-A');
  expect(records[1]).toContain('Record-B');
  expect(records[1].startsWith('R')).toBe(true);
});

test('CRLF 2 records: both records complete, first char of record 2 not dropped', async () => {
  const sdf = makeCRLF(RECORD_A, RECORD_B);
  const records = await streamRecords(sdf);

  expect(records).toHaveLength(2);
  expect(records[0]).toContain('Record-A');
  expect(records[1]).toContain('Record-B');
  expect(records[1].startsWith('R')).toBe(true);
});

test('CRLF 3 records: all 3 complete', async () => {
  const sdf = makeCRLF(RECORD_A, RECORD_B, RECORD_C);
  const records = await streamRecords(sdf);

  expect(records).toHaveLength(3);
  expect(records[0]).toContain('Record-A');
  expect(records[1]).toContain('Record-B');
  expect(records[2]).toContain('Record-C');
});

test('Mixed EOL file: some lines LF, some CRLF — both records complete', async () => {
  const rec1 = 'Record-A\r\n  CDK\n\n  1  0\r\nM  END\n> <ID>\r\nAAA\r\n\n';
  const rec2 = 'Record-B\r\n  CDK\r\n\r\n  1  0\nM  END\r\n> <ID>\nBBB\n\r\n';
  const sdf = `${rec1}$$$$\r\n${rec2}$$$$\n`;
  const records = await streamRecords(sdf);

  expect(records).toHaveLength(2);
  expect(records[0]).toContain('Record-A');
  expect(records[1]).toContain('Record-B');
});

// ---------------------------------------------------------------------------
// Chunk boundary tests
// ---------------------------------------------------------------------------

test(
  String.raw`CRLF split so \r is last char of chunk 1 and \n is first char of chunk 2`,
  async () => {
    const sdf = makeCRLF(RECORD_A, RECORD_B);
    const crlfPos = sdf.indexOf('$$$$') + 4;

    expect(sdf[crlfPos]).toBe('\r');
    expect(sdf[crlfPos + 1]).toBe('\n');

    const chunk1 = sdf.slice(0, crlfPos + 1);
    const chunk2 = sdf.slice(crlfPos + 1);

    async function streamTwoChunks(): Promise<string[]> {
      const stream = new ReadableStream<string>({
        start(controller) {
          controller.enqueue(chunk1);
          controller.enqueue(chunk2);
          controller.close();
        },
      });
      const records: string[] = [];
      for await (const record of stream.pipeThrough(new MolfileStream())) {
        records.push(record);
      }
      return records;
    }

    const records = await streamTwoChunks();

    expect(records).toHaveLength(2);
    expect(records[0]).toContain('Record-A');
    expect(records[1]).toContain('Record-B');
    expect(records[1].startsWith('R')).toBe(true);
  },
);

test('$$$$ split across chunk boundary', async () => {
  const sdf = makeLF(RECORD_A, RECORD_B);
  const delimPos = sdf.indexOf('$$$$');
  const chunk1 = sdf.slice(0, delimPos + 2);
  const chunk2 = sdf.slice(delimPos + 2);

  async function streamTwoChunks(): Promise<string[]> {
    const stream = new ReadableStream<string>({
      start(controller) {
        controller.enqueue(chunk1);
        controller.enqueue(chunk2);
        controller.close();
      },
    });
    const records: string[] = [];
    for await (const record of stream.pipeThrough(new MolfileStream())) {
      records.push(record);
    }
    return records;
  }

  const records = await streamTwoChunks();

  expect(records).toHaveLength(2);
  expect(records[0]).toContain('Record-A');
  expect(records[1]).toContain('Record-B');
});

// ---------------------------------------------------------------------------
// Stream delivery modes
// ---------------------------------------------------------------------------

test('single chunk delivery: correct record count', async () => {
  const sdf = makeLF(RECORD_A, RECORD_B, RECORD_C);
  const records = await streamRecords(sdf);

  expect(records).toHaveLength(3);
});

test('byte-by-byte delivery: correct record count', async () => {
  const sdf = makeLF(RECORD_A, RECORD_B, RECORD_C);
  const records = await streamRecords(sdf, undefined, 1);

  expect(records).toHaveLength(3);
});

test('byte-by-byte delivery with CRLF: correct record count', async () => {
  const sdf = makeCRLF(RECORD_A, RECORD_B);
  const records = await streamRecords(sdf, undefined, 1);

  expect(records).toHaveLength(2);
  expect(records[0]).toContain('Record-A');
  expect(records[1]).toContain('Record-B');
});

// ---------------------------------------------------------------------------
// Short record filtering
// ---------------------------------------------------------------------------

test('record under 40 chars is not emitted', async () => {
  const short = 'tiny\n$$$$\n';
  const sdf = short + makeLF(RECORD_A);
  const records = await streamRecords(sdf);

  expect(records).toHaveLength(1);
  expect(records[0]).toContain('Record-A');
});

// ---------------------------------------------------------------------------
// mixedEOL: false with eol: '\r\n'
// ---------------------------------------------------------------------------

test(
  String.raw`mixedEOL:false — CRLF 2-record file → 2 records (advance bug fixed)`,
  async () => {
    const sdf = makeCRLF(RECORD_A, RECORD_B);
    const records = await streamRecords(sdf, { mixedEOL: false });

    expect(records).toHaveLength(2);
    expect(records[0]).toContain('Record-A');
    expect(records[1]).toContain('Record-B');
    expect(records[1].startsWith('R')).toBe(true);
  },
);

test(
  String.raw`mixedEOL:false — CRLF records retain \r\n line endings`,
  async () => {
    const sdf = makeCRLF(RECORD_A, RECORD_B);
    const records = await streamRecords(sdf, { mixedEOL: false });

    expect(records[0]).toContain('\r\n');
  },
);

// ---------------------------------------------------------------------------
// mixedEOL: false with eol: '\n' (default behaviour)
// ---------------------------------------------------------------------------

test(
  String.raw`mixedEOL:false — LF 2-record file → 2 correct records`,
  async () => {
    const sdf = makeLF(RECORD_A, RECORD_B);
    const records = await streamRecords(sdf, { mixedEOL: false });

    expect(records).toHaveLength(2);
    expect(records[0]).toContain('Record-A');
    expect(records[1]).toContain('Record-B');
  },
);

// ---------------------------------------------------------------------------
// Empty / edge cases
// ---------------------------------------------------------------------------

test('empty stream → 0 records', async () => {
  const records = await streamRecords('');

  expect(records).toHaveLength(0);
});

test('stream with only $$$$ → 0 records (too short)', async () => {
  const records = await streamRecords('$$$$\n');

  expect(records).toHaveLength(0);
});

test('stream with single $$$$ and no content → 0 records', async () => {
  const records = await streamRecords('\n$$$$\n');

  expect(records).toHaveLength(0);
});

// ---------------------------------------------------------------------------
// iterator integration — CRLF field parsing
// ---------------------------------------------------------------------------

test('iterator with CRLF input: field values are not truncated', async () => {
  const sdf =
    'Molecule-1\r\n  CDK\r\n\r\n  1  0  0  0  0  0  0  0  0  0999 V2000\r\nM  END\r\n> <NAME>\r\nEthanol\r\n\r\n$$$$\r\n' +
    'Molecule-2\r\n  CDK\r\n\r\n  1  0  0  0  0  0  0  0  0  0999 V2000\r\nM  END\r\n> <NAME>\r\nMethanol\r\n\r\n$$$$\r\n';

  const stream = new ReadableStream<string>({
    start(controller) {
      controller.enqueue(sdf);
      controller.close();
    },
  });

  const results = [];
  for await (const entry of iterator(stream)) {
    results.push(entry);
  }

  expect(results).toHaveLength(2);
  expect(results[0].NAME).toBe('Ethanol');
  expect(results[1].NAME).toBe('Methanol');
  expect(results[1].molfile.startsWith('Molecule-2')).toBe(true);
});

test('iterator with CRLF byte-by-byte: field values correct', async () => {
  const sdf =
    'Molecule-A\r\n  CDK\r\n\r\n  1  0  0  0  0  0  0  0  0  0999 V2000\r\nM  END\r\n> <CODE>\r\n42\r\n\r\n$$$$\r\n';

  const stream = new ReadableStream<string>({
    start(controller) {
      for (const ch of sdf) {
        controller.enqueue(ch);
      }
      controller.close();
    },
  });

  const results = [];
  for await (const entry of iterator(stream)) {
    results.push(entry);
  }

  expect(results).toHaveLength(1);
  expect(results[0].CODE).toBe(42);
  expect(results[0].molfile.startsWith('Molecule-A')).toBe(true);
});

// ---------------------------------------------------------------------------
// default (mixedEOL: undefined) — auto detection tests
// ---------------------------------------------------------------------------

test('auto LF file: 2 records correct, no normalization needed', async () => {
  const sdf = makeLF(RECORD_A, RECORD_B);
  const records = await streamRecords(sdf);

  expect(records).toHaveLength(2);
  expect(records[0]).toContain('Record-A');
  expect(records[1]).toContain('Record-B');
  expect(records[1].startsWith('R')).toBe(true);
  expect(records[0].endsWith('\r')).toBe(false);
  expect(records[1].endsWith('\r')).toBe(false);
});

test('auto CRLF file: 2 records correct, CR detected and normalised', async () => {
  const sdf = makeCRLF(RECORD_A, RECORD_B);
  const records = await streamRecords(sdf);

  expect(records).toHaveLength(2);
  expect(records[0]).toContain('Record-A');
  expect(records[1]).toContain('Record-B');
  expect(records[1].startsWith('R')).toBe(true);
  expect(records[0].endsWith('\r')).toBe(false);
  expect(records[1].endsWith('\r')).toBe(false);
});

test('auto CRLF file shorter than 10 000 chars: detected in flush', async () => {
  const sdf = makeCRLF(RECORD_A, RECORD_B);

  expect(sdf.length).toBeLessThan(10_000);

  const records = await streamRecords(sdf);

  expect(records).toHaveLength(2);
  expect(records[0]).toContain('Record-A');
  expect(records[1]).toContain('Record-B');
  expect(records[0].endsWith('\r')).toBe(false);
  expect(records[1].endsWith('\r')).toBe(false);
});

test('auto LF file > 10 000 chars: sniff decides in transform, not flush', async () => {
  const sdf = makeLF(RECORD_A).repeat(200); // ~16 KB — crosses SNIFF_LENGTH in one chunk

  expect(sdf.length).toBeGreaterThan(10_000);

  const records = await streamRecords(sdf);

  expect(records).toHaveLength(200);
  expect(records[0]).toContain('Record-A');
  expect(records[0].endsWith('\r')).toBe(false);
});

test('auto CRLF file > 10 000 chars: sniff detects and normalises mid-stream', async () => {
  const sdf = makeCRLF(RECORD_A).repeat(200); // ~18 KB CRLF — triggers in transform

  expect(sdf.length).toBeGreaterThan(10_000);

  const records = await streamRecords(sdf);

  expect(records).toHaveLength(200);
  expect(records[0]).toContain('Record-A');
  expect(records[0].endsWith('\r')).toBe(false);
});

test('auto byte-by-byte CRLF: still detects and normalises', async () => {
  const sdf = makeCRLF(RECORD_A, RECORD_B);
  const records = await streamRecords(sdf, undefined, 1);

  expect(records).toHaveLength(2);
  expect(records[0]).toContain('Record-A');
  expect(records[1]).toContain('Record-B');
  expect(records[0].endsWith('\r')).toBe(false);
  expect(records[1].endsWith('\r')).toBe(false);
});

// ---------------------------------------------------------------------------
// Coverage: normaliseChunk pendingCR — lone CR at chunk boundary (non-\n follows)
// ---------------------------------------------------------------------------

test(
  String.raw`mixedEOL:true — lone \r at chunk end, non-\n starts next chunk: \r passes through`,
  async () => {
    // chunk1 ends with lone \r; chunk2 starts with '$' (not '\n')
    // The \r is not part of a \r\n pair so it passes through as-is.
    const chunk1 = `${RECORD_A.slice(0, -1)}\r`; // replace trailing \n with \r
    const chunk2 = `$$$$\n${RECORD_B}$$$$\n`;

    const stream = new ReadableStream<string>({
      start(controller) {
        controller.enqueue(chunk1);
        controller.enqueue(chunk2);
        controller.close();
      },
    });

    const records: string[] = [];
    for await (const record of stream.pipeThrough(
      new MolfileStream({ mixedEOL: true }),
    )) {
      records.push(record);
    }

    expect(records).toHaveLength(2);
    expect(records[0]).toContain('Record-A');
    expect(records[1]).toContain('Record-B');
  },
);

// ---------------------------------------------------------------------------
// Coverage: trailing lone \r at end of stream appended to splitBuffer in flush
// ---------------------------------------------------------------------------

test(
  String.raw`CRLF file ending with lone \r: record is still emitted`,
  async () => {
    // makeCRLF produces "...$$$$\r\n"; strip the final \n to get a trailing lone \r
    const sdf = makeCRLF(RECORD_A).slice(0, -1);

    expect(sdf.endsWith('\r')).toBe(true);

    const records = await streamRecords(sdf);

    expect(records).toHaveLength(1);
    expect(records[0]).toContain('Record-A');
  },
);

// ---------------------------------------------------------------------------
// Coverage: normaliseChunk pendingCR across chunk boundary
// ---------------------------------------------------------------------------

test(
  String.raw`mixedEOL:true — \r last char of chunk, \n first char of next: no chars dropped`,
  async () => {
    const sdf = makeCRLF(RECORD_A, RECORD_B);
    const crlfPos = sdf.indexOf('$$$$') + 4;

    expect(sdf[crlfPos]).toBe('\r');
    expect(sdf[crlfPos + 1]).toBe('\n');

    const chunk1 = sdf.slice(0, crlfPos + 1); // ends with '\r'
    const chunk2 = sdf.slice(crlfPos + 1); // starts with '\n'

    const stream = new ReadableStream<string>({
      start(controller) {
        controller.enqueue(chunk1);
        controller.enqueue(chunk2);
        controller.close();
      },
    });

    const records: string[] = [];
    for await (const record of stream.pipeThrough(
      new MolfileStream({ mixedEOL: true }),
    )) {
      records.push(record);
    }

    expect(records).toHaveLength(2);
    expect(records[0]).toContain('Record-A');
    expect(records[1]).toContain('Record-B');
    expect(records[1].startsWith('R')).toBe(true);
  },
);

// ---------------------------------------------------------------------------
// Coverage: $$$$ found in chunk but \n not yet buffered
// ---------------------------------------------------------------------------

test(
  String.raw`mixedEOL:false — $$$$ in chunk 1, \n in chunk 2: both records complete`,
  async () => {
    const sdf = makeLF(RECORD_A, RECORD_B);
    const delimPos = sdf.indexOf('$$$$');
    const chunk1 = sdf.slice(0, delimPos + 4); // ends with '$$$$'
    const chunk2 = sdf.slice(delimPos + 4); // starts with '\n'

    expect(chunk2[0]).toBe('\n');

    const stream = new ReadableStream<string>({
      start(controller) {
        controller.enqueue(chunk1);
        controller.enqueue(chunk2);
        controller.close();
      },
    });

    const records: string[] = [];
    for await (const record of stream.pipeThrough(
      new MolfileStream({ mixedEOL: false }),
    )) {
      records.push(record);
    }

    expect(records).toHaveLength(2);
    expect(records[0]).toContain('Record-A');
    expect(records[1]).toContain('Record-B');
  },
);

// ---------------------------------------------------------------------------
// Coverage: flush emits remaining splitBuffer when no trailing delimiter
// ---------------------------------------------------------------------------

test('content without trailing $$$$ is emitted from flush', async () => {
  const records = await streamRecords(RECORD_A, { mixedEOL: false });

  expect(records).toHaveLength(1);
  expect(records[0]).toContain('Record-A');
});
