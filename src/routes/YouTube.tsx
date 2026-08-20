import { useEffect, useRef, useState, useCallback, ReactNode } from 'react';
import { toast } from 'react-toastify';
import { ArrowTopRightOnSquareIcon, ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import Modal from '@/components/Modal';
import { useLocalStorageState } from '@/utils/localStorageState';

declare global {
  interface YT {}
}

(window as any).onYouTubeIframeAPIReady = () => {
  console.log('YouTubeIframeAPIReady');
}

const KEY_LAST_PLAY_STATE = 'last-play-state';
const KEY_REPEAT = 'youtube-repeat';
const KEY_AUTOPLAY = 'youtube-autoplay';
const KEY_INPUT_VIDEO_ID = "input-video-id";
const KEY_INPUT_VIDEO_ID_LIST = "input-video-id-list";
const KEY_INPUT_PARSE_URL = "input-parse-url";
const KEY_INPUT_PLAY_LIST_ID = "input-play-list-id";
const KEY_INPUT_SEEK_PERCENT = "input-seek-percent";
const KEY_INPUT_VOLUME_PERCENT = "input-volume-percent";

enum LoadType {
  VideoId = 'videoId',
  PlayList = 'playList',
  PlayListId = 'playListId',
};

type SavedPlayState = {
  loadType: LoadType,
  videoId?: string|null,
  videoIdList?: string[]|null,
  playlistIndex?: number|null,
  playlistId?: string|null,
}

type ParseYouTubeUrlResult = {
  videoId: string;
  startTime: number;
  listId?: string | null;
};

type Option = {
  [key: string]: any
};

type Options = {
  [key: string]: Option[]
};

type PlaylistState = {
  originList?: string[]|null,
  currentList?: string[]|null,
  currentIndex?: number|null,
  currentVideoId?: string|null,
};

const createInitialPlaylistState = () => ({
  originList: null, currentList: null, currentIndex: null, currentVideoId: null
});

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

function getCurrentVideoId(player: YT.Player) {
  let video_id = player.getVideoData().video_id;
  if (video_id != null) {
    return video_id;
  }

  let result = parseYouTubeUrl(player.getVideoUrl());
  return result?.videoId;
}

function isNullOrEmptyArray<T>(arr: Array<T>|null|undefined) {
  return (arr == null || arr.length === 0);
}

function playerStateToString(playerState: YT.PlayerState) {
  return Object.keys(YT.PlayerState)
    .find(k =>
      YT.PlayerState[k as keyof typeof YT.PlayerState] === playerState);
}

export default function YouTube() {
  const divRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YT.Player|null>(null);
  const dlgRef = useRef<HTMLDialogElement>(null);
  const optionsDlgRef = useRef<HTMLDialogElement>(null);
  const [autoplay, setAutoplay] = useState<boolean>(restoreAutoplay(false));
  const [savedLastPlayState, setSavedLastPlayState] = useLocalStorageState<SavedPlayState>(KEY_LAST_PLAY_STATE, {loadType: LoadType.VideoId, videoId: 'jNQXAC9IVRw'});
  const [playerState, setPlayerState] = useState<YT.PlayerState>();
  const [inputVideoId, setInputVideoId] = useLocalStorageState<string>(KEY_INPUT_VIDEO_ID, savedLastPlayState.videoId ?? '');
  const [inputVideoIdList, setInputVideoIdList] = useLocalStorageState<string>(KEY_INPUT_VIDEO_ID_LIST, savedLastPlayState.videoIdList?.join(',') ?? '');
  const [inputParseUrl, setInputParseUrl] = useLocalStorageState<string>(KEY_INPUT_PARSE_URL, '');
  const [inputIndex, setInputIndex] = useState<number>(0);
  const [inputSeekPercent, setInputSeekPercent] = useLocalStorageState<number>(KEY_INPUT_SEEK_PERCENT, 0);
  const [inputVolumePercent, setInputVolumePercent] = useLocalStorageState<number>(KEY_INPUT_VOLUME_PERCENT, 0);
  const [inputPlayListId, setInputPlayListId] = useLocalStorageState<string>(KEY_INPUT_PLAY_LIST_ID, "OLAK5uy_nQFHiVXIsV7njWTASL1EXd28Kn-2Yq1n0");
  const [parseResult, setParseResult] = useState<ParseYouTubeUrlResult|null>(null);
  const [videoData, setVideoData] = useState<YT.VideoData>();
  const [videoUrl, setVideoUrl] = useState<string>();
  const [currentTime, setCurrentTime] = useState<number>(-1);
  const [playlistState, setPlaylistState] = useState<PlaylistState>(createInitialPlaylistState);
  const [selectedVideoIdInPlaylist, setSelectedVideoIdInPlaylist] = useState<string>();
  const [shuffled, setShuffled] = useState<boolean>(false);
  const [duration, setDuration] = useState<number>(-1);
  const [repeat, setRepeat] = useState<boolean>(restoreRepeat());
  const [options, setOptions] = useState<Options>({});
  const timerRef = useRef<number>(null);
  const needResetRef = useRef<boolean>(false);

  useEffect(() => {
    if (videoData) {
      setDuration(playerRef.current?.getDuration() ?? 0);
    }
  }, [videoData]);

  useEffect(() => {
    let playlist= playerRef.current?.getPlaylist();
    if (playlist != null) {
      let idx = playlist.findIndex(vid => vid === selectedVideoIdInPlaylist);
      if (idx != null && idx >= 0) {
        playerRef.current?.playVideoAt(idx);
      }
    }
  }, [selectedVideoIdInPlaylist]);

  function resetPlaylist() {
    setShuffled(false);
    needResetRef.current = true;
    setPlaylistState(createInitialPlaylistState());
  }

  const removeInterval = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const saveLastPlayState = (player: YT.Player) => {
    let videoData = player.getVideoData();
    let playListId = (videoData as any).list
    let videoId = videoData.video_id ?? parseYouTubeUrl(player.getVideoUrl())?.videoId;
    let playlist = player.getPlaylist();
    let playListIndex = player.getPlaylistIndex();
    if (playListId != null) {
      setSavedLastPlayState({
        loadType: LoadType.PlayListId,
        videoIdList: playlist,
        playlistIndex: playListIndex,
        playlistId: playListId
      });
    } else if (playlist?.length > 0) {
      setSavedLastPlayState({
        loadType: LoadType.PlayList,
        videoIdList: playlist,
        playlistIndex: playListIndex,
      });
    } else {
      setSavedLastPlayState({
        loadType: LoadType.PlayListId,
        videoId: videoId,
      });
    }
  }

  const updateVideoData = (player: YT.Player) => {
    let it = player.getVideoData() as any;
    console.log(`updateVideoData.list: ${it.list}`);
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
  
  const onPlayerStateChanged = (state: YT.PlayerState) => {
    console.log(`State Changed: ${state} (${playerStateToString(state)})`);
    let player = playerRef.current;
    if (player != null) {

      if (state === YT.PlayerState.UNSTARTED || state === YT.PlayerState.CUED) {
        let videoData = player.getVideoData() as any;
        console.log(`videoData | videoId: ${videoData.video_id}, list: ${videoData.list}`);
        console.log(`videoUrl: ${player.getVideoUrl()}`);
        console.log(`videoData: ${JSON.stringify(videoData)}`);

        updateVideoData(player);
        setVideoUrl(player.getVideoUrl());
        let videoId = getCurrentVideoId(player);
        let playlist = player.getPlaylist()
        if (selectedVideoIdInPlaylist != null && videoId != null && videoId !== selectedVideoIdInPlaylist) {
          let idx = playlist.findIndex(vid => vid === selectedVideoIdInPlaylist);
          if (idx != null && idx >= 0) {
            player.playVideoAt(idx);
            setSelectedVideoIdInPlaylist(undefined);
            return;
          }
        } else {
          setSelectedVideoIdInPlaylist(undefined);
        }

        saveLastPlayState(player);
        let update = {
          ...(needResetRef.current ? { originList: player.getPlaylist() } : {}),
          currentList: player.getPlaylist(),
          currentIndex: player.getPlaylistIndex(),
          currentVideoId: player.getPlaylist()[player.getPlaylistIndex()]
        };
        setPlaylistState(prev => {
          let newState = {
            ...prev,
            ...(isNullOrEmptyArray(prev.originList) ? {
              originList: update.currentList
            } : {}),
            ...update,
          };
          return newState;
        });
      }

      if (state === YT.PlayerState.PLAYING) {
        removeInterval();
        timerRef.current = setInterval(() => {
          if (player !== null) {
            setCurrentTime(player.getCurrentTime());
          }
        }, 100);
        updateVideoData(player);
        needResetRef.current = false;
      } else {
        setCurrentTime(player.getCurrentTime());
        removeInterval();
      }

      if (state === YT.PlayerState.ENDED && repeat) {
        player.playVideoAt(0);
        player.playVideo();
      }
    }
  }

  const cbOnRef = useCallback((div: HTMLDivElement) => {
    if (!div && playerRef.current) {
      console.log('destory youtube player');
      playerRef.current.destroy();
      playerRef.current = null;
    }
    
    if (div) {
      // mount
      new YT.Player(div, {
        videoId: savedLastPlayState.videoId ?? '',
        width: '100%',
        height: '100%',
        playerVars: {
          autoplay: 0,
        },
        events: {
          onReady: (event: YT.PlayerEvent) => {
            console.log('READY!');
            let player = event.target;
            playerRef.current = player;
            
            if (
              savedLastPlayState.loadType === LoadType.PlayListId &&
              savedLastPlayState.playlistId != null
            ) {
              let { playlistId, playlistIndex } = savedLastPlayState;
              if (autoplay) {
                player.loadPlaylist({
                  list: playlistId, listType: 'playlist', index: playlistIndex ?? 0
                });
              } else {
                player.cuePlaylist({
                  list: playlistId, listType: 'playlist', index: playlistIndex ?? 0
                });
              }
            } else if (
              savedLastPlayState.loadType === LoadType.PlayList &&
              savedLastPlayState.videoIdList != null
            ) {
              let { videoIdList, playlistIndex } = savedLastPlayState;
              if (autoplay) {
                player.loadPlaylist(videoIdList, playlistIndex ?? 0);
              } else {
                player.cuePlaylist(videoIdList, playlistIndex ?? 0);
              }
            } else if (savedLastPlayState.videoId != null) {
              if (autoplay) {
                player.loadVideoById(savedLastPlayState.videoId);
              } else {
                player.cueVideoById(savedLastPlayState.videoId);
              }
            }

            updateVideoData(player);
            let newState = {
              originList: player.getPlaylist(),
              currentList: player.getPlaylist(),
              currentIndex: player.getPlaylistIndex(),
              currentVideoId: player.getPlaylist()[player.getPlaylistIndex()],
            };
            setPlaylistState(() => {
              return newState;
            });
          },
          onStateChange: (event: YT.OnStateChangeEvent) => {
            let state = event.data;
            setPlayerState(state)
            onPlayerStateChanged(state);
          },
          onPlaybackQualityChange: (_) => {
          },
          onPlaybackRateChange: (_) => {
          },
          onError: (event) => {
            console.error(`onError: ${event.data}`);
            toast.error(`Error: ${event.data}`, { position: 'top-center' });
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

  const cbLoadVideo = () => {
    resetPlaylist();
    playerRef.current?.loadVideoById(inputVideoId);
  };

  const cbCueVideo = () => {
    resetPlaylist();
    playerRef.current?.cueVideoById(inputVideoId);
  };

  const cbLoadVideoList = () => {
    resetPlaylist();
    let list = inputVideoIdList.split(/\s*,\s*/).filter(s => s.length > 0);
    playerRef.current?.stopVideo();
    playerRef.current?.loadPlaylist(list, 0, 0);
  };

  const cbCueVideoList = () => {
    resetPlaylist();
    let list = inputVideoIdList.split(/\s*,\s*/).filter(s => s.length > 0);
    playerRef.current?.stopVideo();
    playerRef.current?.cuePlaylist(list, 0, 0);
  };

  const cbLoadPlayListId = () => {
    resetPlaylist();
    playerRef.current?.stopVideo();
    playerRef.current?.loadPlaylist({
      list: inputPlayListId, listType: 'playlist', index: 0, startSeconds: 0
    });
  };

  const cbCuePlayListId = () => {
    resetPlaylist();
    playerRef.current?.stopVideo();
    playerRef.current?.cuePlaylist({
      list: inputPlayListId, listType: 'playlist', index: 0, startSeconds: 0
    });
  };

  const cbSetShuffle = (shuffle: boolean) => {
    playerRef.current?.setShuffle(shuffle);
    setShuffled(shuffle);
  };

  const cbPreviousVideo = () => {
    playerRef.current?.previousVideo();
  };

  const cbNextVideo = () => {
    playerRef.current?.nextVideo();
  };

  const cbSetIndex = () => {
    playerRef.current?.playVideoAt(inputIndex);
  };

  const cbPlayVideodAt = (idx: number) => {
    playerRef.current?.playVideoAt(idx);
  };

  const cbSeekPercent = () => {
    if (playerRef.current) {
      let duration = playerRef.current.getDuration();
      let percent = inputSeekPercent * 0.01;
      playerRef.current?.seekTo(duration * percent, true);
    }
  };

  const cbSetVolumePercent = () => {
    if (playerRef.current) {
      playerRef.current?.setVolume(inputVolumePercent);
    }
  };

  useEffect(() => {
    if (inputParseUrl !== null && inputParseUrl !== undefined) {
      setParseResult(silent(() => parseYouTubeUrl(inputParseUrl)));
    }
  }, [inputParseUrl]);

  return (
    <div className="max-w-lg">
      <h1>YouTube</h1>

      {videoUrl && (
        <a
          className="link flex items-center gap-1"
          href={videoUrl}
          target="_blank">
          Open YouTube <ArrowTopRightOnSquareIcon className="size-4" />
        </a>)}
      

      <div className="h-1"></div>

      <div className="space-y-2">
        <div>
          <div className="aspect-video rounded-lg overflow-clip">
            <div ref={cbOnRef}></div>
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
          
          <div className="p-1">
            <div className="flex gap-2 items-center justify-between">
              <h3>Play List</h3>
              <input
                className="btn btn-xs"
                type="checkbox"
                checked={shuffled}
                onChange={e => cbSetShuffle(e.target.checked)}
                aria-label="Shuffle"
              />
            </div>
            <div>
              <div className="flex-wrap gap-1">
                {playlistState.originList && (
                  <pre className="pre whitespace-pre-wrap text-xs">
                    {playlistState.originList.join(', ')}
                  </pre>)}
                {playlistState.originList?.map((vid, index) =>
                  <button
                    key={`playlist-item-${index}`}
                    className={`badge badge-sm cursor-pointer ${playlistState.currentVideoId === vid ? 'badge-warning' : ''}`}
                    onClick={() => setSelectedVideoIdInPlaylist(vid)}
                    title={`index: ${index}`}>
                    {vid}
                  </button>)}
              </div>

              <div className="hidden">
                <h5>Current</h5>
                <div className="flex-wrap gap-1">
                {playlistState.currentList?.map((vid, index) =>
                  <button
                    key={`playlist-item-${index}`}
                    className={`badge badge-sm cursor-pointer ${playlistState.currentIndex === index ? 'badge-warning' : ''}`}
                    onClick={() => cbPlayVideodAt(index)}
                    title={`index: ${index}`}>
                    {vid}
                  </button>)}
                </div>
              </div>
            </div>
            <div className="text-sm">Index: {playlistState.currentIndex}</div>
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
            {parseResult &&
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
                  </li>)}
              </ul>)}
          </div>

          <button
            className="btn btn-sm btn-outline my-1" type="button"
            onClick={() => {
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
