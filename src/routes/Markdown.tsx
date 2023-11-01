import { useEffect, useState, useCallback, useRef } from 'react';
import TextArea from '../components/TextArea';
import Button from '../components/Button';
import ErrorPanel from '../components/ErrorPanel';
import * as Marked from 'marked';
import {markedHighlight} from "marked-highlight";
import hljs from 'highlight.js';
import markedKatex from "marked-katex-extension";

Marked.use(markedHighlight({
  langPrefix: 'hljs language-',
  highlight(code, lang) {
    const language = hljs.getLanguage(lang) ? lang : 'plaintext';
    return hljs.highlight(code, { language }).value;
  }
}));

Marked.use(markedKatex({ throwOnError: false }));

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
  }, [mdText, convert]);

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

  const wrapHtml = useCallback((text: string) => {
    return `<html>
<head>
<link rel="stylesheet" as="style" href="md.css" />
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css" integrity="sha384-GvrOXuhMATgEsSwCs4smul74iXGOixntILdUW9XmUC6+HX0sLNAK3q71HotJqlAn" crossorigin="anonymous">
</head>
<body>${text}</body>
</html>`;
  }, []);

  return (
    <div className="inline-flex flex-col items-start w-full h-full">
      <h1>Markdown <span className="text-sm font-light">by </span><a className="text-sm font-light" href={refUrl} target="_blank" rel="noreferrer">{refUrl}</a></h1>
      <div className="w-full flex gap-1 grow overflow-hidden relative">
        <div className="w-full flex flex-col pl-[1px]">
          <TextArea
            className="w-full grow font-mono"
            value={mdText}
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
            <iframe
              ref={iframeRef}
              title="HTML Preview"
              className={`w-full h-full ${showCode ? 'hidden' : ''}`}
              srcDoc={wrapHtml(htmlText ?? '')}></iframe>
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
