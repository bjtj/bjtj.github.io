import { useState } from "react";
import Button from "../components/Button";
import ErrorPanel from "../components/ErrorPanel";
import Webcam from "react-webcam";

export default function WebCam() {
  const [confirm, setConfirm] = useState<boolean>(false);
  const [error, setError] = useState<string>();
  const [status, setStatus] = useState<string>('');
  const [refUrl] = useState<string>('https://github.com/mozmorris/react-webcam');

  return (
    <div>
      <h1>Webcam <span className="text-sm font-light">by </span><a className="text-sm font-light" href={refUrl} target="_blank" rel="noreferrer">{refUrl}</a></h1>

      { !confirm && (<Button onClick={() => setConfirm(true)}>Enable Webcam</Button>) }

      {
      confirm && (
      <Webcam
        className="border my-3 bg-black/50"
        onUserMedia={(stream) => {
        setStatus('OPENED');
        }}
        onUserMediaError={(e) => {
        setStatus('FAILED');
        setError(`${e}`);
        }} />)
      }
    {status && (<p>Status: {status}</p>)}
    <ErrorPanel error={error} label="Error:" />
    </div>
  )
}
