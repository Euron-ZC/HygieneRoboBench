// Load either source only after a play or chapter click.
export function initializeFilm(chapters) {
  const film = document.getElementById('research-film');
  const buttons = [...document.querySelectorAll('#chapter-links [data-time]')];
  const videoId = film.dataset.youtubeId;
  const highlight = time => {
    let active = 0;
    chapters.forEach((chapter, index) => { if (time >= chapter.start) active = index; });
    buttons.forEach((button, index) => button.classList.toggle('is-current', index === active));
  };

  if (!videoId) {
    buttons.forEach(button => button.onclick = () => {
      film.currentTime = Number(button.dataset.time);
      film.play().catch(() => {});
    });
    film.addEventListener('timeupdate', () => highlight(film.currentTime));
    return;
  }

  const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;
  const shell = document.createElement('div');
  shell.className = 'research-player';
  shell.innerHTML = `<button class="film-cover" aria-label="Play the research film on YouTube"><img src="${film.poster}" alt="Real-robot motivating example" loading="lazy"><span class="film-play" aria-hidden="true">▶</span></button><div id="youtube-film" hidden></div>`;
  film.replaceWith(shell);
  film.hidden = true;
  shell.append(film);
  const cover = shell.querySelector('.film-cover');
  const controls = document.createElement('div');
  controls.className = 'film-playback-options';
  controls.setAttribute('role', 'group');
  controls.setAttribute('aria-label', 'Choose a video player');
  controls.innerHTML = '<button type="button" data-player="youtube" aria-pressed="true">YouTube</button><button type="button" data-player="direct" aria-pressed="false" aria-label="Play directly without a YouTube login">Play directly</button>';
  shell.after(controls);
  const options = [...controls.querySelectorAll('button')];
  const watch = document.createElement('a');
  watch.href = watchUrl;
  watch.target = '_blank';
  watch.rel = 'noopener';
  watch.textContent = 'Watch on YouTube ↗';
  document.querySelector('.film-links').prepend(watch);

  let player, apiPromise, pendingTime = 0, timer, startupTimer;
  let mode = 'youtube';
  function setMode(next) {
    mode = next;
    options.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.player === mode)));
  }
  function playDirect(time = pendingTime) {
    clearTimeout(startupTimer);
    clearInterval(timer);
    pendingTime = time;
    setMode('direct');
    if (player?.pauseVideo) player.pauseVideo();
    shell.querySelector('#youtube-film').hidden = true;
    cover.hidden = true;
    cover.removeAttribute('aria-busy');
    delete shell.dataset.loading;
    film.hidden = false;
    film.currentTime = time;
    film.play().catch(() => {});
    highlight(time);
  }
  film.addEventListener('loadedmetadata', () => {
    if (mode === 'direct') film.currentTime = pendingTime;
  });
  film.addEventListener('timeupdate', () => {
    if (mode === 'direct') highlight(film.currentTime);
  });
  function loadApi() {
    if (window.YT?.Player) return Promise.resolve();
    if (!apiPromise) apiPromise = new Promise((resolve, reject) => {
      window.onYouTubeIframeAPIReady = resolve;
      const script = document.createElement('script');
      script.src = 'https://www.youtube.com/iframe_api';
      script.onerror = reject;
      document.head.append(script);
    });
    return apiPromise;
  }
  async function play(time = 0) {
    pendingTime = time;
    highlight(time);
    if (mode === 'direct') {
      playDirect(time);
      return;
    }
    film.pause();
    film.hidden = true;
    clearTimeout(startupTimer);
    startupTimer = setTimeout(() => playDirect(pendingTime), 12000);
    if (player?.seekTo) {
      cover.hidden = true;
      shell.querySelector('#youtube-film').hidden = false;
      player.seekTo(time, true);
      player.playVideo();
      return;
    }
    if (shell.dataset.loading) return;
    shell.dataset.loading = 'true';
    cover.setAttribute('aria-busy', 'true');
    try {
      await loadApi();
      if (mode !== 'youtube') return;
      cover.hidden = true;
      shell.querySelector('#youtube-film').hidden = false;
      player = new window.YT.Player('youtube-film', {
        host: 'https://www.youtube-nocookie.com',
        videoId,
        width: '100%',
        height: '100%',
        playerVars: { playsinline: 1, rel: 0, origin: location.origin, cc_lang_pref: 'en' },
        events: {
          onReady: event => {
            event.target.getIframe().referrerPolicy = 'strict-origin-when-cross-origin';
            if (mode !== 'youtube') return;
            event.target.seekTo(pendingTime, true);
            event.target.playVideo();
          },
          onStateChange: event => {
            clearInterval(timer);
            if (mode !== 'youtube') return;
            if ([window.YT.PlayerState.PLAYING, window.YT.PlayerState.PAUSED, window.YT.PlayerState.ENDED].includes(event.data)) clearTimeout(startupTimer);
            if (event.data === window.YT.PlayerState.PLAYING) {
              timer = setInterval(() => highlight(player.getCurrentTime()), 1000);
            }
          },
          onError: () => {
            if (mode === 'youtube') playDirect(pendingTime);
          }
        }
      });
    } catch {
      if (mode === 'youtube') playDirect(pendingTime);
    }
  }
  cover.onclick = () => play();
  buttons.forEach(button => button.onclick = () => play(Number(button.dataset.time)));
  options.forEach(button => button.onclick = () => {
    const time = mode === 'direct' ? film.currentTime : player?.getCurrentTime?.() ?? pendingTime;
    if (button.dataset.player === 'direct') playDirect(time);
    else {
      setMode('youtube');
      play(time);
    }
  });
}
