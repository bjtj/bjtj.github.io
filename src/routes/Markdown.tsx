import { useEffect, useState, useCallback, useRef } from 'react';
import TextArea from '../components/TextArea';
import Button from '../components/Button';
import ErrorPanel from '../components/ErrorPanel';
import * as Marked from 'marked';

export default function Markdown() {

  const [mdText, setMdText] = useState<string>(localStorage.getItem('markdown-text') ?? '');
  const [htmlText, setHtmlText] = useState<string>();
  const [showCode, setShowCode] = useState<boolean>(false);
  const iframeRef = useRef<HTMLIFrameElement|null>(null);
  const [error, setError] = useState<string>();
  const [copyDone, setCopyDone] = useState<boolean>(false);
  const [saved, setSaved] = useState<boolean>(true);
  const [refUrl] = useState<string>('https://github.com/markedjs/marked');

  const convert = useCallback(() => {
    try {
      if (mdText) {
        setHtmlText(Marked.parse(mdText));
      } else {
        setHtmlText('');
      }
    } catch (err) {
      setError(`${err}`);
    } finally {
    }
  }, [mdText]);

  useEffect(() => {
    convert();
    setCopyDone(false);
  }, [mdText]);

  function copyCode() {
    if (htmlText) {
      navigator.clipboard.writeText(htmlText);
      setCopyDone(true);
    }
  }

  function saveToLocalStorage() {
    localStorage.setItem('markdown-text', mdText);
    setSaved(true);
  }

  return (
    <div className="inline-flex flex-col items-start w-full h-full">
      <h1>Markdown <span className="text-sm font-light">by </span><a className="text-sm font-light" href={refUrl} target="_blank">{refUrl}</a></h1>
      <div className="w-full flex gap-1 grow overflow-hidden relative">
        <div className="w-full flex flex-col pl-[1px]">
          <TextArea
            className="w-full grow" value={mdText}
            onChange={e => {
              setMdText(e.target.value);
              setSaved(false);
            }}
            placeholder="Type markdown..."
          />
          <Button
            className=""
            variant="sm"
            icon={saved ? "done_outline" : "content_copy"}
            disabled={saved}
            onClick={saveToLocalStorage}
          >Save to local storage</Button>
        </div>
        <div className="w-full h-full border border-gray-400 rounded overflow-auto">
          <div className={`relative w-full h-full `}>
            <pre className={`w-full h-full bg-gray-100/50 text-sm ${showCode ? '' : 'hidden'}`}>{htmlText}</pre>
            <iframe ref={iframeRef} className={`w-full h-full ${showCode ? 'hidden' : ''}`} srcDoc={htmlText}></iframe>
            <Button
              className="absolute right-1 top-0"
              variant="sm"
              icon={copyDone ? "done_outline" : "content_copy"}
              onClick={copyCode}
              disabled={!htmlText}></Button>
          </div>
          <div className="absolute right-1 bottom-0">
            <Button onClick={() => setShowCode(!showCode)}>{showCode ? 'show html' : 'show code'}</Button>
          </div>
        </div>
      </div>
      
      <ErrorPanel error={error} label="Error:" />
    </div>
  );
}
