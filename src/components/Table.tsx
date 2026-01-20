import { ReactNode } from 'react';

type TableProps = {
  className?: string;
  head?: ReactNode[];
  children: ReactNode;
};

export default function Table({ className, head, children}: TableProps) {
  return (
    <div className="overflow-x-auto">
      <table className={`table-fixed border-collapse ${className ?? ''}`}>
        { head && (
            <thead className="bg-base-300">
              <tr className="sticky top-0">
                {
                  head.map((h, i) => (
                    <th key={`th-${i}`} className="text-center font-bold p-3 border border-gray-300">{h}</th>))
                }
              </tr>
            </thead>)}
        { children && (<tbody className="">{children}</tbody>) }
      </table>
    </div>
  )
}
