import { useEffect, useState } from "react";
import TossLogoPng from '../assets/logo-toss-symbol-alpha.png';
import Divider from '../components/Divider';

export default function Start() {

  const [myip, setMyip] = useState<string>();

  function getMyIp() {
    fetch('https://api64.ipify.org?format=json', {
      mode: 'cors'
    })
      .then(response => response.json())
      .then(data => setMyip(data.ip));
  }

  useEffect(() => {
    getMyIp()
  }, []);

  return (
    <div className="w-full h-full flex flex-col justify-center items-center">
      <h1 className="pointer-events-none select-none">HandTools</h1>
      {myip && (<p><strong>Your IP: </strong><code className="inline text-sm">{myip}</code> (by
        <a className="px-1 py-0.5 rounded bg-blue-200/50 border border-blue-500 mx-1" href="https://www.ipify.org/">ipfy</a>)</p>)}
      <Divider className="w-[20em] max-w-[80%]" />
      <div className="flex gap-3">
        <a href="https://toss.me/uridongsu">
          <img className="inline" src={TossLogoPng} width={20} height={20} alt="toss" />토스
        </a>
      </div>
    </div>
  );
}
