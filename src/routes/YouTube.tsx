import { useEffect, useRef, useState, useCallback, ReactNode } from 'react';
import { toast } from 'react-toastify';
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';

declare global {
  interface YT {}
}

(window as any).onYouTubeIframeAPIReady = () => {
  console.log('ready!');
}

const KEY_LAST_VIDEO_ID = 'youtube-last-video-id';
const KEY_REPEAT = 'youtube-repeat';

export default function YouTube() {
  const divRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YT.Player | null>(null);
  const [lastVideoId] = useState<string>(localStorage.getItem(KEY_LAST_VIDEO_ID) ?? 'jNQXAC9IVRw');
  const [playerState, setPlayerState] = useState<YT.PlayerState>(YT.PlayerState.UNSTARTED);
  const [inputVideoId, setInputVideoId] = useState<string>(lastVideoId);
  const [videoData, setVideoData] = useState<YT.VideoData>();
  const [currentTime, setCurrentTime] = useState<number>(-1);
  const [duration, setDuration] = useState<number>(-1);
  const [repeat, setRepeat] = useState<boolean>(localStorage.getItem(KEY_REPEAT) === 'true');
  const timerRef = useRef<number>(null);
  useEffect(() => {
    if (videoData) {
      console.log('save last video id: ' + videoData.video_id);
      localStorage.setItem(KEY_LAST_VIDEO_ID, videoData.video_id)
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
    if (playerRef.current) {
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
          autoplay: 1,
        },
        events: {
          onReady: (event: YT.PlayerEvent) => {
            event.target.playVideo();
            updateVideoData(event.target);
            playerRef.current = event.target;
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
    console.log(`state changed: ${playerState}`);
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

  return (
    <div className="max-w-lg">
      <h1>YouTube</h1>
      <a className="link flex items-center gap-1" href="https://youtube.com" target="_blank">open youtube <ArrowTopRightOnSquareIcon className="size-4" /></a>

      <div className="space-y-2">
        <div className="aspect-video">
          <div ref={cb}></div>
        </div>
        <Box>
          <input
            className="input"
            type="text"
            value={inputVideoId}
            placeholder="Video ID"
            onChange={e => setInputVideoId(e.target.value)} />
          <button className="btn" type="button" onClick={cbLoadVideo}>Load</button>
        </Box>

        <Box>
          <button className="btn"
            onClick={() => playerRef.current?.playVideo()}>Play</button>
          <button className="btn"
            onClick={() => playerRef.current?.pauseVideo()}>Pause</button>
          <button className="btn"
            onClick={() => playerRef.current?.stopVideo()}>Stop</button>
          <label>
            <input
              type="checkbox"
              checked={repeat}
              onChange={(e) => {
              let c = e.target.checked;
              localStorage.setItem(KEY_REPEAT, c.toString());
              setRepeat(c);
            }} />
            <span>Repeat</span>
          </label>
        </Box>

        <Box className="flex items-center">
          <span>Volume:</span>
          <button className="btn" onClick={() => {
            let p = playerRef.current;
            if (p) {
              p.setVolume(Math.min(100, p.getVolume() + 10));
            }
          }}>+10</button>
          <button className="btn" onClick={() => {
            let p = playerRef.current;
            if (p) {
              p.setVolume(Math.max(0, p.getVolume() - 10));
            }
          }}>-10</button>
          <button className="btn" onClick={() => {
            playerRef.current?.mute();
          }}>Mute</button>
          <button className="btn" onClick={() => {
            playerRef.current?.unMute();
          }}>Unmute</button>
        </Box>

        <Box>
          <div>Time: <span>{currentTime?.toFixed(3)} / {duration}</span></div>
        </Box>

        <Box>
          <div>State: {playerState}</div>
          <div className="flex flex-wrap gap-2">{
            Object.keys(YT.PlayerState).map(k => {
              let v = YT.PlayerState[k as keyof typeof YT.PlayerState];
              return (
                <div className={`badge badge-sm ${(v == playerState) ? '' : 'badge-outline'} badge-info`}>
                  {k}: {v}
                </div>
              );
            })
          }</div>
        </Box>

        {
          videoData ? (<Box>
            <h2>Video Data</h2>
            <ul>
              <li>video id: {videoData.video_id}</li>
              <li>title: {videoData.title}</li>
              <li>author: {videoData.author}</li>
              <pre className="pre text-sm">
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
}

const Box: React.FC<BoxProps> = ({className, children}) => {
  return (
    <div className={`bg-base-300 rounded p-2 ${className ?? ''}`}>
      {children}
    </div>
  )
}
