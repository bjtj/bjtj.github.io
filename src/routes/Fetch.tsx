import { useEffect, useState, useRef } from 'react'
import Input from '../components/Input';
import Button from '../components/Button';
import ErrorPanel from '../components/ErrorPanel';
import Icon from '../components/Icon';
import TextArea from '../components/TextArea';

type FetchResult = {
  ok: boolean;
  status: number;
  start: Date;
  elapsed: number;
  headers?: Headers | null;
  error?: string;
  json?: any;
  text?: string;
};

const METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'HEAD', 'OPTIONS'];

export default function Fetch() {
  const [url, setUrl] = useState<string>('http://localhost:3000/');
  const [result, setResult] = useState<FetchResult>();
  const [method, setMethod] = useState<string>('GET');
  const [requestHeaders, setRequestHeaders] = useState<{[key:string]:string}>({});
  const [requestBody, setRequestBody] = useState<string>();

  const doFetch = async (url: string, opts: any) => {

    let tick = new Date().getTime();
    let start = new Date();
    let headers: Headers|null = null;
    let ok = false;
    let status = 0;

    try {
      let resp = await fetch(url, {
        method: 'GET',
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'omit',
        referrerPolicy: 'no-referrer',
        ...opts,
      });

      ok = resp.ok;
      status = resp.status;

      headers = resp.headers;
      let contentType = resp.headers.get("content-type");
      if (contentType && contentType.includes('application/json')) {
        let json = await resp.json();
        return {
          ok,
          status,
          start,
          elapsed: new Date().getTime() - tick,
          headers,
          json,
        };
      } else {
        let text = await resp.text();
        return {
          ok,
          status,
          start,
          elapsed: new Date().getTime() - tick,
          headers,
          text,
        };
      }
    } catch (err) {
      return {
        ok,
        status,
        start,
        elapsed: new Date().getTime() - tick,
        headers,
        error: `${err}`
      };
    } finally {
      
    }
  };

  useEffect(() => {
    let u = localStorage.getItem('fetch-url');
    if (u) {
      setUrl(u);
    }

    let m = localStorage.getItem('fetch-method');
    if (m) {
      setMethod(m);
    }

  }, []);

  useEffect(() => {
    if (result) {
      localStorage.setItem('fetch-url', url);
      localStorage.setItem('fetch-method', method);
    }
  }, [result]);
  
  return (
    <div className="overflow-hidden p-[1px]">
      <h1>Fetch</h1>
      <p className="italic">WARNING: It uses client side fetch() API</p>
      <div className="flex items-center gap-2">
        <select className="px-3 py-1.5 rounded bg-white border border-gray-300 hover:border-gray-500 hover:bg-gray-100/50" name="method" onChange={e => setMethod(e.target.value)}>
          {
            METHODS.map((m, i) => (<option key={`method-${i}`} value={m} selected={m === method}>{m}</option>))
          }
        </select>
        <Input className="grow" value={url} onChange={e => setUrl(e.target.value)} placeholder="URL..." />
        <Button className="shrink-0" onClick={async () => {
          let opts = {
            method,
            headers: requestHeaders,
            ...(requestBody ? {body: requestBody} : {})
          };
          setResult(await doFetch(url, opts));
        }}>Send</Button>
      </div>

      <HeaderEdit onChangeHeaders={headers => setRequestHeaders(headers)} />

      <div className="p-3 border rounded my-1">
        <h3 className="my-3">Body</h3>
        <TextArea className="w-full" value={requestBody} onChange={e => setRequestBody(e.target.value)} />
      </div>
      
      {
        result && (<ResultView result={result} />)
      }
    </div>
  );
}


type ResultViewProps = {
  result: FetchResult;
};

function ResultView({result}:ResultViewProps) {
  return (
    <>
      <p>Request Time: {result.start.toLocaleString()}</p>
      <p>Elapsed: {result.elapsed} ms.</p>
      <p>Status: <span className={`${result.ok ? 'text-green-500' : 'text-red-500'}`}>{result.status}</span></p>
      <ErrorPanel error={result.error} label="Error:" />
      { result.headers && (
          <HeaderView headers={result.headers} />
        )}
      {result.json && (
        <>
          <h2>Body: JSON</h2>
          <pre className="overflow-auto text-sm">
            {result.json && JSON.stringify(result.json, null, 2)}
          </pre></>)}
      {result.text && (
        <>
          <h2>Body: Text</h2>
          <pre className="overflow-auto text-sm">
            {result.text}
          </pre></>)}
    </>
  )
}

type HeaderViewProps = {
  headers: Headers;
}

function HeaderView({headers}: HeaderViewProps) {
  return (
    <div>
      <h2>Headers</h2>
      <ul>
        {
          Array.from(headers.keys()).map((key) => (
            <li>{key}: {headers.get(key)}</li>
          ))
        }
      </ul>
    </div>
  );
}


type HeaderField = {
  idx: string;
  key: string;
  value: string;
};


type HeaderEditProps = {
  onChangeHeaders: (headers: {[key:string]: string}) => void;
};

function HeaderEdit({ onChangeHeaders }: HeaderEditProps) {
  const [headers, setHeaders] = useState<HeaderField[]>([]);
  const idx_seed = useRef<number>(0);
  const addHeaderField = () => {
    let idx = `${idx_seed.current++}`;
    setHeaders(prev => [...prev, {idx, key: '', value: ''}]);
  };

  useEffect(() => {
    onChangeHeaders(headers.filter(h => h.key).reduce((obj, item) => ({
      ...obj,
      [item.key]: item.value
    }), {}));
  }, [headers]);
  
  return (
    <div className="p-3 border rounded-xl">
      <h3 className="my-3">Headers</h3>
      <ul className="space-y-1">
        {
          headers.map(header => (
            <li>
              <HeaderFieldEdit
                idx={header.idx}
                onChange={(idx, key, value) => {
                  setHeaders(prev =>
                    prev.map(field => field.idx === idx ? {idx, key, value} : field));
                }}
                onDelete={() => setHeaders(prev => prev.filter(h => h.idx !== header.idx))} />
            </li>
          ))
        }
      </ul>
      <Button onClick={addHeaderField}>+ Add</Button>
      <pre>
        {
          headers.filter(h => h.key).map(h => (`${h.key}: ${h.value}`)).join('\n')
        }
      </pre>
    </div>
  )
}

type HeaderFieldEditProps = {
  idx: string;
  onChange: (idx: string, key: string, value: string) => void;
  onDelete: () => void;
};

function HeaderFieldEdit({ idx, onChange, onDelete }: HeaderFieldEditProps) {

  const [key, setKey] = useState<string>('');
  const [value, setValue] = useState<string>('');

  useEffect(() => {
    onChange(idx, key, value);
  }, [key, value]);
  
  return (
    <div className="flex items-center gap-2">
      <Input className="w-[10em]" value={key} onChange={e => setKey(e.target.value)} placeholder="Key"/>
      <Input className="grow" value={value} onChange={e => setValue(e.target.value)} placeholder="Value"/>
      <Button onClick={onDelete}><Icon className="!text-base">remove</Icon></Button>
    </div>
  )
}
