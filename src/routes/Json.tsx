import { useCallback, useState } from "react";
import TextArea from "../components/TextArea";
import ErrorPanel from "../components/ErrorPanel";
import Button from "../components/Button";

export default function Json() {

    const [json, setJson] = useState<string>();
    const [error, setError] = useState<string>();
    const [jsonPretty, setJsonPretty] = useState<string>();

    const topretty = useCallback(() => {
        if (json) {
            try {
                setJsonPretty(JSON.stringify(JSON.parse(json), null, 2));
            } catch (err) {
                setError(`${err}`);
            }
        }

    }, [json]);

    return (
        <div>
            <h1>JSON</h1>
            <TextArea className="w-full font-mono min-h-[10em]" value={json} onChange={e => setJson(e.target.value)} placeholder="Enter json string..." />
            <Button disabled={json ? false : true} onClick={topretty}>Read</Button>
            <pre>{jsonPretty}</pre>
            <ErrorPanel error={error} label="Error:" />
        </div>
    )
}