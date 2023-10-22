import { useRef, useCallback } from 'react';

type InputProps = {
  autoFocus?: boolean;
} & React.InputHTMLAttributes<HTMLInputElement>;

export default function Input({type, autoFocus, className, ...others}: InputProps) {
  const inputRef = useRef<HTMLInputElement|null>(null);
  const onInputRef = useCallback((ref: HTMLInputElement|null) => {
    if (!inputRef.current && ref) {
      if (autoFocus) {
        ref.focus();
      }
    }
    inputRef.current = ref;
  }, [autoFocus]);
  return (
    <input
      ref={onInputRef}
      className={`border border-gray-400 px-2 py-1 rounded disabled:bg-gray-500/20 disabled:text-gray-400 ${className ?? ''}`} type={type ?? 'text'} {...others} />
  )
}
