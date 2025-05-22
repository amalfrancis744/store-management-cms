import { useRef, useEffect, RefObject } from 'react';

export default function useFocus<T extends HTMLElement>(): RefObject<T | null> {
  const inputRef = useRef<T>(null);

  useEffect(() => {
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  }, []);

  return inputRef;
}
