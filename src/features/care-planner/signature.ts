// Pure helpers for a drawn signature. Strokes are stored as SVG path data ("M x y L x y ...") with
// the size of the pad they were drawn on, so they can be re-rendered at any size.
// Pure module: no imports from @/lib/supabase, react-native or expo-*.

export type Point = { x: number; y: number };

/** A signature as drawn: one path string per stroke, plus the pad size in dp. */
export type SignatureData = {
  w: number;
  h: number;
  paths: string[];
};

/** Points closer together than this (dp) add nothing visible, so they are dropped. */
export const MIN_POINT_DISTANCE = 1.5;
/** A stroke needs at least this many points to count as a signature... */
export const MIN_STROKE_POINTS = 3;
/** ...and to be at least this long (dp), so a tap or tiny scribble does not count. */
export const MIN_STROKE_LENGTH = 20;

const round1 = (n: number) => Math.round(n * 10) / 10;

const distance = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);

/**
 * One stroke of points into path data: coordinates rounded to 1 decimal, points closer than
 * MIN_POINT_DISTANCE to the previous kept point dropped (the final point is always kept).
 * Returns an empty string for no points.
 */
export function strokeToPathData(points: readonly Point[]): string {
  const kept: Point[] = [];
  points.forEach((raw, index) => {
    const point = { x: round1(raw.x), y: round1(raw.y) };
    const last = kept[kept.length - 1];
    const isFinal = index === points.length - 1;
    if (!last || distance(last, point) >= MIN_POINT_DISTANCE) {
      kept.push(point);
    } else if (isFinal && (last.x !== point.x || last.y !== point.y)) {
      kept.push(point);
    }
  });
  return kept.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x} ${p.y}`).join('');
}

const POINT_PATTERN = /[ML]\s*(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)/g;

/** Path data back into points. Anything that is not an M/L pair is ignored. */
export function pathDataToPoints(path: string): Point[] {
  return Array.from(path.matchAll(POINT_PATTERN), (m) => ({ x: Number(m[1]), y: Number(m[2]) }));
}

function strokeLength(points: readonly Point[]): number {
  let total = 0;
  for (let i = 1; i < points.length; i += 1) total += distance(points[i - 1], points[i]);
  return total;
}

/** True when there is nothing worth saving: no strokes, only taps, or only tiny scribbles. */
export function isSignatureEmpty(signature: SignatureData | null | undefined): boolean {
  if (!signature) return true;
  return !signature.paths.some((path) => {
    const points = pathDataToPoints(path);
    return points.length >= MIN_STROKE_POINTS && strokeLength(points) >= MIN_STROKE_LENGTH;
  });
}

/** Compact JSON for the text column: `{"w":313,"h":200,"paths":["M10.5 20.1L11 21.4"]}`. */
export function serializeSignature(signature: SignatureData): string {
  return JSON.stringify({
    w: round1(signature.w),
    h: round1(signature.h),
    paths: signature.paths,
  });
}

/** The database rejects a serialised signature longer than this (see `save_recording_consent`). */
export const MAX_SIGNATURE_LENGTH = 60000;

/** True when a serialised signature is short enough for the database to accept. */
export function isSignatureWithinLimit(serialized: string): boolean {
  return serialized.length <= MAX_SIGNATURE_LENGTH;
}

/** The inverse of `serializeSignature`. Returns null for anything that is not a valid signature. */
export function parseSignature(value: string | null | undefined): SignatureData | null {
  if (!value) return null;
  let raw: unknown;
  try {
    raw = JSON.parse(value);
  } catch {
    return null;
  }
  if (typeof raw !== 'object' || raw === null) return null;
  const { w, h, paths } = raw as { w?: unknown; h?: unknown; paths?: unknown };
  if (typeof w !== 'number' || typeof h !== 'number' || !(w > 0) || !(h > 0)) return null;
  if (!Number.isFinite(w) || !Number.isFinite(h)) return null;
  if (!Array.isArray(paths) || !paths.every((p) => typeof p === 'string')) return null;
  return { w, h, paths: paths as string[] };
}
