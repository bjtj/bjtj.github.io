import { useState, useEffect } from 'react';
import * as hp from "@thi.ng/hiccup-html-parse";
import TextArea from "../components/TextArea";
import Button from "../components/Button";

type JSONValue =
  | string
  | number
  | boolean
  | null
  | JSONValue[]
  | { [key: string]: JSONValue };

function stringifyHiccup(value: JSONValue, indent = 2, level = 0): string|null {
  const nextSpace = " ".repeat(indent * (level + 1));

  // array
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return "[]";
    }
    const [first, ...rest] = value as JSONValue[];
    if (typeof first !== 'string') {
      const items = value
        .map(
          (v) => stringifyHiccup(v, indent, level + 1)
        ).filter(
          v => v !== null
        );
      return `[${items.join("\n" + nextSpace)}]`;
    } else {
      const items = rest
        .map(
          (v) => stringifyHiccup(v, indent, level + 1)
        ).filter(
          v => v !== null
        );
      return `[:${first}${items.length === 0 ? "" : ("\n" + nextSpace)}${items.join("\n" + nextSpace)}]`;
    }
  }

  // object
  if (value && typeof value === 'object') {
    const keys = Object.keys(value);
    if (keys.length === 0) {
      return null;
    }

    const items = keys.map(
      (k) => `:${k} ${stringifyHiccup((value as Record<string, JSONValue>)[k], indent, level + 1)}`
    ).filter(
      v => v !== null
    );

    return `{${items.join("\n" + nextSpace)}}`;
  }

  // primitive
  return JSON.stringify(value);
}

type HtmlToHiccupProps = {}

function HtmlToHiccup(_: HtmlToHiccupProps) {
  const [html, setHtml] = useState<string>(localStorage.getItem('hiccup-html-text') ?? '');
  const [hiccup, setHiccup] = useState<string>('');
  const [err, setErr] = useState<Error|null>();
  const [saved, setSaved] = useState<boolean>(true);

  function saveToLocalStorage() {
    localStorage.setItem('hiccup-html-text', html);
    setSaved(true);
  }

  useEffect(() => {
    let parseResult = hp.parseHtml(html,
      {
        whitespace: false,
        collapse: true,
        comments: true,
        doctype: false
      });
    setErr(parseResult.err);
    if (!parseResult.err && parseResult.result) {
      setHiccup(stringifyHiccup(parseResult.result) ?? "");
    }
  }, [html]);
  
  return (
    <div className="inline-flex flex-col w-full h-full">
      <h1 className="shrink-0">Hiccup
        <span className="text-sm font-light mx-[0.25em]">by</span>
        <a className="text-sm font-light" href="https://codeberg.org/thi.ng/umbrella/src/branch/develop/packages/hiccup-html-parse" target="_blank" rel="noreferrer noopener">https://codeberg.org/thi.ng/umbrella/src/branch/develop/packages/hiccup-html-parse</a>
      </h1>
      <h2>XML to Hiccup</h2>
      <div>
        {err ? (<p className="text-red-500">{err.message}</p>) : null}
      </div>
      <div className="flex gap-1 grow w-full overflow-hidden">
        <div className="flex flex-col flex-1">
          <TextArea
            className="w-full grow"
            value={html ?? ''} onChange={e => {
            setHtml(e.target.value);
            setSaved(false);
          }}
          placeholder="HTML or XML..."></TextArea>
          <Button
            className=""
            variant="sm"
            icon={saved ? "done_outline" : "content_copy"}
            disabled={saved}
            onClick={saveToLocalStorage}
          >Save to local storage</Button>
        </div>
        <div className="flex flex-col flex-1">
          <TextArea
            className="w-full grow bg-base-300"
            value={hiccup ?? ''} onChange={e => setHiccup(e.target.value)}
            readOnly={true}></TextArea>
        </div>
      </div>
    </div>);
}

export default function Hiccup() {
  return (<HtmlToHiccup />);
}
