import { useState, useEffect } from 'react';
import * as hp from "@thi.ng/hiccup-html-parse";
import TextArea from "../components/TextArea";

type HtmlToHiccupProps = {}

function HtmlToHiccup(_: HtmlToHiccupProps) {
  const [html, setHtml] = useState<string>('');
  const [hiccup, setHiccup] = useState<string>('');
  const [err, setErr] = useState<Error|null>();

  useEffect(() => {
    let parseResult = hp.parseHtml(html);
    setErr(parseResult.err);
    if (!parseResult.err && parseResult.result) {
      setHiccup(JSON.stringify(parseResult.result));
    }
  }, [html]);
  
  return (
    <div>
      <h1 className="shrink-0">Hiccup
        <span className="text-sm font-light mx-[0.25em]">by</span>
        <a className="text-sm font-light" href="https://codeberg.org/thi.ng/umbrella/src/branch/develop/packages/hiccup-html-parse" target="_blank" rel="noreferrer noopener">https://codeberg.org/thi.ng/umbrella/src/branch/develop/packages/hiccup-html-parse</a>
      </h1>
      <h2>XML to Hiccup</h2>
      <div className="flex gap-2">
        <TextArea className="grow"
          value={html ?? ''} onChange={e => setHtml(e.target.value)}></TextArea>
        <TextArea className="grow"
          value={hiccup ?? ''} onChange={e => setHiccup(e.target.value)}
          readOnly={true}
        ></TextArea>
      </div>
      {err ? (<p className="text-red-500">{err.message}</p>) : null}
    </div>);
}

export default function Hiccup() {
  return (
    <div>
      <HtmlToHiccup />
    </div>)
}
