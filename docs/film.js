// Load the complete film from YouTube only after a play or chapter click.
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
  const cover = shell.querySelector('.film-cover');
  const watch = document.createElement('a');
  watch.href = watchUrl;
  watch.target = '_blank';
  watch.rel = 'noopener';
  watch.textContent = 'Watch on YouTube ↗';
  document.querySelector('.film-links').prepend(watch);

  let player, apiPromise, pendingTime = 0, timer;
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
    if (player?.seekTo) {
      player.seekTo(time, true);
      player.playVideo();
      return;
    }
    if (shell.dataset.loading) return;
    shell.dataset.loading = 'true';
    cover.setAttribute('aria-busy', 'true');
    try {
      await loadApi();
      cover.hidden = true;
      shell.querySelector('#youtube-film').hidden = false;
      player = new window.YT.Player('youtube-film', {
        videoId,
        width: '100%',
        height: '100%',
        playerVars: { playsinline: 1, rel: 0, origin: location.origin, cc_lang_pref: 'en' },
        events: {
          onReady: event => {
            event.target.seekTo(pendingTime, true);
            event.target.playVideo();
          },
          onStateChange: event => {
            clearInterval(timer);
            if (event.data === window.YT.PlayerState.PLAYING) {
              timer = setInterval(() => highlight(player.getCurrentTime()), 1000);
            }
          }
        }
      });
    } catch {
      delete shell.dataset.loading;
      cover.removeAttribute('aria-busy');
      window.open(watchUrl, '_blank', 'noopener');
    }
  }
  cover.onclick = () => play();
  buttons.forEach(button => button.onclick = () => play(Number(button.dataset.time)));
}
