import { useState } from 'react';
import Input from '../components/Input';

type KeycodeHistItem = {
  key: string;
  keyCode: number;
  ctrlKey: boolean;
  altKey: boolean;
  shiftKey: boolean;
};

export default function Keycode() {

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
            <li
              key={`hist-item-${i}`}>
              <pre>{`${item.key} (keycode: ${item.keyCode})${item.ctrlKey ? ' [CTRL]' : ''}${item.altKey ? ' [ALT]' : ''}${item.shiftKey ? '[SHIFT]' : ''}`}</pre>
            </li>
          ))
        }
      </ul>
    </div>
  )
}
