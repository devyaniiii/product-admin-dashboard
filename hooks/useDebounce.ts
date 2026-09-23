// hooks/useDebounce.ts
import { useEffect, useState } from "react";

// Returns a "delayed" version of `value` that only updates after the
// user has stopped changing `value` for `delayMs` milliseconds.
// Generic <T> so it works for search strings, numbers, anything.
export function useDebounce<T>(value: T, delayMs: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Every time `value` changes, we (re)start a timer.
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delayMs);

    // Cleanup: if `value` changes again before the timer fires
    // (i.e. the user typed another character), React calls this
    // cleanup function first, which cancels the pending timer.
    // This is THE mechanism that makes debouncing work — without
    // this cleanup, every keystroke would eventually fire its own
    // update, just delayed, instead of only the LAST one firing.
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debouncedValue;
}