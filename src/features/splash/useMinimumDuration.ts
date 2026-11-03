import { useEffect, useState } from 'react';

/** True once `ms` have passed since `start` first became true. */
export function useMinimumDuration(ms: number, start: boolean): boolean {
  const [elapsed, setElapsed] = useState(false);

  useEffect(() => {
    if (!start) return;
    const timeout = setTimeout(() => setElapsed(true), ms);
    return () => clearTimeout(timeout);
  }, [ms, start]);

  return elapsed;
}
