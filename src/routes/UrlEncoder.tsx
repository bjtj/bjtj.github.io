import { useState, useCallback } from 'react';
import Button from '../components/Button';
import TextArea from '../components/TextArea';
import Icon from '../components/Icon';


export default function UrlEncoder() {

  const [text, setText] = useState<string>();
  const [encoded, setEncoded] = useState<string>();
  const [error, setError] = useState<string>();

  const encode = useCallback(() => {
    if (text) {
      try {
        setEncoded(encodeURIComponent(text));
        setError('');
      } catch (err) {
        setError(`${err}`);
      }
    }
  }, [text]);

  const decode = useCallback(() => {
    if (encoded) {
      try {
        setText(decodeURIComponent(encoded));
        setError('');
      } catch (err) {
        setError(`${err}`);
      }
    }
  }, [encoded]);
  
  return (
    <div className="space-y-3">
      <h1 className="">URL Encoder/Decoder</h1>
      <h3>Original Text:</h3>
      <div>
        <TextArea
          className="w-full font-mono"
          placeholder="Enter text..."
          value={text}
          onChange={e => setText(e.target.value)}></TextArea>
        <p className="text-sm">Length: {text?.length ?? 0}</p>
      </div>
      

      <div className="flex gap-3">
        <Button onClick={encode} disabled={text ? false : true}>
          <Icon>arrow_downward</Icon>
          Encode
        </Button>
        <Button onClick={decode} disabled={encoded ? false : true}>
          <Icon>arrow_upward</Icon>
          Decode
        </Button>
      </div>
      
      <h3>Encoded:</h3>
      <div>
        <TextArea
          className="min-h-5 w-full font-mono"
          placeholder="Encode the original text or enter encoded text here..."
          value={encoded} onChange={e => setEncoded(e.target.value)}></TextArea>
        <p className="text-sm">Length: {encoded?.length ?? 0}</p>
      </div>

      { error && (
          <>
            <h3>Error:</h3>
            <pre className="p-3 text-red-600 ring ring-1 ring-red-600 bg-red-300/20">{error}</pre>
          </>) }
    </div>
  )
}
