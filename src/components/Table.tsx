import { ReactNode } from 'react';

type TableProps = {
  head?: ReactNode[];
  children: ReactNode;
};

export default function Table({head, children}: TableProps) {
  return (
    <table className="table-fixed border-collapse text-sm">
      { head && (
          <thead className="sticky top-0">
            <tr className="text-center font-bold bg-gray-100">
              {
                head.map(h => (<td className="p-3 border border-gray-300">{h}</td>))
              }
            </tr>
          </thead>)}
      { children && (<tbody>{children}</tbody>) }
    </table>
  )
}
