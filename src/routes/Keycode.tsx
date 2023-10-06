import { useState } from 'react';
import Input from '../components/Input';

type KeycodeProps = {
  
};

export default function Keycode({ }:KeycodeProps) {

  const [keycode, setKeycode] = useState<string>();
  
  return (
    <div>
      <h1>Keycode</h1>
      <Input className="font-mono min-w-[20em] text-center" type="text"
        value={keycode}
        onKeyDown={(e) => { setKeycode(`${e.key} (keycode: ${e.keyCode})`) }}
        placeholder="Type any key..." />
    </div>
  )
}
