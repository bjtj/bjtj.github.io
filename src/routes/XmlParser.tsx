import { useState, useCallback } from 'react';
import Button from '../components/Button';
import TextArea from '../components/TextArea';
import ErrorPanel from '../components/ErrorPanel';

const parser = new DOMParser();

export default function XmlParser() {

  const [text, setText] = useState<string>();
  const [result, setResult] = useState<string>();
  const [error, setError] = useState<string>();

  const parse = useCallback(() => {
    if (text) {
      try {
        let doc = parser.parseFromString(text, 'application/xml');
        console.log(doc);
        const errorNode = doc.querySelector("parsererror");
        if (errorNode) {
          // parsing failed
          setError(`${errorNode}`);
        } else {
          // parsing succeeded
          setResult('success.');
        }
      } catch (err) {
        setError(`${err}`);
      }
    }
  }, [text]);

  return (
    <div>
      <h1>Xml Parser</h1>
      <TextArea
        className="w-full min-h-[450px] font-mono"
        value={text}
        onChange={e => setText(e.target.value)} />
      <Button onClick={parse}>Parse</Button>
      <div>
        {result}
      </div>
      <ErrorPanel error={error} label="Error" />
    </div>
  );
}
