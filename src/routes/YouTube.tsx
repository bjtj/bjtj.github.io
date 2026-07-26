import { useEffect, useRef, useState, useCallback, ReactNode } from 'react';
import { toast } from 'react-toastify';
import { ArrowTopRightOnSquareIcon, ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import Modal from '@/components/Modal';
import { useLocalStorageState } from '@/utils/localStorageState';

declare global {
  interface YT {}
}

(window as any).onYouTubeIframeAPIReady = () => {
  console.log('ready!');
}

const KEY_LAST_VIDEO_ID = 'youtube-last-video-id';
const KEY_LAST_VIDEO_ID_LIST = 'youtube-last-video-id-list';
const KEY_LAST_PLAY_LIST_INDEX = 'youtube-last-play-list-index';
const KEY_REPEAT = 'youtube-repeat';
const KEY_AUTOPLAY = 'youtube-autoplay';
const KEY_LOAD_TYPE = 'youtube-load-type';
const KEY_INPUT_VIDEO_ID = "input-video-id";
const KEY_INPUT_VIDEO_ID_LIST = "input-video-id-list";
const KEY_INPUT_PARSE_URL = "input-parse-url";
const KEY_INPUT_PLAY_LIST_ID = "input-play-list-id";


enum LoadType {
  VideoId = 'videoId',
  PlayList = 'playList',
}

type ParseYouTubeUrlResult = {
  videoId: string;
  startTime: number;
  listId?: string | null;
};

type Option = {
  [key: string]: any
}

type Options = {
  [key: string]: Option[]
}

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

  const listId = u.searchParams.get('list');

  return { videoId, startTime: time , listId};
}

function silent<T>(fn: () => T): T | null {
  try {
    return fn();
  } catch (e) {
    return null;
  }
}

function saveLastVideoId(vid: string) {
  localStorage.setItem(KEY_LAST_VIDEO_ID, vid);
}

function restoreLastVideoId(defvid: string) {
  return localStorage.getItem(KEY_LAST_VIDEO_ID) ?? defvid;
}

function saveLastVideoIdList(vids: string) {
  localStorage.setItem(KEY_LAST_VIDEO_ID_LIST, vids);
}

function restoreLastVideoIdList() {
  return localStorage.getItem(KEY_LAST_VIDEO_ID_LIST) ?? '';
}

function saveLastPlaylistIndex(index: number) {
  localStorage.setItem(KEY_LAST_PLAY_LIST_INDEX, index.toString());
}

function restoreLastPlaylistIndex() {
  return parseInt(localStorage.getItem(KEY_LAST_PLAY_LIST_INDEX) ?? "-1");
}

function saveLoadType(loadType: LoadType) {
  localStorage.setItem(KEY_LOAD_TYPE, loadType)
}

function restoreLoadType(defValue: LoadType) {
  const value = localStorage.getItem(KEY_LOAD_TYPE);
  return value && Object.values(LoadType).includes(value as LoadType)
    ? (value as LoadType)
    :defValue;
}

function saveAutoplay(val: boolean) {
  localStorage.setItem(KEY_AUTOPLAY, val ? 'true' : 'false');
}

function restoreAutoplay(defval: boolean) {
  let item = localStorage.getItem(KEY_AUTOPLAY);
  if (item === null || item === undefined) {
    return defval;
  }
  return item === 'true';
}

function saveRepeat(v: boolean) {
  localStorage.setItem(KEY_REPEAT, v.toString());
}

function restoreRepeat() {
  return localStorage.getItem(KEY_REPEAT) === 'true';
}


export default function YouTube() {
  const divRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YT.Player|null>(null);
  const dlgRef = useRef<HTMLDialogElement>(null);
  const optionsDlgRef = useRef<HTMLDialogElement>(null);
  const [autoplay, setAutoplay] = useState<boolean>(restoreAutoplay(false));
  const [lastVideoId] = useState<string>(restoreLastVideoId('jNQXAC9IVRw'));
  const [lastVideoIdList] = useState<string>(restoreLastVideoIdList());
  const [lastPlayListIndex] = useState<number>(restoreLastPlaylistIndex());
  const [playerState, setPlayerState] = useState<YT.PlayerState>();
  const [inputVideoId, setInputVideoId] = useLocalStorageState<string>(KEY_INPUT_VIDEO_ID, lastVideoId);
  const [inputVideoIdList, setInputVideoIdList] = useLocalStorageState<string>(KEY_INPUT_VIDEO_ID_LIST, lastVideoIdList);
  const [inputParseUrl, setInputParseUrl] = useLocalStorageState<string>(KEY_INPUT_PARSE_URL, "");
  const [inputIndex, setInputIndex] = useState<number>(0);
  const [inputSeekPercent, setInputSeekPercent] = useState<number>(0);
  const [inputVolumePercent, setInputVolumePercent] = useState<number>(0);
  const [inputPlayListId, setInputPlayListId] = useLocalStorageState<string>(KEY_INPUT_PLAY_LIST_ID, "OLAK5uy_nQFHiVXIsV7njWTASL1EXd28Kn-2Yq1n0");
  const [parseResult, setParseResult] = useState<ParseYouTubeUrlResult|null>(null);
  const [videoData, setVideoData] = useState<YT.VideoData>();
  const [currentTime, setCurrentTime] = useState<number>(-1);
  const [currentPlaylist, setCurrentPlaylist] = useState<string[]>();
  const [currentPlaylistIndex, setCurrentPlaylistIndex] = useState<number>();
  const [duration, setDuration] = useState<number>(-1);
  const [repeat, setRepeat] = useState<boolean>(restoreRepeat());
  const [options, setOptions] = useState<Options>({});
  const loadTypeRef = useRef<LoadType>(restoreLoadType(LoadType.VideoId));
  const timerRef = useRef<number>(null);

  useEffect(() => {
    if (videoData) {
      setDuration(playerRef.current?.getDuration() ?? 0);
    }
  }, [videoData]);

  useEffect(() => {
    if (currentPlaylist) {
      console.log(`${currentPlaylist.join(',')}`);
    }
  }, [currentPlaylist]);

  const removeInterval = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const saveLastPlayState = (player: YT.Player) => {
    let videoData = player.getVideoData();
    let videoId = videoData?.video_id;
    let playList = player.getPlaylist();
    let playListIndex = player.getPlaylistIndex();
    if (playList?.length > 0) {
      console.log('save last playstate / PLAYLIST');
      saveLastVideoIdList(playList.join(","));
      saveLastPlaylistIndex(playListIndex);
      saveLoadType(LoadType.PlayList);
    } else {
      console.log('save last playstate / VIDEOID');
      saveLastVideoId(videoId);
      saveLoadType(LoadType.VideoId);
    }
  }

  const updateVideoData = (player: YT.Player) => {
    let it = player.getVideoData();
    if (it != null) { setVideoData(it); }
  }

  const updateOptions = (player: any) => {
    let topOptions = player.getOptions();
    console.log(`updateOptions: ${topOptions}`);
    setOptions(Object.assign({}, ...topOptions.map((opt: string) =>
    ({
      [opt]: Object.assign({}, ...player.getOptions(opt).map((k: string) =>
        ({ [k]: player.getOption(opt, k) ?? '' })))
    }))));
  }
  
  const cb = useCallback((div: HTMLDivElement) => {
    if (!div && playerRef.current) {
      console.log('destory youtube player');
      playerRef.current.destroy();
      playerRef.current = null;
    }
    
    if (div) {

      let extraPlayerVars = ((loadTypeRef.current === LoadType.PlayList) ? {'playlist': lastVideoIdList} : {})
      console.log(`loadTypeRef.current: ${loadTypeRef.current}, extraPlayerVars: ${JSON.stringify(extraPlayerVars, null, 2)}`);
      
      // mount
      new YT.Player(div, {
        videoId: lastVideoId,
        width: '100%',
        height: '100%',
        playerVars: {
          autoplay: 0,
          ...((loadTypeRef.current === LoadType.PlayList) ? {'playlist': lastVideoIdList} : {})
        },
        events: {
          onReady: (event: YT.PlayerEvent) => {
            console.log('READY!');
            let player = event.target;
            playerRef.current = player;
            if (loadTypeRef.current === LoadType.PlayList && lastPlayListIndex >= 0) {
              player.playVideoAt(lastPlayListIndex)
            }
            if (autoplay) {
              toast('Auto Play');
              player.playVideo();
            }
            updateVideoData(player);
          },
          onStateChange: (event: YT.OnStateChangeEvent) => {
            setPlayerState(event.data)
          },
          onPlaybackQualityChange: (_) => {
          },
          onPlaybackRateChange: (_) => {
          },
          onError: (event) => {
            toast.error(`Error: ${JSON.stringify(event)}`, { position: 'top-center' });
          },
          onApiChange: ({ target }) => {
            console.log('onApiChange');
            updateOptions(target);
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
    console.log(`State Changed: ${playerState} (${Object.keys(YT.PlayerState).find(k => YT.PlayerState[k as keyof typeof YT.PlayerState] === playerState)})`);
    let player = playerRef.current;
    if (player != null) {
      if (playerState === YT.PlayerState.UNSTARTED) {
        saveLastPlayState(player);
        setCurrentPlaylist(player.getPlaylist());
        setCurrentPlaylistIndex(player.getPlaylistIndex());
      }
      
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
        player.playVideoAt(0);
        player.playVideo();
      }
    }
  }, [playerState]);

  const cbLoadVideo = useCallback(() => {
    playerRef.current?.loadVideoById(inputVideoId);
  }, [inputVideoId]);

  const cbCueVideo = useCallback(() => {
    playerRef.current?.cueVideoById(inputVideoId);
  }, [inputVideoId]);

  const cbLoadVideoList = useCallback(() => {
    console.log(`cbLoadVideoList / inputVideoIdList ${inputVideoIdList}`);
    let list = inputVideoIdList.split(/\s*,\s*/).filter(s => s.length > 0);
    playerRef.current?.loadPlaylist(list, 0, 0);
  }, [inputVideoIdList]);

  const cbCueVideoList = useCallback(() => {
    console.log(`cbCueVideoList / inputVideoIdList ${inputVideoIdList}`);
    let list = inputVideoIdList.split(/\s*,\s*/).filter(s => s.length > 0);
    playerRef.current?.cuePlaylist(list, 0, 0);
  }, [inputVideoIdList]);

  const cbLoadPlayListId = useCallback(() => {
    console.log(`cbLoadPlayListId / inputPlayListId: ${inputPlayListId}`);
    playerRef.current?.loadPlaylist({list: inputPlayListId, listType: 'playlist', index: 0, startSeconds: 0});
  }, [inputPlayListId]);

  const cbCuePlayListId = useCallback(() => {
    console.log(`cbCuePlayListId / inputPlayListId: ${inputPlayListId}`);
    playerRef.current?.cuePlaylist({list: inputPlayListId, listType: 'playlist', index: 0, startSeconds: 0});
  }, [inputPlayListId]);

  const cbPreviousVideo = useCallback(() => {
    playerRef.current?.previousVideo();
  }, []);

  const cbNextVideo = useCallback(() => {
    playerRef.current?.nextVideo();
  }, []);

  const cbSetIndex = useCallback(() => {
    playerRef.current?.playVideoAt(inputIndex);
  }, [inputIndex]);

  const cbPlayVideodAt = useCallback((idx: number) => {
    playerRef.current?.playVideoAt(idx);
  }, []);

  const cbSeekPercent = useCallback(() => {
    if (playerRef.current) {
      let duration = playerRef.current.getDuration();
      let percent = inputSeekPercent * 0.01;
      playerRef.current?.seekTo(duration * percent, true);
    }
  }, [inputSeekPercent]);

  const cbSetVolumePercent = useCallback(() => {
    if (playerRef.current) {
      playerRef.current?.setVolume(inputVolumePercent);
    }
  }, [inputVolumePercent]);

  useEffect(() => {
    if (inputParseUrl !== null && inputParseUrl !== undefined) {
      setParseResult(silent(() => parseYouTubeUrl(inputParseUrl)));
    }
  }, [inputParseUrl]);

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
        </div>

        { videoData && (
          <Box className="flex items-center gap-1">
            <div className="shrink-0">
              <img
                className="w-20 aspect-video object-cover rounded bg-black"
                src={`https://i.ytimg.com/vi/${videoData.video_id}/hqdefault.jpg`} />
            </div>
            <div className="text-sm p-1 flex-1">
              <div>{videoData.title}</div>
              <div className="font-bold">{videoData.author}</div>
            </div>
            <div>
              <button
                className="btn btn-xs btn-secondary"
                onClick={() => {
                  optionsDlgRef.current?.showModal();
                }}>options</button>
            </div>
          </Box>
        ) }

        <Box className="space-y-1">

          <p className="text-xs space-x-1">
            <span>Time: {currentTime?.toFixed(3)} sec.</span>
            <span>/</span>
            <span>duration: {duration?.toFixed(3)} sec.</span>
            <span>(progress: {Math.floor(((currentTime ?? 0) / (duration ?? 0)) * 100)}%)</span>
          </p>

          <div className="flex gap-1 items-center">
            <button
              className="btn btn-sm btn-primary"
              onClick={() => playerRef.current?.playVideo()}>Play</button>
            <button
              className="btn btn-sm btn-primary"
              onClick={() => playerRef.current?.pauseVideo()}>Pause</button>
            <button
              className="btn btn-sm btn-primary"
              onClick={() => playerRef.current?.stopVideo()}>Stop</button>
            <label className="space-x-1 text-sm">
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
            <label className="space-x-1 text-sm">
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
          </div>
        </Box>
        
        <Box className="flex gap-1 items-center" label="Set Video">
          <label className="input input-sm flex-1">
            <span className="font-bold text-gray-500">Video ID</span>
            <input
              className="grow"
              type="text"
              value={inputVideoId}
              placeholder="Video ID"
              onInput={e => setInputVideoId(e.currentTarget.value)} />
          </label>
          <button
            className="btn btn-sm btn-secondary"
            type="button"
            onClick={cbLoadVideo}>Load</button>
          <button
            className="btn btn-sm btn-secondary"
            type="button"
            onClick={cbCueVideo}>Cue</button>
        </Box>

        <Box label="Set Video List">
          <div className="flex gap-1 items-center">
            <label className="input input-sm flex-1">
              <span className="font-bold text-gray-500">Video List</span>
              <input
                className="grow"
                type="text"
                value={inputVideoIdList}
                placeholder="Video ID List (comma separated)"
                onInput={e => setInputVideoIdList(e.currentTarget.value)} />
            </label>
            <button
              className="btn btn-sm btn-secondary"
              type="button"
              onClick={cbLoadVideoList}>Load</button>
            <button
              className="btn btn-sm btn-secondary"
              type="button"
              onClick={cbCueVideoList}>Cue</button>
          </div>
          <div className="h-1"></div>
          <div className="flex gap-1 items-center">
            <label className="input input-sm flex-1">
              <span className="font-bold text-gray-500">PlayList ID</span>
              <input
                className="grow"
                type="text"
                value={inputPlayListId}
                placeholder="PlayList ID"
                onInput={e => setInputPlayListId(e.currentTarget.value)} />
            </label>
            <button
              className="btn btn-sm btn-secondary"
              type="button"
              onClick={cbLoadPlayListId}>Load</button>
            <button
              className="btn btn-sm btn-secondary"
              type="button"
              onClick={cbCuePlayListId}>Cue</button>
          </div>

          <div className="h-1"></div>

          <div className="flex gap-1 items-center">
            <button className="btn btn-sm" type="button" onClick={cbPreviousVideo}>
              <ArrowLeftIcon className="size-4" />
              <span>prev</span>
            </button>
            <button className="btn btn-sm" type="button" onClick={cbNextVideo}>
              <ArrowRightIcon className="size-4" />
              <span>next</span>
            </button>
            <label className="input input-sm w-fit">
              <span className="font-bold text-gray-500">Index</span>
              <input
                className="w-12"
                type="number"
                min={0}
                value={inputIndex}
                onInput={e => setInputIndex(parseInt(e.currentTarget.value))} />
            </label>
            <button
              className="btn btn-sm btn-secondary"
              onClick={cbSetIndex}>Set</button>
          </div>
          
          <div>
            <h4>Play List</h4>
            <div className="flex-wrap gap-1">{currentPlaylist?.map((vid, index) =>
              <button
                key={`playlist-item-${index}`}
                className="badge badge-sm cursor-pointer"
                onClick={() => cbPlayVideodAt(index)}
                title={`index: ${index}`}>
                {vid}
              </button>)}</div>
            <div className="text-sm">Index: {currentPlaylistIndex}</div>
          </div>
        </Box>

        <Box label="Parse Url">
          <label className="input input-sm w-full">
            <span className="font-bold text-gray-500">YouTube URL</span>
            <input
              className="grow"
              type="text"
              value={inputParseUrl}
              placeholder="video url"
              onInput={e => setInputParseUrl(e.currentTarget.value)} />
          </label>

          <div>
            { parseResult && 
              (<ul className="text-sm p-1">
                 <li className="flex items-center gap-1">
                   <span>Video ID:</span>
                   <code>{parseResult.videoId}</code>
                   <button
                     className="btn btn-xs btn-secondary"
                     onClick={() => { setInputVideoId(parseResult.videoId) }}>
                     Set
                   </button>
                 </li>
                 <li>Start Time: {parseResult.startTime}</li>
              {parseResult.listId &&
                (<li className="flex items-center gap-1">
                  <span>PlayList ID: </span>
                  <code>{parseResult.listId}</code>
                  <button
                    className="btn btn-xs btn-secondary"
                    onClick={() => { setInputPlayListId(parseResult.listId!) }}>
                    Set
                  </button>
                </li>)
              }
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
                  setInputParseUrl(url);
                  dlgRef.current?.close();
                }}>{url}</li>
              ))}
            </ul>
          </Modal>
        </Box>

        <Box label="Volume">
          <p className="text-sm">{inputVolumePercent}%</p>
          <div className="h-2"></div>
          <div className="flex items-center gap-1">
            <input
              className="range flex-1" type="range" min={0} max={100}
              value={inputVolumePercent}
              onInput={e => setInputVolumePercent(parseInt(e.currentTarget.value))} />
            <button
              className="btn btn-sm btn-secondary"
              type="button"
              onClick={cbSetVolumePercent}>Set</button>
          </div>
          <div className="h-2"></div>
          <div className="flex items-center gap-1">
            <button className="btn btn-sm" onClick={() => {
              let p = playerRef.current;
              if (p) {
                p.setVolume(Math.min(100, p.getVolume() + 10));
              }
            }}>+10</button>
            <button
              className="btn btn-sm"
              onClick={() => {
                let p = playerRef.current;
                if (p) {
                  p.setVolume(Math.max(0, p.getVolume() - 10));
                }
              }}>-10</button>
            <button
              className="btn btn-sm"
              onClick={() => {
                playerRef.current?.mute();
              }}>Mute</button>
            <button
              className="btn btn-sm"
              onClick={() => {
                playerRef.current?.unMute();
              }}>Unmute</button>
          </div>
        </Box>

        <Box label="Seek">
          <p className="text-sm">{inputSeekPercent}%</p>
          <div className="h-2"></div>
          <div className="flex items-center gap-1">
            <input
              className="range flex-1" type="range" min={0} max={100}
              value={inputSeekPercent}
              onInput={e => setInputSeekPercent(parseInt(e.currentTarget.value))} />
            <button
              className="btn btn-sm btn-secondary"
              type="button"
              onClick={cbSeekPercent}>Set</button>
          </div>
        </Box>

        {
          videoData ? (<Box label="Video Data">
            <ul>
              <li>video id: {videoData.video_id}</li>
              <li>title: {videoData.title}</li>
              <li>author: {videoData.author}</li>
              <li>
                <pre className="pre whitespace-pre-wrap text-sm rounded bg-base-100 p-1">
                  {JSON.stringify(videoData, null, 2)}
                </pre>
              </li>
            </ul>
          </Box>) : null
        }

        <Modal ref={optionsDlgRef} backdrop={true} title={"Options"}>
          <pre className="pre whitespace-pre-wrap text-sm">
            {JSON.stringify(options, null, 2)}
          </pre>
        </Modal>
        
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
