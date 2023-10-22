import { useEffect, useState, useCallback } from 'react';
import TextArea from '../components/TextArea';
import ErrorPanel from '../components/ErrorPanel';
import Button from '../components/Button';


function escapeText(text: string) {
  return text
    .replaceAll('\\', '\\\\')
    .replaceAll('\n', '\\n')
    .replaceAll('\r', '\\r')
    .replaceAll('\t', '\\t')
    .replaceAll('"', '\\"');
}


export default function Text() {

  const [text, setText] = useState<string>(localStorage.getItem('text-text') ?? '');
  const [escapedText, setEscapedText] = useState<string>(escapeText(text));
  const [saved, setSaved] = useState<boolean>(true);
  const [error, setError] = useState<string>();

  const escape = useCallback((text:string) => {
    setEscapedText(escapeText(text));
  }, []);

  const unescape = useCallback((escapedText:string) => {
    try {
      let escaped = eval(`"${escapedText}"`);
      setText(escaped);
      setError('');
    } catch (err) {
      setError(`${err}`);
    }
  }, []);

  const saveToLocalStorage = () => {
    localStorage.setItem('text-text', text);
    setSaved(true);
  };

  useEffect(() => {
    setSaved(text === localStorage.getItem('text-text') ?? '');
  }, [text]);

  return (
    <div className="h-full flex flex-col justify-start">
      <h1>Text</h1>
      <h2>Escape</h2>
      <div className="w-full grow gap-1 flex">
        <div
          className="w-full flex flex-col relative">
          <TextArea
            className="w-full grow"
            value={text}
            onChange={e => {
              setText(e.target.value);
              escape(e.target.value);
            }}
            placeholder="Text..."
          />
          <Button
            className="absolute right-1 top-0"
            icon={saved ? "done_outline" : "save"}
            onClick={saveToLocalStorage}
            disabled={saved}
          />
          <div>Length: {text.length.toLocaleString()}</div>
        </div>
        <div
          className="w-full flex flex-col">
          <TextArea
            className="w-full grow"
            value={escapedText}
            onChange={e => {
              setEscapedText(e.target.value);
              unescape(e.target.value);
            }}
            placeholder="Escaped text..."
          />
          <ErrorPanel className="mb-1" error={error} />
          <div>Length: {escapedText.length.toLocaleString()}</div>
        </div>
      </div>
    </div>
  )
}
