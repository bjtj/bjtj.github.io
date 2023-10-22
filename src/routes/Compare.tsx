import { useEffect, useState, useCallback } from 'react';
import TextArea from '../components/TextArea';
import Button from '../components/Button';
import Spinner from '../components/Spinner';
import diff from 'fast-diff';

type Change = [number, string];
type DiffReport = {
  name: string;
  value: string | number;
}

const KB = 1024;

export default function Compare() {
  const [equals, setEquals] = useState<boolean>(false);
  const [text1, setText1] = useState<string>(localStorage.getItem('diff-text1') ?? '');
  const [text2, setText2] = useState<string>(localStorage.getItem('diff-text2') ?? '');
  const [diffChanges, setDiffChanges] = useState<Change[]>([]);
  const [diffReports, setDiffReports] = useState<DiffReport[]>([]);
  const [warning, setWarning] = useState<string>();
  const [processing, setProcessing] = useState<boolean>(false);

  const [refUrl] = useState<string>('https://github.com/jhchen/fast-diff');

  const testEquals = useCallback(() => {
    setEquals(text1 === text2);
  }, [text1, text2]);

  useEffect(() => {
    testEquals();
    if (text1.length >= 10 * KB || text2.length >= 10 * KB) {
      setWarning('It may takes too long time.');
    } else {
      setWarning('');
    }
  }, [text1, text2, testEquals]);

  const onClickDiff = () => {
    if (warning) {
      if (!window.confirm(`You should remind the wraning\nWARNING: ${warning}`)) {
        return;
      }
    }
    setProcessing(true);
    doDiff().finally(() => {
      setProcessing(false);
    });
  }

  const doDiff = useCallback(async () => {
    
    try {
      let tick = new Date().getTime();
      let ret = diff(text1, text2, 1);
      setDiffChanges(ret);
      let elapsed = new Date().getTime() - tick;
      setDiffReports([
        {
          name: 'Elapsed',
          value: `${elapsed.toLocaleString()} ms.`,
        },
        {
          name: 'Added',
          value: ret.reduce((cnt, i) => cnt + (i[0] > 0 ? 1 : 0), 0).toLocaleString(),
        },
        {
          name: 'Removed',
          value: ret.reduce((cnt, i) => cnt + (i[0] < 0 ? 1 : 0), 0).toLocaleString(),
        },
      ]);
    } finally {
      
    }
  }, [text1, text2]);

  return (
    <div className="flex flex-col items-start justify-start h-full">
      <h1 className="shrink-0">Compare <span className="text-sm font-light">by </span><a className="text-sm font-light" href={refUrl} target="_blank" rel="noreferrer">{refUrl}</a></h1>
      <div className="flex items-center gap-3">
        <Button onClick={onClickDiff}>Diff</Button>
        {warning && (
          <p className="text-sm border border-red-500 bg-red-300/50 px-3 py-0.5 rounded-full text-red-600">
            <strong>Warning:</strong> {warning}
          </p>)}
      </div>
      <p>Equals: {equals ? (<span className="text-green-500 font-bold">YES</span>) : (<span className="text-red-500 font-bold">NO</span>)}</p>
      <div className="w-full flex gap-1 grow overflow-hidden">
        <TextEditView
          className="w-full"
          title="Text1:"
          label="diff-text1"
          value={text1}
          onChange={e => setText1(e.target.value)}
          placeholder="Type..." />
        <TextEditView
          className="w-full"
          title="Text2:"
          label="diff-text2"
          value={text2}
          onChange={e => setText2(e.target.value)}
          placeholder="Type..." />
        <div
          className="relative flex flex-col w-full whitespace-pre-wrap overflow-x-auto overflow-y-hidden">
          <div>{processing && <Spinner size="sm" />} Diff result:</div>
          <div className="p-1 bg-gray-200 grow overflow-y-auto">
            {
              diffChanges.map((change, i) => (
                <span
                  key={`change-${i}`}
                  className={`min-w-[1em] h-[1em] font-mono
${change[0] > 0 && 'bg-green-500 text-green-100'}
 ${change[0] < 0 && 'bg-red-500 text-red-100'}`}>
                  {change[1]}
                </span>
              ))
            }
            
          </div>
          <InfoBox className="absolute right-5 bottom-1">
            <ul className="whitespace-nowrap text-right">
              {
                diffReports.map(report => (
                  <li>{report.name}: {report.value}</li>
                ))
              }
            </ul>
          </InfoBox>
        </div>
      </div>
    </div>
  );
}

type TextEditViewProps = {
  title?: string;
  label: string;
} & React.InputHTMLAttributes<HTMLTextAreaElement>;

function TextEditView({title, label, className, value, onChange, ...others}: TextEditViewProps) {
  const [length, setLength] = useState<number>(0);
  const [saved, setSaved] = useState<boolean>(true);
  useEffect(() => {
    if (typeof(value) === 'string') {
      setLength(value?.length ?? 0);
    }
  }, [value]);

  const saveToLocalStorage = () => {
    if (value && typeof(value) === 'string') {
      localStorage.setItem(label, value);
      setSaved(true);
    }
  };
  
  return (
    <div className={`relative flex flex-col ${className ?? ''}`}>
      { title && (<div>{title}</div>)}
      <Button
        className=""
        variant="sm"
        disabled={saved}
        icon={saved ? "done_outline" : "save"}
        onClick={saveToLocalStorage}>Save to local storage</Button>
      <TextArea
        className="w-full grow font-mono"
        value={value} {...others}
        onChange={e => {
          onChange?.(e);
          setSaved(false);
        }}
      />
      <InfoBox className="absolute right-5 bottom-1">
        <ul className="whitespace-nowrap">
          Length: {length.toLocaleString()}
        </ul>
      </InfoBox>
    </div>
  );
}


type InfoBoxProps = {
} & React.HTMLAttributes<HTMLDivElement>;

function InfoBox({ className, children }: InfoBoxProps) {
  return (
    <div className={`absolute right-5 bottom-1 border p-1 rounded text-sm overflow-hidden bg-white/80 ${className ?? ''}`}>
      {children}
    </div>
  )
}
