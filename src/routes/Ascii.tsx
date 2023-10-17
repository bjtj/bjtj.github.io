import { useEffect, useState } from 'react';
import AsciiCodes from '../assets/asciicodes.json';
import Block from '../components/Block';
import TextArea from '../components/TextArea';
import Table from '../components/Table';
import Input from '../components/Input';
import Button from '../components/Button';
import Divider from '../components/Divider';

const ASCII_CODE2PRINT_TABLE = make_ascii_code2print_table();


type ControlCode = {
  code: number;
  caret: string;
  escape_sequence: string;
  name: string;
};

type PrintableCode = {
  code: number;
  glyph: string;
  char: string;
};

export default function Ascii() {

  return (
    <div className="overflow-x-hidden">
      <h1>ASCII</h1>
      <Block variant="note">Reference: <a href="https://en.wikipedia.org/wiki/ASCII" target="_blank">ASCII (wiki)</a></Block>

      <LiveCharCode />

      <Divider />

      <PrintFile />

      <Divider />

      <CharCodeToString />

      <Divider />
      
      <h2>Control Codes</h2>
      <Table
        className="text-sm"
        head={['Dec', 'Hex', 'Oct', 'Caret', 'Escape Sequence', 'Name']}>
        {
          AsciiCodes.control.map((code, i) =>(
            <ControlCode key={`cc-${i}`} code={code} />
          ))
        }
      </Table>

      <Divider />
      
      <h2>Printable Codes</h2>

      <Table
        className="text-sm"
        head={['Dec', 'Hex', 'Oct', 'Glyph']}>
        {
          AsciiCodes.printable.map((code, i) =>(
            <PrintableCode key={`pc-${i}`} code={code} />
          ))
        }
      </Table>

      <Divider />

      <FromCharCodeTable />
    </div>
  );
}


function LiveCharCode() {

  const [text, setText] = useState<string>('');
  
  return (
    <div>
      <h2>Char Code</h2>
      <TextArea value={text} onChange={e => setText(e.target.value)} />
      <div className="flex flex-wrap gap-1 my-3">
        {
          text.split('').map(c => (
            <div className="border border-black text-center rounded">
              <div className="font-mono h-[1.5em]">{c}</div>
              <div><code>{c.charCodeAt(0)}</code></div>
              <div><code>{printhex(c.charCodeAt(0))}</code></div>
            </div>))
        }
      </div>
    </div>
  )
}


function CharCodeToString() {

  const [num, setNum] = useState<number>(0);
  
  return (
    <div>
      <h2>Char Code To String</h2>
      <div className="flex gap-1">
        <Input className="grow w-full max-w-[15em]" type="number" min={0} value={num} onChange={e => setNum(parseInt(e.target.value))} />
        <Button variant="sm" onClick={() => setNum(Math.max(0, num-256))}>-256</Button>
        <Button variant="sm" onClick={() => setNum(num+256)}>+256</Button>
      </div>
      <Table
        className="text-sm mt-3"
        head={['Hex', 'FromCharCode', 'Encode']}>
        <tr className="text-center">
          <td className="border p-1"><code>{printhex(num)}</code></td>
          <td className="border p-1"><code>{String.fromCharCode(num)}</code></td>
          <td className="border p-1"><code>{encodeURIComponent(String.fromCharCode(num))}</code></td>
        </tr>
      </Table>
    </div>
  )
}


function PrintFile() {

  const [file, setFile] = useState<File>();
  const [array, setArray] = useState<string[]>();

  useEffect(() => {
    if (file) {
      let reader = new FileReader();
      reader.onload = () => {
        let buffer = reader.result as ArrayBuffer;
        let dataview = new DataView(buffer, 0);
        let arr = [];
        for (var i = 0; i < buffer.byteLength; i++) {
          let d = dataview.getUint8(i);
          arr.push(asciicode2str(d));
        }
        setArray(arr);
      };
      reader.readAsArrayBuffer(file);
    }
  }, [file]);
  
  
  return (
    <div>
      <h2>Print File</h2>
      <input className="border p-3 bg-gray-100 rounded"
        type="file" onChange={e => e.target.files && setFile(e.target.files[0])} />
      { file && (
          <>
            <p><strong>Filename:</strong> {file.name} ({file.size.toLocaleString()} bytes)</p>
            <div className="grid grid-cols-16 max-h-[500px] max-w-[600px] overflow-auto border p-1 bg-gray-100">
              {
                array && array.map(a => (
                  <code className={`text-center ${a.length == 2 && 'bg-gray-400 text-gray-100'} ${a.startsWith('<?') && 'bg-red-500 text-red-100 flex items-center justify-center text-xs overflow-hidden'}`}>
                    {a}
                  </code>))
              }
            </div>
          </>
        )}
    </div>
  );
}


type ControlCodeProps = {
  code: ControlCode;
};

function ControlCode({code}: ControlCodeProps) {
  return (
    <tr className="text-center">
      <td className="px-3 border border-gray-300"><code>{code.code}</code></td>
      <td className="px-3 border border-gray-300"><code>{printhex(code.code)}</code></td>
      <td className="px-3 border border-gray-300"><code>{printoct(code.code)}</code></td>
      <td className="px-3 border border-gray-300"><code>{code.caret}</code></td>
      <td className="px-3 border border-gray-300">{ code.escape_sequence && <code>\{code.escape_sequence}</code> }</td>
      <td className="px-3 border border-gray-300">{code.name}</td>
    </tr>
  )
}

type PrintableCodeProps = {
  code: PrintableCode;
};

function PrintableCode({code}: PrintableCodeProps) {
  return (
    <tr className="text-center">
      <td className="px-3 border border-gray-300"><code>{code.code}</code></td>
      <td className="px-3 border border-gray-300"><code>{printhex(code.code)}</code></td>
      <td className="px-3 border border-gray-300"><code>{printoct(code.code)}</code></td>
      <td className="px-3 border border-gray-300"><code>{code.glyph}</code></td>
    </tr>
  )
}


function FromCharCodeTable() {
  return (
    <div>
      <h2>String.fromCharCode</h2>
      <Table
        className="text-sm"
        head={['Code', 'Char', 'Encode']}>
        {
          [...new Array(256)].map((_, i) => (
            <tr className="text-center">
              <td className="border">{i}</td>
              <td className="border"><code>{String.fromCharCode(i)}</code></td>
              <td className="border"><code>{encodeURIComponent(String.fromCharCode(i))}</code></td>
            </tr>
          ))
        }
      </Table>
    </div>
  )
}

function make_ascii_code2print_table(): {[key:number]: string} {
  const table = AsciiCodes.printable.reduce((table, item) => ({
    ...table,
    [item.code]: item.char
  }), {});

  return AsciiCodes.control.reduce((table, item) => ({
    ...table,
    [item.code]: item.caret
  }), table);
}

function asciicode2str(code: number) {
  return ASCII_CODE2PRINT_TABLE[code] ?? `<?${code}?>`;
}

function printhex(num: number) {
  return '0x' + num.toString(16).padStart(2, '0');
}

function printoct(num: number) {
  return num.toString(8).padStart(3, '0');
}
