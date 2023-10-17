import { HTMLAttributes, useState, useEffect } from 'react';

type FoldProps = {
  fold?: boolean;
  onChangeFold: (fold: boolean) => void;
} & HTMLAttributes<HTMLDivElement>;

export default function Fold({ className, fold, onChangeFold, children }: FoldProps) {
  const [f, setF] = useState<boolean>(fold ?? false);

  useEffect(() => {
    onChangeFold?.(f);
  }, [f]);
  
  return (
    <div className={`${className ?? ''}`}>
      { fold && children }
    </div>
  )
}

