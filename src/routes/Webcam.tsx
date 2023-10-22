import { useRef, useState, useCallback } from "react";
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
      {status && (<p>Status: {status}</p>)}
      <ErrorPanel error={error} />
      { !confirm ? (
          <Button onClick={() => setConfirm(true)}>Enable Webcam</Button>
      ) : (
          <WebCamView setStatus={setStatus} setError={setError} />
        )}
    </div>
  )
}


type WebCamViewProps = {
  setStatus: (status: string) => void;
  setError: (error: string) => void;
}

function WebCamView({setStatus, setError}: WebCamViewProps) {
  const webcamRef = useRef<Webcam>(null);
  const [image, setImage] = useState<string>();

  const capture = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (!imageSrc) {
        setError('Failed to get screenshot');
        return;
      }
      setImage(imageSrc);
    }
  }, [webcamRef, setError]);

  function getFilename() {
    let date = new Date();
    return `${date.getFullYear()}${(date.getMonth()+1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}_${date.getHours().toString().padStart(2, '0')}${date.getMinutes().toString().padStart(2, '0')}${date.getSeconds().toString().padStart(2, '0')}`;
  }

  const download = useCallback(() => {
    if (image) {
      let link = document.createElement('a');
      link.href = image;
      link.download = `Screenshot_${getFilename()}.jpeg`;
      link.click();
    }
  }, [image]);

  return (
    <div>
      <Webcam
        ref={webcamRef}
        className="border my-3 bg-black/50"
        onUserMedia={(stream) => {
          setStatus('OPENED');
        }}
        onUserMediaError={(e) => {
          setStatus('FAILED');
          setError(`${e}`);
        }}
        audio={false}
        screenshotFormat="image/jpeg"
      />
      <Button onClick={capture}>Capture</Button>
      {
        image && (<div className="relative border w-fit">
          <img src={image} alt="screenshot" />
          <Button
            className="absolute right-1 top-0"
            variant="sm"
            onClick={download}
            icon="download"
          >Download</Button>
        </div>)
      }
    </div>
  )
}
