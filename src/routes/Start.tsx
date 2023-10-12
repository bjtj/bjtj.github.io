import { useEffect, useState } from "react";

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
      <h1 className="pointer-events-none select-none">Tools</h1>
      {myip && (<p><strong>Your IP: </strong><code className="inline text-sm">{myip}</code> (by
      <a className="px-1 py-0.5 rounded bg-blue-200/50 border border-blue-500 mx-1" href="https://www.ipify.org/">ipfy</a>)</p>)}
    </div>
  );
}
