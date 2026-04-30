import { useEffect, useRef, useState, useCallback, ReactNode } from 'react';
import { toast } from 'react-toastify';
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';
import Modal from '@/components/Modal';

declare global {
  interface YT {}
}

(window as any).onYouTubeIframeAPIReady = () => {
  console.log('ready!');
}

const KEY_LAST_VIDEO_ID = 'youtube-last-video-id';
const KEY_LAST_URL = 'youtube-last-url';
const KEY_REPEAT = 'youtube-repeat';
const KEY_AUTOPLAY = 'youtube-autoplay';

type ParseYouTubeUrlResult = {
  videoId: string;
  startTime: number;
};

function parseYouTubeUrl(url: string): ParseYouTubeUrlResult|null {
  const u = new URL(url);
  let videoId = null;
  let time = 0;

  // videoId
  if (u.hostname.includes("youtu.be")) {
    videoId = u.pathname.slice(1);
  } else if (u.pathname.startsWith("/embed/")) {
    videoId = u.pathname.split("/")[2];
  } else if (u.pathname.startsWith("/live/")) {
    videoId = u.pathname.split("/")[2];
  } else if (u.pathname.startsWith("/shorts/")) {
    videoId = u.pathname.split("/")[2];
  } else {
    videoId = u.searchParams.get("v");
  }

  if (videoId === null || videoId === undefined) {
    return null;
  }

  // time
  const t = u.searchParams.get("t") || u.searchParams.get("start");

  if (t) {
    if (/^\d+$/.test(t)) {
      time = parseInt(t, 10);
    } else {
      const match = t.match(/(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?/);
      if (match) {
        const [, h, m, s] = match;
        time = (parseInt(h || '0') * 3600) + (parseInt(m || '0') * 60) + parseInt(s || '0');
      }
    }
  }

  return { videoId, startTime: time };
}

function silent<T>(fn: () => T): T | null {
  try {
    return fn();
  } catch (e) {
    return null;
  }
}

function restoreLastVideoId() {
  return localStorage.getItem(KEY_LAST_VIDEO_ID) ?? 'jNQXAC9IVRw'
}

function saveLastVideoId(vid: string) {
  localStorage.setItem(KEY_LAST_VIDEO_ID, vid);
}

function restoreAutoplay(defval: boolean) {
  let item = localStorage.getItem(KEY_AUTOPLAY);
  if (item === null || item === undefined) {
    return defval;
  }
  return item === 'true';
}

function saveAutoplay(val: boolean) {
  localStorage.setItem(KEY_AUTOPLAY, val ? 'true' : 'false');
}

function restoreLastUrl() {
  return localStorage.getItem(KEY_LAST_URL) ?? '';
}

function restoreRepeat() {
  return localStorage.getItem(KEY_REPEAT) === 'true';
}

function saveRepeat(v: boolean) {
  localStorage.setItem(KEY_REPEAT, v.toString());
}

export default function YouTube() {

  const divRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YT.Player|null>(null);
  const dlgRef = useRef<HTMLDialogElement>(null);
  const [autoplay, setAutoplay] = useState<boolean>(restoreAutoplay(false));
  const [lastVideoId] = useState<string>(restoreLastVideoId());
  const [playerState, setPlayerState] = useState<YT.PlayerState>(YT.PlayerState.UNSTARTED);
  const [inputVideoId, setInputVideoId] = useState<string>(lastVideoId);
  const [inputUrl, setInputUrl] = useState<string>(restoreLastUrl());
  const [parseResult, setParseResult] = useState<ParseYouTubeUrlResult|null>(null);
  const [videoData, setVideoData] = useState<YT.VideoData>();
  const [currentTime, setCurrentTime] = useState<number>(-1);
  const [duration, setDuration] = useState<number>(-1);
  const [repeat, setRepeat] = useState<boolean>(restoreRepeat());
  const timerRef = useRef<number>(null);
  useEffect(() => {
    if (videoData) {
      let vid = videoData.video_id;
      console.log('save last video id: ' + vid);
      saveLastVideoId(vid);
      setDuration(playerRef.current?.getDuration() ?? 0);
    }
  }, [videoData]);

  const removeInterval = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const updateVideoData = (player: YT.Player) => {
    let it = player.getVideoData();
    if (it) { setVideoData(it); }
  }
  
  const cb = useCallback((div: HTMLDivElement) => {
    if (!div && playerRef.current) {
      console.log('destory youtube player');
      playerRef.current.destroy();
      playerRef.current = null;
    }
    
    if (div) {
      // mount
      new YT.Player(div, {
        videoId: lastVideoId,
        width: '100%',
        height: '100%',
        playerVars: {
          autoplay: (autoplay ? 1 : 0),
        },
        events: {
          onReady: (event: YT.PlayerEvent) => {
            let player = event.target;
            if (autoplay) {
              player.playVideo();
            }
            updateVideoData(player);
            playerRef.current = player;
          },
          onStateChange: (event: YT.OnStateChangeEvent) => {
            setPlayerState(event.data)
          },
          onPlaybackQualityChange: (_) => {
          },
          onPlaybackRateChange: (_) => {
          },
          onError: (event) => {
            toast.error(`Error: ${event}`, { position: 'top-center' });
          },
          onApiChange: (_) => {
          },
          onAutoplayBlocked: (_: YT.PlayerEvent) => {
            toast.error('auto playback is blocked', { position: 'top-center' });
          }
        }
      });
    }
    divRef.current = div;
  }, []);

  useEffect(() => {
    console.log(`State Changed: ${playerState}`);
    let player = playerRef.current;
    if (player != null) {
      if (playerState === YT.PlayerState.UNSTARTED || playerState === YT.PlayerState.CUED) {
        updateVideoData(player);
      }

      if (playerState === YT.PlayerState.PLAYING) {
        removeInterval();

        timerRef.current = setInterval(() => {
          if (player !== null) {
            setCurrentTime(player.getCurrentTime());
          }
        }, 100);

        updateVideoData(player);
      } else {
        setCurrentTime(player.getCurrentTime());
        removeInterval();
      }

      if (playerState === YT.PlayerState.ENDED && repeat) {
        player.playVideo();
      }
    }
  }, [playerState]);

  const cbLoadVideo = useCallback(() => {
    playerRef.current?.loadVideoById(inputVideoId)
  }, [inputVideoId]);

  useEffect(() => {
    if (inputUrl !== null && inputUrl !== undefined) {
      setParseResult(silent(() => parseYouTubeUrl(inputUrl)));
    }
  }, [inputUrl]);

  return (
    <div className="max-w-lg">
      <h1>YouTube</h1>
      
      <a
        className="link flex items-center gap-1"
        href="https://youtube.com"
        target="_blank">open youtube <ArrowTopRightOnSquareIcon className="size-4" /></a>

      <div className="h-1"></div>

      <div className="space-y-2">
        <div>
          <div className="aspect-video rounded-lg overflow-clip">
            <div ref={cb}></div>
          </div>
          <div className="flex flex-wrap gap-2 items-center justify-center my-1">{
            Object.keys(YT.PlayerState).map(k => {
              let v = YT.PlayerState[k as keyof typeof YT.PlayerState];
              return (
                <div
                  key={`state-${v}`}
                  className={`badge badge-xs ${(v == playerState) ? '' : 'badge-outline'} badge-info`}
                >
                  {k}: {v}
                </div>
              );
            })
          }</div>
          <p className="text-xs space-x-1">
            <span>CUR: {currentTime?.toFixed(3)} sec.</span>
            <span>/</span>
            <span>DUR: {duration?.toFixed(3)} sec.</span>
            <span>[{ Math.floor(((currentTime ?? 0) / (duration ?? 0)) * 100) }%]</span>
          </p>
        </div>

        { videoData && (
          <Box className="flex gap-1">
            <div className="shrink-0">
              <img
                className="w-20 aspect-video object-cover rounded bg-black"
                src={`https://i.ytimg.com/vi/${videoData.video_id}/hqdefault.jpg`} />
            </div>
            <div className="text-sm p-1">{videoData.title}</div>
          </Box>
        ) }
        
        <Box className="flex gap-1 items-center">
          <input
            className="input input-sm"
            type="text"
            value={inputVideoId}
            placeholder="Video ID"
            onChange={e => setInputVideoId(e.target.value)} />
          <button className="btn btn-sm" type="button" onClick={cbLoadVideo}>Load</button>
        </Box>

        <Box>
          <input
            className="input input-sm w-full"
            type="text"
            value={inputUrl}
            placeholder="parse url"
            onChange={e => setInputUrl(e.target.value)} />

          <div>
            { parseResult && 
              (<ul className="text-sm p-1 flex items-center gap-3">
                 <li>Video ID:
                   <span
                     className="cursor-pointer"
                     onClick={() => { setInputVideoId(parseResult.videoId) }}>{parseResult.videoId}</span></li>
                 <li>Start Time: {parseResult.startTime}</li>
               </ul>)}
          </div>

          <button
            className="btn btn-sm btn-outline my-1" type="button"
            onClick={() => {
              console.log('show modal');
              dlgRef.current?.showModal();
            }}>Examples</button>

          <Modal ref={dlgRef} backdrop={true} title={"Examples"} position="bottom">
            <ul className="text-sm space-y-1">
              {['https://www.youtube.com/watch?v=ItSKahBISg0&list=RDItSKahBISg0&start_radio=1',
                'https://www.youtube.com/watch?v=HuSf1UcFRq0',
                'https://youtu.be/F7sGJVUrkjQ?si=1VcOP3q9AymSUZSq&t=20',
                'https://youtu.be/F7sGJVUrkjQ?si=1VcOP3q9AymSUZSq',
                'https://www.youtube.com/live/Pmsga2d6bg8?si=RC__3d8byqrjkkGU',
                'https://www.youtube.com/shorts/mURLgMXy3Mk'
              ].map((url, i) => (
                <li key={`url-${i}`} className="cursor-pointer" onClick={() => {
                  setInputUrl(url);
                  dlgRef.current?.close();
                }}>{url}</li>
              ))}
            </ul>
          </Modal>
        </Box>

        <Box className="flex gap-1 items-center">
          <button className="btn btn-sm"
            onClick={() => playerRef.current?.playVideo()}>Play</button>
          <button className="btn btn-sm"
            onClick={() => playerRef.current?.pauseVideo()}>Pause</button>
          <button className="btn btn-sm"
            onClick={() => playerRef.current?.stopVideo()}>Stop</button>
          <label className="space-x-1">
            <input
              type="checkbox"
              checked={repeat}
              onChange={(e) => {
                let c = e.target.checked;
                saveRepeat(c);
                setRepeat(c);
              }} />
            <span>Repeat</span>
          </label>
          <label className="space-x-1">
            <input
              type="checkbox"
              checked={autoplay}
              onChange={(e) => {
                let c = e.target.checked;
                saveAutoplay(c);
                setAutoplay(c);
              }} />
            <span>Autoplay</span>
          </label>
        </Box>

        <Box label="Volume">
          <div className="flex items-center gap-1">
            {[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map(v => (
              <button key={`vol-${v}`} className="btn btn-sm" onClick={() => {
                playerRef.current?.setVolume(v);
              }}>{v}</button>
            ))}
          </div>
          <div className="flex items-center gap-1">
            <button className="btn btn-sm" onClick={() => {
              let p = playerRef.current;
              if (p) {
                p.setVolume(Math.min(100, p.getVolume() + 10));
              }
            }}>+10</button>
            <button className="btn btn-sm" onClick={() => {
              let p = playerRef.current;
              if (p) {
                p.setVolume(Math.max(0, p.getVolume() - 10));
              }
            }}>-10</button>
            <button className="btn btn-sm" onClick={() => {
              playerRef.current?.mute();
            }}>Mute</button>
            <button className="btn btn-sm" onClick={() => {
              playerRef.current?.unMute();
            }}>Unmute</button>
          </div>
        </Box>

        <Box label="Time">
          <div className="flex items-center gap-1">
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(t => (
              <button key={`time-${t}`} className="btn btn-sm" onClick={() => {
                let per = t * 0.1;
                let seconds = (duration ?? 0) * per;
                playerRef.current?.seekTo(seconds, true);
              }}>{t}</button>
            ))}
            <button key={`time-end`} className="btn btn-sm" onClick={() => {
              playerRef.current?.seekTo(duration ?? 0, true);
            }}>end</button>
          </div>
        </Box>
        {
          videoData ? (<Box>
                         <h2>Video Data</h2>
                         <ul>
                           <li>video id: {videoData.video_id}</li>
                           <li>title: {videoData.title}</li>
                           <li>author: {videoData.author}</li>
                           <pre className="pre whitespace-pre-wrap text-sm rounded bg-base-100 p-1">
                             {JSON.stringify(videoData, null, 2)}
                           </pre>
                         </ul>
                       </Box>) : null
        }
      </div>
    </div>
  )
}

type BoxProps = {
  children?: ReactNode;
  className?: string;
  label?: string;
}

const Box: React.FC<BoxProps> = ({className, children, label}) => {
  let spacing = label ? 'mt-6 pt-5' : '';
  return (
    <div className={`relative bg-base-300 rounded p-2 ${spacing} ${className ?? ''}`}>
      {label && (<BoxLabel>{label}</BoxLabel>)}
      {children}
    </div>
  )
}


type BoxLabelProps = {
  children?: ReactNode;
  className?: string;
}

const BoxLabel: React.FC<BoxLabelProps> = ({className, children}) => {
  return (
    <div className={`badge badge-sm badge-soft absolute left-2 -top-2 ${className ?? ''}`}>
      {children}
    </div>
  )
}
