import { useState } from 'react';
import Input from '../components/Input';

type KeycodeProps = {
  
};

type KeycodeHistItem = {
  key: string;
  keyCode: number;
};

export default function Keycode({ }:KeycodeProps) {

  const [keycode, setKeycode] = useState<string>();
  const [keycodeHist, setKeycodeHist] = useState<KeycodeHistItem[]>([]);

  function handleKeycode(item: KeycodeHistItem) {
    setKeycode(`${item.key} (keycode: ${item.keyCode})`);
    setKeycodeHist(prev => {
      return [item, ...prev].slice(0, 100);
    });
  }
  
  return (
    <div className="overflow-x-auto pl-[1px]">
      <h1>Keycode</h1>
      <Input className="font-mono min-w-[15em] text-center" type="text"
        value={keycode}
        onKeyDown={(e) => {
          e.preventDefault();
          handleKeycode(e);
        }}
        placeholder="Type any key..." />
      <ul>
        {
          keycodeHist.map((item, i) => (
            <li key={`hist-item-${i}`}><pre>{`${item.key} (keycode: ${item.keyCode})`}</pre></li>
          ))
        }
      </ul>
    </div>
  )
}
