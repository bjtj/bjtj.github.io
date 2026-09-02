export function parseYouTubeUrl(url: string) {
  try {
    const u = new URL(url);

    let videoId = null;

    // youtube.com/watch?v=...
    if (u.hostname.includes("youtube.com")) {
      videoId = u.searchParams.get("v");

      // youtube.com/shorts/...
      if (!videoId && u.pathname.startsWith("/shorts/")) {
        videoId = u.pathname.split("/")[2];
      }

      // youtube.com/embed/...
      if (!videoId && u.pathname.startsWith("/embed/")) {
        videoId = u.pathname.split("/")[2];
      }

      // youtube.com/live/...
      if (!videoId && u.pathname.startsWith("/live/")) {
        videoId = u.pathname.split("/")[2];
      }
    }

    // youtu.be/...
    if (u.hostname === "youtu.be") {
      videoId = u.pathname.slice(1);
    }

    // time 추출
    // ?t=123
    // ?t=1m30s
    // ?start=123
    let time = u.searchParams.get("t") || u.searchParams.get("start");

    let seconds = 0;

    if (time) {
      // 1m30s 형태 처리
      const match = time.match(/(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?/);

      if (match) {
        seconds += parseInt(match[1] || '0') * 3600;
        seconds += parseInt(match[2] || '0') * 60;
        seconds += parseInt(match[3] || '0');
      }

      // 숫자만 있는 경우
      if (seconds === 0 && /^\d+$/.test(time)) {
        seconds = parseInt(time, 10);
      }
    }

    let listId = u.searchParams.get("list");

    return {
      videoId,
      time: seconds,
      listId
    };
  } catch {
    return null;
  }
}
