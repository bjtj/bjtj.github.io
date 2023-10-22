import { useEffect, useState, useRef, useCallback, } from 'react';
import { FFmpeg, } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL, } from '@ffmpeg/util';
import Button from '../components/Button';
import Input from '../components/Input';
import Icon from '../components/Icon';
import { createPortal } from 'react-dom';
import { getType } from 'mime';
import { toast } from 'react-toastify';

type LogEvent = {
  type: string;
  message: string;
};

type FSNode = {
  name: string;
  isDir: boolean;
}

export default function Ffmpeg() {
  const [loaded, setLoaded] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const ffmpegRef = useRef<FFmpeg>(new FFmpeg());
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
      <h1 className="shrink-0">FFMPEG <span className="text-sm font-light">by </span><a className="text-sm font-light" href={refUrl} target="_blank" rel="noreferrer">{refUrl}</a></h1>

      <div className="flex flex-col grow justify-start items-start overflow-y-hidden px-[1px]">
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

  const [logs, setLogs] = useState<LogEvent[]>([]);
  const [file, setFile] = useState<File>();
  const [imageUrl, setImageUrl] = useState<string>();
  const [videoUrl, setVideoUrl] = useState<string>();
  const lastRef = useRef<HTMLDivElement>(null);
  const [currentFilePath, setCurrentFilePath] = useState<string>();
  const imgParentRef = useRef<HTMLDivElement|null>(null);
  const [imgParentSize, setImgParentSize] = useState<Size>({width: 0, height: 0});
  const [imgSize, setImgSize] = useState<Size>({width: 0, height: 0});
  const [currentDir, setCurrentDir] = useState<string>('/');
  const [fileList, setFileList] = useState<FSNode[]>();
  const [showImage, setShowImage] = useState<boolean>(false);
  const [command, setCommand] = useState<string>(localStorage.getItem('ffmpeg-command') ?? '');

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

  function onLog(event : LogEvent) {
    setLogs(prev => ([...prev, event]));
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
  }, [ffmpeg]);

  useEffect(() => {
    lastRef.current?.scrollIntoView({behavior: 'smooth'});
  }, [logs]);

  const readCommand = useCallback(() => {
    if (!command) {
      return null;
    }

    const reg = /("[^"]+"|[^\s"]+)/gmi;
    let args = [];
    let result: RegExpExecArray|null = null;
    while ((result = reg.exec(command)) != null) {
      let arg = result[1];
      if (arg.startsWith('"')) {
        arg = arg.slice(1);
      }
      if (arg.endsWith('"')) {
        arg = arg.slice(0, arg.length - 1);
      }
      args.push(arg);
    }
    return args;
  }, [command]);

  const executeCommand = useCallback(async () => {
    try {
      if (!command) {
        return;
      }
      let args = readCommand();
      if (!args) {
        toast.error('NO ARGUMENT');
        return;
      }
      localStorage.setItem('ffmpeg-command', command);
      let ret = await ffmpeg.exec(args);
      if (ret === 0) {
        toast(`Success`);
      } else {
        toast.error(`Failed (result: ${ret})`);
      }
    } catch (err) {
      toast.error(`${err}`);
    }
  }, [ffmpeg, readCommand, command]);

  const readImage = async (filepath: string, mimetype: string) => {
    const data = await ffmpeg.readFile(filepath);
    setImageUrl(URL.createObjectURL(new Blob([data], { type: mimetype })));
    setCurrentFilePath(filepath);
    setVideoUrl('');
  };

  const readVideo = async (filepath: string, mimetype: string) => {
    const data = await ffmpeg.readFile(filepath);
    setVideoUrl(URL.createObjectURL(new Blob([data], { type: mimetype })));
    setCurrentFilePath(filepath);
    setImageUrl('');
  };

  const clearLog = useCallback(() => {
    setLogs([]);
  }, []);

  const getParentDir = useCallback(() => {
    let tokens = currentDir.split('/').filter(x => x);
    if (tokens.length === 0) {
      return '/';
    }
    return '/' + tokens.slice(0, tokens.length - 1).join('/');
  }, [currentDir]);

  const loadDir = useCallback(() => {
    ffmpeg.listDir(currentDir)
          .then(list => {
            setFileList(list);
          });
  }, [ffmpeg, currentDir]);

  useEffect(() => {
    loadDir();
  }, [loadDir, currentDir]);

  const joinPathes = (dir1: string, dir2: string) => {
    if (dir1 === '/') {
      return `/${dir2}`;
    }
    return `${dir1}/${dir2}`
  }

  const transferFile = useCallback(async () => {
    if (file) {
      await ffmpeg.writeFile(joinPathes(currentDir, file.name), await fetchFile(file));
      loadDir();
    }
  }, [file, currentDir, ffmpeg, loadDir]);
  
  return (
    <div className="relative flex flex-col w-full h-full overflow-auto p-[1px]">

      
      <div className="flex items-center gap-1 px-2 border rounded-lg bg-gray-100 mb-1">
        <input
          className="grow"
          type="file"
          onChange={e => e.target.files && setFile(e.target.files[0])}
          accept="video/mp4,video/x-m4v,video/*" />
        <Button onClick={() => {
          transferFile();
        }}>
          Fetch
        </Button>
      </div>

      <div className="flex gap-1 items-center">
        <Input
          className="w-full"
          value={command}
          onChange={e => setCommand(e.target.value)}
          placeholder="Command... e.g.) -i video.mp4 frame-%06d.bmp"
        />
        <Button className="" onClick={executeCommand}>Execute</Button>
      </div>
      <div className="flex gap-1 shrink-0 max-h-[70%] aspect-video overflow-hidden">
        <div
          ref={onImgParentRef}
          className="relative w-full bg-black/60 overflow-auto flex items-center justify-center">

          {videoUrl && (
            <video src={videoUrl} autoPlay controls></video>
          )}
          
          {imageUrl && (
            <>
              <img
                className={`${ratio(imgParentSize) > ratio(imgSize) ? 'h-full' : 'w-full'}`}
                src={imageUrl}
                onClick={() => {
                  setShowImage(!showImage);
                }}
                onLoad={e => {
                  setImgSize({width: e.currentTarget.naturalWidth, height: e.currentTarget.naturalHeight });
                }}
                alt="preview"
              />
              {
                showImage && createPortal(
                  <div
                    className="fixed inset-0 flex justify-center items-center bg-black/70"
                    onClick={() => setShowImage(!showImage)}>
                    <img src={imageUrl} alt="preview" />
                  </div>,
                  document.body
                )
              }
            </>)}
          {currentFilePath && (
            <div
              className="absolute left-1 top-1 bg-white/50 px-1 rounded">
              {currentFilePath}
            </div>)}
    </div>
    {
      fileList && (
        <FileList
          className="w-full overflow-hidden"
          currentDir={currentDir}
          list={fileList}
          onRefresh={() => {
            loadDir();
          }}
          onParent={() => {
            setCurrentDir(getParentDir());
          }}
          onChild={name => {
            setCurrentDir(joinPathes(currentDir, name));
          }}
          onFile={name => {
            let ext = name.split('.').pop();
            if (ext) {
              let mimetype = getType(ext);
              if (mimetype) {
                if (mimetype.startsWith('image')) {
                  if (imgParentRef.current) {
                    const {width, height} = imgParentRef.current.getBoundingClientRect();
                    setImgParentSize({
                      width, height
                    });
                  }
                  readImage(joinPathes(currentDir, name), mimetype);
                }
                if (mimetype.startsWith('video')) {
                  readVideo(joinPathes(currentDir, name), mimetype);
                }
              }
            }
          }}
          createDirectory={name => {
            ffmpeg.createDir(joinPathes(currentDir, name))
                  .then(() => {
                    loadDir();
                  }).catch(err => {
                    toast.error(`${err}`);
                  });
            
          }}
          removeDirectory={name => {
            ffmpeg.deleteDir(joinPathes(currentDir, name))
                  .then(() => {
                    loadDir();
                  }).catch(err => {
                    toast.error(`${err}`);
                  });
          }}
          removeFile={name => {
            ffmpeg.deleteFile(joinPathes(currentDir, name))
                  .then(() => {
                    loadDir();
                  }).catch(err => {
                    toast.error(`${err}`);
                  });
          }}
          rename={(oldName, newName) => {
            ffmpeg.rename(joinPathes(currentDir, oldName), joinPathes(currentDir, newName))
                  .then(() => {
                    loadDir();
                  }).catch(err => {
                    toast.error(`${err}`);
                  });
          }}
          download={(name) => {
            ffmpeg.readFile(joinPathes(currentDir, name)).then(data => {
              let ext = name.split('.').pop();
              let mimetype = getType(ext ?? '') ?? 'application/octet-stream';
              let url = URL.createObjectURL(new Blob([data], { type: mimetype }));
              let link = document.createElement('a');
              link.href = url;
              link.download = name;
              link.click();
            });
          }}
        />
      )
    }
    </div>

    <div className="p-1 grow min-h-[100px] bg-gray-600 overflow-hidden relative">
      <ul className="h-full overflow-auto">
        {
          logs.map((log, i) => (<li key={`log-${i}`}>
            <pre className={`whitespace-pre text-sm text-gray-100 ${log.type === 'stderr' ? 'text-red-500' : ''}`}>{log.message}</pre>
          </li>))
        }
        <div ref={lastRef}></div>
      </ul>
      <Button
        className="absolute right-5 bottom-5" variant="sm" onClick={clearLog}
        icon="clear_all"
      >
        Clear Logs
      </Button>
    </div>
    
    </div>);
}


type FileListProps = {
  className?: string;
  currentDir: string;
  list: FSNode[];
  onRefresh: () => void;
  onParent: () => void;
  onChild: (name: string) => void;
  onFile: (name: string) => void;
  createDirectory: (name: string) => void;
  removeFile: (name: string) => void;
  removeDirectory: (name: string) => void;
  rename: (oldName: string, newName: string) => void;
  download: (name: string) => void;
}

function FileList({
  className, currentDir, list, onRefresh, onParent, onChild, onFile, createDirectory, removeFile, rename, removeDirectory, download
  
}: FileListProps) {

  const [dirName, setDirName] = useState<string>();
  const [showCreateDir, setShowCreateDir] = useState<boolean>(false);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState<boolean>(false);
  const selectedNode = useRef<FSNode>();
  
  return (
    <div className={`flex flex-col ${className ?? ''}`}>
      <h2 className="shrink-0">File List</h2>
      <div className="flex gap-1 px-[1px] overflow-x-auto shrink-0">
        <Button
          variant="sm"
          onClick={onParent}
          disabled={currentDir === '/'}
          icon="arrow_upward"
        >
          Up
        </Button>
        <Button
          variant="sm"
          onClick={onRefresh}
          icon="refresh"
        >
          Refresh
        </Button>
        <Button
          variant="sm"
          icon="add"
          onClick={() => {
            setShowCreateDir(true);
            setDirName('');
          }}
        >
          Dir
        </Button>
      </div>
      {
        showCreateDir && (
          createPortal((
            <div className="fixed inset-0 bg-black/70 flex justify-center items-center">
              <div className="bg-white p-5 rounded-lg">
                <Input
                  className="w-full" placeholder="Dir Name..."
                  autoFocus
                  value={dirName}
                  onChange={e => setDirName(e.target.value)}
                />
                <div className="flex items-center gap-1">
                  <Button onClick={() => {
                    if (!dirName) {
                      /* TODO */
                      return;
                    }
                    createDirectory(dirName);
                    setShowCreateDir(false);
                  }}>Create</Button>
                  <Button onClick={() => setShowCreateDir(false)}>Cancel</Button>
                </div>
              </div>
            </div>), document.body)
        )
      }
      <div className="bg-gray-100">{currentDir}</div>
      <div className="overflow-auto">
        <ul>
          {
            list.filter(node => node.name !== '..' && node.name !== '.').map((node, i) => (
              <li className="hover:bg-gray-100 px-1 flex items-center gap-1">
                { node.isDir ? (
                    <button
                      className="flex items-center whitespace-nowrap grow"
                      onClick={() => onChild(node.name)}
                    >
                      <Icon>folder_open</Icon>
                      {node.name}/</button>
                ) : (
                    <>
                      <button
                        className="flex items-center whitespace-nowrap grow"
                        onClick={() => onFile(node.name)}
                      >
                        <Icon>insert_drive_file</Icon>
                        {node.name}
                      </button>
                      <Button icon="download" onClick={() => {
                        if (!node.isDir) {
                          download(node.name);
                        }
                      }} />
                    </>
                ) }
                <Button icon="delete" onClick={() => {
                  selectedNode.current = node;
                  setShowRemoveConfirm(true);
                }} />
              </li>
            ))
          }
        </ul>
      </div>
      {
        showRemoveConfirm && selectedNode.current && createPortal((
          <div className="fixed inset-0 bg-black/70 flex justify-center items-center">
            <div className="bg-white rounded-lg p-5">
              <div>
                <div>Remove {selectedNode.current.isDir ? 'Directory' : 'File'}</div>
                <div>Name: {selectedNode.current.name}</div>
              </div>
              <div className="flex gap-1">
                <Button onClick={() => {
                  setShowRemoveConfirm(false);
                  if (!selectedNode.current) {
                    return;
                  }
                  if (selectedNode.current.isDir) {
                    removeDirectory(selectedNode.current.name);
                  } else { removeFile(selectedNode.current.name);
                  }
                }}>Yes</Button>
                <Button onClick={() => {
                  setShowRemoveConfirm(false);
                }}>No</Button>
              </div>
            </div>
          </div>), document.body)
      }
    </div>
  )
}
