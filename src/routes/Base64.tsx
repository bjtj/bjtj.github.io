import { useState } from 'react';
import Button from '../components/Button';
import Input from '../components/Input';
import { encodeBase64, decodeBase64 } from '../utils/base64';
import FileBase64 from './FileBase64';
import Icon from '../components/Icon';

export default function Base64() {
  return (
    <div>
      <h1>Base64</h1>
      <StringBase64 />
      <div className="h-3"></div>
      <h2>File -&gt; Base64</h2>
      <FileBase64 />
    </div>
  );
}

function StringBase64() {
  const [plainText, setPlainText] = useState<string>('');
  const [base64, setBase64] = useState<string>('');
  const [encodeError, setEncodeError] = useState<string>();
  const [decodeError, setDecodeError] = useState<string>();

  function doEncode() {
    try {
      setBase64(encodeBase64(plainText));
      setEncodeError(undefined);
      setDecodeError(undefined);
    } catch (err) {
      setEncodeError(`${err}`);
    }
  }

  function doDecode() {
    try {
      setPlainText(decodeBase64(base64));
      setEncodeError(undefined);
      setDecodeError(undefined);
    } catch (err) {
      setDecodeError(`${err}`);
    }
  }

  return (
    <div className="max-w-lg">
      <Input className="w-full" type="text" value={plainText} onInput={e => {
        setPlainText(e.currentTarget.value);
      }} />
      {encodeError && <p className="text-red-500">{encodeError}</p>}

      <div className="flex items-center gap-1">
        <Button onClick={doEncode}>
          <Icon>arrow_downward</Icon>
          Encode
        </Button>
        <Button onClick={doDecode}>
          <Icon>arrow_upward</Icon>
          Decode
        </Button>
      </div>

      <Input className="w-full" type="text" value={base64} onInput={e => {
        setBase64(e.currentTarget.value);
      }} />
      {decodeError && <p className="text-red-500">{decodeError}</p>}
    </div>
  );
}
