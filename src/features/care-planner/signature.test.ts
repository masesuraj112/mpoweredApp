import {
  isSignatureEmpty,
  parseSignature,
  pathDataToPoints,
  serializeSignature,
  strokeToPathData,
  type Point,
  type SignatureData,
} from './signature';

const line = (count: number, step = 5): Point[] =>
  Array.from({ length: count }, (_, i) => ({ x: 10 + i * step, y: 20 + i }));

describe('strokeToPathData', () => {
  it('writes M then L commands', () => {
    expect(strokeToPathData([{ x: 10, y: 20 }, { x: 30, y: 40 }])).toBe('M10 20L30 40');
  });

  it('rounds to one decimal', () => {
    expect(strokeToPathData([{ x: 10.04, y: 20.06 }, { x: 31.26, y: 40.94 }])).toBe(
      'M10 20.1L31.3 40.9',
    );
  });

  it('drops points that are too close to the previous one', () => {
    const path = strokeToPathData([
      { x: 0, y: 0 },
      { x: 0.5, y: 0.5 },
      { x: 1, y: 0.2 },
      { x: 10, y: 0 },
    ]);
    expect(path).toBe('M0 0L10 0');
  });

  it('keeps the final point even when it is close to the previous one', () => {
    expect(strokeToPathData([{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 10.5, y: 0 }])).toBe(
      'M0 0L10 0L10.5 0',
    );
  });

  it('returns an empty string for no points', () => {
    expect(strokeToPathData([])).toBe('');
  });
});

describe('pathDataToPoints', () => {
  it('reads back what strokeToPathData wrote', () => {
    const points = [{ x: 10.5, y: 20.1 }, { x: 30, y: 40 }, { x: 55.2, y: 31.1 }];
    expect(pathDataToPoints(strokeToPathData(points))).toEqual(points);
  });

  it('ignores anything that is not a coordinate pair', () => {
    expect(pathDataToPoints('hello')).toEqual([]);
  });
});

describe('isSignatureEmpty', () => {
  const sig = (paths: string[]): SignatureData => ({ w: 300, h: 200, paths });

  it('is empty for null, no strokes and an empty path', () => {
    expect(isSignatureEmpty(null)).toBe(true);
    expect(isSignatureEmpty(sig([]))).toBe(true);
    expect(isSignatureEmpty(sig(['']))).toBe(true);
  });

  it('is empty for a single tap', () => {
    expect(isSignatureEmpty(sig(['M50 60']))).toBe(true);
  });

  it('is empty for a trivially tiny scribble', () => {
    const tiny = strokeToPathData([{ x: 0, y: 0 }, { x: 2, y: 2 }, { x: 4, y: 0 }]);
    expect(isSignatureEmpty(sig([tiny]))).toBe(true);
  });

  it('is not empty for a real stroke', () => {
    expect(isSignatureEmpty(sig([strokeToPathData(line(10))]))).toBe(false);
  });

  it('is not empty when one stroke of several is real', () => {
    expect(isSignatureEmpty(sig(['M50 60', strokeToPathData(line(10))]))).toBe(false);
  });
});

describe('serializeSignature and parseSignature', () => {
  const signature: SignatureData = {
    w: 313.04,
    h: 200,
    paths: [strokeToPathData(line(8)), strokeToPathData(line(5, 8))],
  };

  it('round-trips', () => {
    const parsed = parseSignature(serializeSignature(signature));
    expect(parsed).toEqual({ ...signature, w: 313 });
  });

  it('writes compact JSON with w, h and paths', () => {
    expect(serializeSignature({ w: 313, h: 200, paths: ['M10.5 20.1L11 21.4'] })).toBe(
      '{"w":313,"h":200,"paths":["M10.5 20.1L11 21.4"]}',
    );
  });

  it('stays small for a long signature after thinning', () => {
    const dense: Point[] = Array.from({ length: 2000 }, (_, i) => ({
      x: 10 + (i % 300) * 0.5,
      y: 100 + Math.sin(i / 10) * 40,
    }));
    const text = serializeSignature({ w: 313, h: 200, paths: [strokeToPathData(dense)] });
    expect(text.length).toBeLessThan(dense.length * 12);
  });

  it('returns null for invalid input', () => {
    expect(parseSignature(null)).toBeNull();
    expect(parseSignature('')).toBeNull();
    expect(parseSignature('not json')).toBeNull();
    expect(parseSignature('{"w":0,"h":10,"paths":[]}')).toBeNull();
    expect(parseSignature('{"w":10,"h":10,"paths":[1]}')).toBeNull();
    expect(parseSignature('[1,2]')).toBeNull();
  });
});
