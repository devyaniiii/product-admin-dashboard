// components/SearchBar.tsx
"use client";

import { useState, useEffect } from "react";

interface SearchBarProps {
  initialValue: string;
  onSearch: (value: string) => void;
}

export default function SearchBar({ initialValue, onSearch }: SearchBarProps) {
  // Local, immediate state — updates on every keystroke so the input
  // feels responsive. The debounce happens in the parent (Step 7.4),
  // not here, so this component stays simple and just reports raw input.
  const [value, setValue] = useState(initialValue);

  // If the URL's search value changes from OUTSIDE this component
  // (e.g. browser back/forward button), keep the input in sync.
 useEffect(() => {
  // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing local input state to the URL's search value when it changes externally (e.g. browser back/forward), not looping state on itself
  setValue(initialValue);
}, [initialValue]);
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => {
        setValue(e.target.value);
        onSearch(e.target.value);
      }}
      placeholder="Search products..."
      className="w-full sm:w-64 border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  );
}