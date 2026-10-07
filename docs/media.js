// Fetch off-screen covers shortly before their media enters the viewport.
export function loadCover(element) {
  if (element.dataset.poster) {
    element.poster = element.dataset.poster;
    delete element.dataset.poster;
  }
  if (element.dataset.src) {
    element.src = element.dataset.src;
    delete element.dataset.src;
  }
  if (element.dataset.href) {
    element.setAttribute('href', element.dataset.href);
    delete element.dataset.href;
  }
}

const covers = new IntersectionObserver(entries => {
  for (const entry of entries) {
    if (!entry.isIntersecting) continue;
    loadCover(entry.target);
    covers.unobserve(entry.target);
  }
}, {rootMargin: '400px 0px'});

export function deferCovers(root = document) {
  root.querySelectorAll('video[data-poster], img[data-src], image[data-href]')
    .forEach(element => covers.observe(element));
}

export function setPoster(video, url) {
  video.dataset.poster = url;
  const rect = video.getBoundingClientRect();
  if ((rect.width || rect.height) && rect.bottom > -400 && rect.top < innerHeight + 400) {
    loadCover(video);
  } else {
    covers.observe(video);
  }
}
