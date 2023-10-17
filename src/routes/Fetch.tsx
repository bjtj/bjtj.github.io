import { useEffect, useState, useRef, useCallback } from 'react'
import Input from '../components/Input';
import Button from '../components/Button';
import ErrorPanel from '../components/ErrorPanel';
import Icon from '../components/Icon';
import TextArea from '../components/TextArea';
import Spinner from '../components/Spinner';

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
  const [fetching, setFetching] = useState<boolean>(false);
  const [url, setUrl] = useState<string>(localStorage.getItem('fetch-url') ?? 'http://localhost:3000/');
  const [result, setResult] = useState<FetchResult>();
  const [method, setMethod] = useState<string>(localStorage.getItem('fetch-method') ?? 'GET');
  const [requestHeaders, setRequestHeaders] = useState<{[key:string]:string}>(JSON.parse(localStorage.getItem('fetch-headers') ?? '{}'));
  const [requestBody, setRequestBody] = useState<string>(localStorage.getItem('fetch-body') ?? '');

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
    if (result) {
      localStorage.setItem('fetch-url', url);
      localStorage.setItem('fetch-method', method);
      localStorage.setItem('fetch-headers', JSON.stringify(requestHeaders));
      localStorage.setItem('fetch-body', requestBody);
    }
  }, [result]);

  const onClickSend = useCallback(async () => {
    try {
      setFetching(true);
      let opts = {
        method,
        headers: requestHeaders,
        ...(requestBody ? {body: requestBody} : {})
      };
      setResult(await doFetch(url, opts));
    } finally {
      setFetching(false);
    }
  }, [url, method, requestHeaders, requestBody]);
  
  return (
    <div className="p-[1px]">
      <h1>Fetch</h1>
      <p className="italic">WARNING: It uses client side fetch() API</p>
      <div className="flex items-center gap-2 p-1 overflow-auto">
        <select
          className="text-center px-3 py-1.5 rounded bg-white border border-gray-300 enabled:hover:border-gray-500 enabled:hover:bg-gray-100/50 disabled:bg-gray-500/20 disabled:text-gray-400"
          name="method"
          value={method}
          onChange={e => setMethod(e.target.value)}
          disabled={fetching}>
          {
            METHODS.map((m, i) => (<option className="" key={`method-${i}`} value={m}>{m}</option>))
          }
        </select>
        <Input className="grow w-full" value={url} onChange={e => setUrl(e.target.value)} placeholder="URL..." disabled={fetching} onKeyPress={e => { if (e.key === 'Enter') { e.preventDefault(); onClickSend(); }}} />
        <Button className="shrink-0" onClick={onClickSend} disabled={fetching}>Send</Button>
      </div>

      <HeaderEdit
        defaultHeaders={requestHeaders}
        onChangeHeaders={headers => setRequestHeaders(headers)}
        disabled={fetching} />

      <div className="p-3 border rounded my-1">
        <h3 className="my-3">Body</h3>
        <TextArea className="w-full" value={requestBody} onChange={e => setRequestBody(e.target.value)} disabled={fetching} />
      </div>

      { fetching && (<div className="flex items-center justify-center gap-1 w-full text-xl my-10"><Spinner />Fetching...</div>) }
      
      {
        !fetching && result && (<ResultView result={result} />)
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
          <pre className="overflow-auto text-sm border p-1 rounded">
            {result.json && JSON.stringify(result.json, null, 2)}
          </pre></>)}
      {result.text && (
        <>
          <h2>Body: Text</h2>
          <pre className="overflow-auto text-sm border p-1 rounded">
            {result.text}
          </pre></>)}
    </>
  )
}

type HeaderViewProps = {
  headers: Headers;
}

function HeaderView({ headers }: HeaderViewProps) {
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
  defaultHeaders?: {[key:string]: string};
  disabled?: boolean;
  onChangeHeaders: (headers: {[key:string]: string}) => void;
};

function HeaderEdit({ defaultHeaders, disabled, onChangeHeaders }: HeaderEditProps) {
  const idx_seed = useRef<number>(0);
  const [headers, setHeaders] = useState<HeaderField[]>(defaultHeaders ? 
                                                        Object.keys(defaultHeaders).map(k => ({
                                                          idx: `${idx_seed.current++}`,
                                                          key: k,
                                                          value: defaultHeaders[k]
                                                        })) : []);
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
    <div className="p-3 border rounded-xl overflow-auto">
      <fieldset disabled={disabled}>
        <h3 className="my-3">Headers</h3>
        <ul className="space-y-1">
          {
            headers.map(header => (
              <li>
                <HeaderFieldEdit
                  idx={header.idx}
                  defaultKey={header.key}
                  defaultValue={header.value}
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
      </fieldset>
    </div>
  )
}

type HeaderFieldEditProps = {
  idx: string;
  defaultKey?: string;
  defaultValue?: string;
  disabled?: boolean;
  onChange: (idx: string, key: string, value: string) => void;
  onDelete: () => void;
};

function HeaderFieldEdit({ idx, defaultKey, defaultValue, disabled, onChange, onDelete }: HeaderFieldEditProps) {

  const [key, setKey] = useState<string>(defaultKey ?? '');
  const [value, setValue] = useState<string>(defaultValue ?? '');

  useEffect(() => {
    onChange(idx, key, value);
  }, [key, value]);
  
  return (
    <div className="flex items-center gap-2">
      <Input className="w-[10em] max-w-[30%]" value={key} onChange={e => setKey(e.target.value)} placeholder="Key" disabled={disabled}/>
      <Input className="grow w-full" value={value} onChange={e => setValue(e.target.value)} placeholder="Value" disabled={disabled}/>
      <Button onClick={onDelete}><Icon className="!text-base">remove</Icon></Button>
    </div>
  )
}
