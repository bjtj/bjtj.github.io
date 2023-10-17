import { useCallback, useState } from "react";
import TextArea from "../components/TextArea";
import ErrorPanel from "../components/ErrorPanel";
import Button from "../components/Button";
import Divider from '../components/Divider';

export default function Json() {

  const [json, setJson] = useState<string>();
  const [error, setError] = useState<string>();
  const [jsonPretty, setJsonPretty] = useState<string>();
  const [copyDone, setCopyDone] = useState<boolean>(false);
  
  const topretty = useCallback(() => {
    if (json) {
      try {
        setJsonPretty(JSON.stringify(JSON.parse(json), null, 2));
        setCopyDone(false);
        setError('');
      } catch (err) {
        setError(`${err}`);
      }
    }
  }, [json]);

  function copy() {
    if (jsonPretty) {
      navigator.clipboard.writeText(jsonPretty);
    }
    setCopyDone(true);
  }

  return (
    <div>
      <h1>JSON</h1>
      <TextArea
        className="w-full font-mono min-h-[10em]"
        value={json}
        onChange={e => setJson(e.target.value)}
        placeholder="Enter json string..." />
      <Button disabled={json ? false : true} onClick={topretty}>Read</Button>
      <Divider />
      <Button
        icon={copyDone ? "done_outline" : "content_copy"}
        onClick={copy}
        disabled={!jsonPretty || copyDone}
      >Copy</Button>
      <pre className="border p-3 text-sm bg-gray-100">{jsonPretty}</pre>
      <ErrorPanel error={error} label="Error:" />
    </div>
  )
}
