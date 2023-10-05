import { useState } from 'react';
export default function XmlParser() {

  const [text, setText] = useState<string>();

  return (
    <div>
      <h1>Xml Parser</h1>
      <div>{text}</div>
    </div>
  );
}
