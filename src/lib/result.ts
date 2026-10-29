import { mapError, type AppError } from '@/lib/errors';

export type Result<T> = { ok: true; data: T } | { ok: false; error: AppError };

export function ok<T>(data: T): Result<T> {
  return { ok: true, data };
}

export function fail<T = never>(error: AppError): Result<T> {
  return { ok: false, error };
}

/** Runs a database call and converts both returned errors and thrown ones (for example a lost connection). */
export async function run<T>(call: () => Promise<Result<T>>): Promise<Result<T>> {
  try {
    return await call();
  } catch (error) {
    return fail(mapError(error));
  }
}
