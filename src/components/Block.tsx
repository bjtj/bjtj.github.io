import { HTMLAttributes } from 'react';


type VARIANTS = 'normal' | 'note' | null | undefined;

type BlockProps = {
  variant?: VARIANTS;
} & HTMLAttributes<HTMLDivElement>;

const variants = {
  'normal': 'bg-gray-200 border border-gray-300 text-gray-900',
  'note': 'bg-orange-100 border border-orange-300',
};

export default function Block({ className, variant, children }: BlockProps) {
  const v = variants[variant ?? 'normal'];
  return (
    <div className={`px-3 py-1 rounded shadow ${v} ${className ?? ''}`}>
      {children}
    </div>
  );
}
