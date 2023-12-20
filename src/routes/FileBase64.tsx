import { useEffect, useState, useCallback, useRef, type ChangeEvent } from 'react';
import Button from '../components/Button';
import Input from '../components/Input';
import ErrorPanel from '../components/ErrorPanel';
import HexView from '../components/HexView';
import { file_to_base64 } from '../utils/base64';


export default function FileBase64() {
  const [file, setFile] = useState<File>();
  const [base64, setBase64] = useState<string>();
  const [error, setError] = useState<string>();
  const [arrayBuffer, setArrayBuffer] = useState<ArrayBuffer>();

  async function onFileChange(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  }

  async function convertFile2base64() {
    if (file) {
      try {
        let base64 = await file_to_base64(file);
        setBase64(base64);
      } catch (err) {
        setError(`${err}`)
      }
    }
  }

  useEffect(() => {
    if (file) {
      let reader = new FileReader();
      reader.onload = () => {
        let arr = reader.result as ArrayBuffer;
        setArrayBuffer(arr);
      };
      reader.readAsArrayBuffer(file);
    }
  }, [file]);

  return (
    <div className="">
      <h1>File -&gt; Base64</h1>
      <div className="my-3">
        <input type="file" className="bg-gray-100 px-3 py-2 border rounded-lg" onChange={onFileChange} />
      </div>
      <ErrorPanel error={error} label={'Error:'} />
      {
        file && (
          <div className="px-3 py-1 border rounded">
            <h2>File Information</h2>
            <ul className="">
              <li><strong>Name:</strong> {file.name}</li>
              <li><strong>Size:</strong> {file.size.toLocaleString()} bytes</li>
              <li><strong>Type:</strong> {file.type}</li>
              <li><strong>Last Modified:</strong> {new Date(file.lastModified).toLocaleString()}</li>
            </ul>
          </div>
        )
      }
      <Button onClick={convertFile2base64} disabled={file ? false : true}>Convert to Base64</Button>
      { base64 && (<>
        <h2>Base64:</h2>
        <pre className="overflow-auto whitespace-pre text-sm border border-gray-400 p-1 rounded">{base64}</pre>
        <p>{base64.length.toLocaleString()} bytes</p>
      </>)}

      {arrayBuffer && <Head arrayBuffer={arrayBuffer} />}
      {arrayBuffer && <Tail arrayBuffer={arrayBuffer} />}
      {/* {file && <FileHexView file={file} />} */}
      
    </div>
  )
}

type HeadProps = {
  arrayBuffer: ArrayBuffer
};

function Head({ arrayBuffer }: HeadProps) {

  const [show, setShow] = useState<boolean>(false);
  const [value, setValue] = useState<string>(localStorage.getItem('file-head-size') ?? '64');
  const [size, setSize] = useState<number>(parseInt(value));

  useEffect(() => {
    let n = parseInt(value);
    if (!isNaN(n)) {
      setSize(n);
      localStorage.setItem('file-head-size', n.toString());
    }
  }, [value]);

  return (
    <div>
      <div className="flex gap-1 items-center">
        <Button onClick={() => setShow(true)}>Head</Button>
        Size:
        <Input
          type="number"
          className="w-[5em]"
          value={value}
          onChange={e => setValue(e.target.value)}
        />
      </div>
      {
        show && (
          <HexView arrayBuffer={arrayBuffer} offset={0} size={size} />
        )
      }
    </div>
  )
}

type TailProps = {
  arrayBuffer: ArrayBuffer
};

function Tail({ arrayBuffer }: TailProps) {

  const [show, setShow] = useState<boolean>(false);
  const [value, setValue] = useState<string>(localStorage.getItem('file-tail-size') ?? '64');
  const [size, setSize] = useState<number>(parseInt(value));
  

  useEffect(() => {
    let n = parseInt(value);
    if (!isNaN(n)) {
      setSize(n);
      localStorage.setItem('file-tail-size', n.toString());
    }
  }, [value]);

  return (
    <div>
      <div className="flex gap-1 items-center">
        <Button onClick={() => setShow(true)}>Tail</Button>
        Size:
        <Input
          type="number"
          className="w-[5em]"
          value={value}
          onChange={e => setValue(e.target.value)}
        />
      </div>
        {
          show && (
            <HexView arrayBuffer={arrayBuffer} offset={arrayBuffer.byteLength - size} />
          )
        }
      </div>
  )
}
