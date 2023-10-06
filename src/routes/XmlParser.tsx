import { useState, useCallback } from 'react';
import Button from '../components/Button';
import TextArea from '../components/TextArea';

const parser = new DOMParser();

export default function XmlParser() {

    const [text, setText] = useState<string>();
    const [error, setError] = useState<string>();

    const parse = useCallback(() => {
        if (text) {
            try {
                let ret = parser.parseFromString(text, 'application/xml');
                console.log(ret);
            } catch (err) {
                setError(`${err}`);
            }
        }
    }, [text]);

    return (
        <div>
            <h1>Xml Parser</h1>
            <TextArea className="w-full min-h-[450px] font-mono" value={text} onChange={e => setText(e.target.value)} />
            <Button onClick={parse}>Parse</Button>
            { error && (
                  <>
                      <h2>Error:</h2>
                      <div className="border border-red-600 bg-red-300/10 text-red-600 p-3">{error}</div>
                  </>)
            }
        </div>
    );
}
