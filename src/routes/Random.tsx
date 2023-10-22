import { useCallback, useEffect, useState, useRef } from 'react';
import Button from '../components/Button';
import Input from '../components/Input';
import Divider from '../components/Divider';

const MAX_HISTORY = 1000;

export default function Random() {

  const [randomNum, setRandomNum] = useState<number>();
  const [randomIntNum, setRandomIntNum] = useState<number>();
  const [cryptoRandomNum, setCryptoRandomNum] = useState<Uint32Array>();
  const [cryptoRandomUuid, setCryptoRandomUuid] = useState<string>();
  const [lowStr, setLowStr] = useState<string>(localStorage.getItem('random-low') ?? '0');
  const [highStr, setHighStr] = useState<string>(localStorage.getItem('random-high') ?? '10');
  const [error, setError] = useState<{[key:string]: string}>({});
  const [history, setHistory] = useState<string[]>([]);

  const low = useRef<number>(0);
  const high = useRef<number>(0);
  
  const genRandom = useCallback(() => {
    setRandomNum(Math.random());
  }, []);

  const genRandomInt = useCallback(() => {
    setRandomIntNum(Math.floor((Math.random() * (high.current - low.current)) + low.current));
  }, [low, high]);

  const genCryptoRandom = useCallback(() => {
    setCryptoRandomNum(window.crypto.getRandomValues(new Uint32Array(1)));
  }, []);

  const genCryptoRandomUuid = useCallback(() => {
    setCryptoRandomUuid(window.crypto.randomUUID());
  }, []);

  useEffect(() => {
    let l = parseInt(lowStr);
    if (isNaN(l)) {
      setError(prev => ({...prev, low: 'NaN'}));
    } else {
      low.current = l;
      setError(prev => ({...prev, low: ''}));
      localStorage.setItem('random-low', lowStr);
    }

    let h = parseInt(highStr);
    if (isNaN(h)) {
      setError(prev => ({...prev, high: 'NaN'}));
    } else {
      high.current = h;
      setError(prev => ({...prev, high: ''}));
      localStorage.setItem('random-high', highStr);
    }
  }, [lowStr, highStr]);

  useEffect(() => {
    if (randomNum) {
      setHistory(prev => ([`${randomNum}`, ...prev].slice(0, MAX_HISTORY)));
    }
  }, [randomNum]);

  useEffect(() => {
    if (randomIntNum) {
      setHistory(prev => ([`${randomIntNum}`, ...prev].slice(0, MAX_HISTORY)));
    }
  }, [randomIntNum]);

  useEffect(() => {
    if (cryptoRandomNum) {
      setHistory(prev => ([`${cryptoRandomNum}`, ...prev].slice(0, MAX_HISTORY)));
    }
  }, [cryptoRandomNum]);

  useEffect(() => {
    if (cryptoRandomUuid) {
      setHistory(prev => ([`${cryptoRandomUuid}`, ...prev].slice(0, MAX_HISTORY)));
    }
  }, [cryptoRandomUuid]);
  
  return (
    <div className="overflow-auto px-[1px]">
      <h1>Random</h1>
      
      <Button className="whitespace-nowrap" onClick={genRandom}>Generate Random</Button>
      <RandomValue value={randomNum} />

      <Divider />
      
      <div className="flex gap-1 items-center justify-start overflow-x-auto px-[1px]">
        <Button className="whitespace-nowrap" onClick={genRandomInt} disabled={(error.low || error.high) ? true : false}>Generate Random Int</Button>
        <InputNumber label="Low" error={error.low} value={lowStr} setValue={setLowStr} />
        <InputNumber label="High" error={error.high} value={highStr} setValue={setHighStr} />
      </div>
      <RandomValue value={randomIntNum} />

      <Divider />
      
      <Button className="whitespace-nowrap" onClick={genCryptoRandom}>Generate Random Values</Button>
      <RandomValue value={cryptoRandomNum && `${cryptoRandomNum}`} />
      <div className="text-sm">Ref: <a href="https://developer.mozilla.org/en-US/docs/Web/API/Crypto/getRandomValues" target="_blank" rel="noreferrer">Crypto: getRandomValues() method</a></div>

      <Divider />

      
      <Button className="whitespace-nowrap" onClick={genCryptoRandomUuid}>Generate Random UUID</Button>
      <RandomValue value={cryptoRandomUuid} />
      <p className="text-sm">Ref: <a href="https://developer.mozilla.org/en-US/docs/Web/API/Crypto/randomUUID" target="_blank" rel="noreferrer">Crypto: randomUUID() method</a></p>

      <Divider />

      <h2>History</h2>
      <Button className="whitespace-nowrap" disabled={!history || history.length === 0} onClick={e => setHistory([])}>Clear</Button>
      <pre className="w-full whitespace-pre-wrap border p-3 overflow-auto">
        {history.join(' ')}
      </pre>
    </div>
  );
}


type InputNumberProps = {
  label: string;
  error?: string;
  value?: string;
  setValue?: (val: string) => void;
};

function InputNumber({label, error, value, setValue}: InputNumberProps) {
  return(
    <>
      <span>{label}</span>
      <Input className={`w-[5em] ${error && 'border border-2 border-red-500'}`} type="number" value={value} onChange={e => setValue?.(e.target.value)}/>
      {error && (<span className="text-red-500 bg-red-100/50 border border-red-500 rounded-full px-1">{error}</span>)}
    </>
  )
}

type RandomValueProps = {
  value?: number | string;
};

function RandomValue({value}: RandomValueProps) {

  const [copyDone, setCopyDone] = useState<boolean>(true);

  useEffect(() => {
    setCopyDone(false);
  }, [value]);

  function copy() {
    if (value) {
      navigator.clipboard.writeText(`${value}`);
      setCopyDone(true);
    }
  }
  
  return (
    <div
      className={`inline-block flex items-center gap-1 border px-3 py-1 bg-gray-100`}>
      <div className="grow">
        {value}
      </div>
      
      <Button
        variant="sm"
        icon={copyDone ? "done_outline" : "content_copy"}
        onClick={copy}
        disabled={value === undefined || copyDone}
      /></div>
  )
}
