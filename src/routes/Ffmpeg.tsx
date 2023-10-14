import { useEffect, useState, useRef, useCallback, useLayoutEffect } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import Button from '../components/Button';

export default function Ffmpeg() {
  const [loaded, setLoaded] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const ffmpegRef = useRef(new FFmpeg());
  const [refUrl] = useState<string>('https://ffmpegwasm.netlify.app/');

  const load = async () => {
    try {
      setLoading(true);
      const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.4/dist/umd';
      const ffmpeg = ffmpegRef.current;
      // toBlobURL is used to bypass CORS issue, urls with the same
      // domain can be used directly.
      await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
      });

      setLoaded(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <h1 className="shrink-0">FFMPEG <span className="text-sm font-light">by </span><a className="text-sm font-light" href={refUrl} target="_blank">{refUrl}</a></h1>

      <div className="flex flex-col grow justify-start items-start overflow-y-hidden">
        { !loaded ?
          (<Button
             onClick={load}
             processing={loading}
             disabled={loading}>Load ffmpeg-core (~31 MB)</Button>) :
          (<MainView ffmpeg={ffmpegRef.current} />) }
      </div>

    </div>);
}


type MainViewProps = {
  ffmpeg: FFmpeg;
};

type Size = {
  width: number;
  height: number;
};

function ratio(size: Size) {
  let {width: w, height: h} = size;
  if (w === 0) {
    return 0;
  }
  if (h === 0) {
    return 1;
  }
  return w / h;
}

function MainView({ffmpeg} : MainViewProps) {

  const [logs, setLogs] = useState<string[]>([]);
  const [file, setFile] = useState<File>();
  const [imageUrl, setImageUrl] = useState<string>();
  const [imageFilenames, setImageFilenames] = useState<string[]>([]);
  const lastRef = useRef<HTMLDivElement>(null);
  const [currentFilename, setCurrentFilename] = useState<string>();
  const imgParentRef = useRef<HTMLDivElement|null>(null);
  const [imgParentSize, setImgParentSize] = useState<Size>({width: 0, height: 0});
  const [imgSize, setImgSize] = useState<Size>({width: 0, height: 0});

  const onImgParentRef = useCallback((parent: HTMLDivElement|null) => {
    if (imgParentRef.current) {
      /*  */
    }

    if (parent) {
      const {width, height} = parent.getBoundingClientRect();
      setImgParentSize({
        width, height
      });
    }

    imgParentRef.current = parent;
  }, []);

  function onLog({message} : {message: string}) {
    setLogs(prev => ([...prev, message]));
    console.log(message);
  }

  const onResize = () => {
    if (imgParentRef.current) {
      const {width, height} = imgParentRef.current.getBoundingClientRect();
      setImgParentSize({
        width, height
      });
    }
  };

  useEffect(() => {
    ffmpeg.on('log', onLog);
    window.addEventListener('resize', onResize);
    return () => {
      ffmpeg.off('log', onLog);
      window.removeEventListener('resize', onResize);
    }
  }, []);

  useEffect(() => {
    lastRef.current?.scrollIntoView({behavior: 'smooth'});
  }, [logs]);

  const extractFrames = async (file: File) => {
    setImageUrl('');
    setImageFilenames([]);
    setCurrentFilename('');
    await ffmpeg.writeFile(file.name, await fetchFile(file));
    try {
      let filenames = (await ffmpeg.listDir('/frames/'))
        .filter(i => i.isDir == false && i.name !== '.' && i.name !== '..')
        .map(i => i.name);
      for (var i = 0; i < filenames.length; i++) {
        console.log(`delete file - ${filenames[i]}`);
        await ffmpeg.deleteFile(`/frames/${filenames[i]}`);
      }
    } catch (err) {
      console.error(err);
    }
    try {
      await ffmpeg.createDir('/frames');
    } catch (err) {
      console.log(err);
    }
    await ffmpeg.exec(['-i', file.name, '/frames/frame-%06d.bmp']);

    let imageFilenames = (await ffmpeg.listDir('/frames')).filter(info => info.isDir == false && info.name.endsWith('.bmp')).map(info => info.name);

    setImageFilenames(imageFilenames);
  };

  const read = async (name: string) => {
    const data = await ffmpeg.readFile(name);
    setImageUrl(URL.createObjectURL(new Blob([data], { type: 'image/bmp' })));
    setCurrentFilename(name);
  };

  const clearLog = useCallback(() => {
    setLogs([]);
  }, [logs]);
  
  return (
    <div className="relative flex flex-col w-full h-full overflow-auto  p-[1px]">
      <div className="flex items-center gap-1 px-2 border rounded">
        <input
          className="grow"
          type="file"
          onChange={e => e.target.files && setFile(e.target.files[0])}
          accept="video/mp4,video/x-m4v,video/*" />
        <Button onClick={() => file && extractFrames(file)} disabled={!file}><div className="whitespace-nowrap">Extract frames</div></Button>
      </div>

      <div className="flex gap-1 shrink-0 max-h-[70%] aspect-video overflow-hidden border border-black">
        <div
          ref={onImgParentRef}
          className="relative grow bg-black/60 overflow-auto flex items-center justify-center">
          {imageUrl && (
            <img
              className={`${ratio(imgParentSize) > ratio(imgSize) ? 'h-full' : 'w-full'}`}
              src={imageUrl}
              onLoad={e => {
                setImgSize({width: e.currentTarget.naturalWidth, height: e.currentTarget.naturalHeight });
              }} />)}
          {currentFilename && (
            <div
              className="absolute left-1 top-1 bg-white/50 px-1 rounded">
              {currentFilename}
            </div>)}
        </div>
        { imageFilenames.length > 0 && (
            <ul className="shrink-0 overflow-x-hidden overflow-y-auto">
              {
                imageFilenames.map((name, i) => (
                  <li key={`file-${i}`}>
                    <Button
                      className="whitespace-nowrap" variant="sm"
                      onClick={() => read(`/frames/${name}`)}
                      disabled={currentFilename === `/frames/${name}`}>{name}</Button>
                  </li>))
              }
            </ul>) }
      </div>

      <div className="p-1 grow min-h-[100px] bg-gray-500 overflow-auto border border-black">
        <ul className="h-full">
          {
            logs.map((log, i) => (<li key={`log-${i}`}><pre className="whitespace-pre text-sm text-gray-100">{log}</pre></li>))
          }
          <div ref={lastRef}></div>
        </ul>
      </div>
      <Button className="fixed right-5 bottom-10" variant="sm" onClick={clearLog}>Clear Logs</Button>
    </div>);
}
