import { useEffect, useState, useCallback, useRef } from 'react';
import AsciiCodes from '../assets/asciicodes.json';


type HexViewProps = {
  arrayBuffer: ArrayBuffer;
  offset?: number;
  size?: number;
};

type Opts = {
  arrayBuffer: ArrayBuffer;
  dataView: DataView;
  offset: number;
  size: number;
};

export default function HexView({ arrayBuffer, offset, size } : HexViewProps) {

  const [selected, setSelected] = useState<number>();

  const [opts, setOpts] = useState<Opts>({
    arrayBuffer,
    dataView: new DataView(arrayBuffer),
    offset: Math.max(0, offset ?? 0),
    size: Math.max(0, (Math.min(size ?? arrayBuffer.byteLength, arrayBuffer.byteLength)) - Math.max(0, offset ?? 0))
  });

  useEffect(() => {

    setSelected(undefined);

    let o = Math.max(0, offset ?? 0);
    
    setOpts({
      arrayBuffer,
      dataView: new DataView(arrayBuffer),
      offset: o,
      size: Math.max(0, (Math.min(size ?? arrayBuffer.byteLength, arrayBuffer.byteLength)) - o)
    });
  }, [arrayBuffer, offset, size]);

  return (
    <div>
      {
        [...new Array(Math.ceil(opts.size / 16))].map((_, i) => (
          <Line
            key={`line-${i}`}
            dataView={opts.dataView}
            offset={opts.offset + (i * 16)}
            size={opts.size - (i * 16)}
            selected={selected}
            setSelected={setSelected}
          />
        ))
      }
    </div>
  );
}


type LineProps = {
  dataView: DataView;
  offset: number;
  size: number;
  selected?: number;
  setSelected?: (selected: number) => void;
};

function Line({ dataView, offset, size, selected, setSelected } : LineProps) {

  const printableTable = useRef<{[key:number]: string}>(AsciiCodes.printable.reduce((table, item) => ({
    ...table,
    [item.code]: item.char
  }), {})).current;
  
  return (
    <div className="flex gap-3 text-sm font-mono select-none">
      <div className="text-blue-600">
        {offset.toString(16).padStart(10, '0')}
      </div>
      <div className="flex gap-1">
        {
          [...new Array(Math.min(16, size))].map((_, i) => (
            <div
              key={`offset-${i}`}
              onClick={() => setSelected?.(offset + i)}
              className={`${selected === offset + i ? 'bg-blue-300' : 'hover:bg-blue-100'}`}
            >{dataView.getUint8(offset + i).toString(16).padStart(2, '0')}</div>
          ))
        }
        {
          size < 16 && (
            [...new Array(16 - (size))].map((_, i) => (
              <div key={`hpad-${i}`} className="text-white">..</div>
          )))
        }
      </div>
      <div className="flex border-l pl-1">
        {
          [...new Array(Math.min(16, size))].map((_, i) => (
            <div
              key={`pr-${i}`}
              onClick={() => setSelected?.(offset + i)}
              className={`w-[.8em] ${selected === offset + i ? 'bg-blue-300' : 'hover:bg-blue-100'}`}
            >{printableTable[dataView.getUint8(offset + i)] ?? '.'}</div>
          ))
        }
      </div>
    </div>
  );
}
