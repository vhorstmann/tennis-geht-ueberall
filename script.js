let allVideos = [];

function setStatus(message, type = '') {
  const status = document.getElementById('status');
  status.className = `status ${type}`.trim();
  status.textContent = message || '';
}

function renderVideos(videos) {
  const grid = document.querySelector('.video-grid');
  if (!videos.length) {
    grid.innerHTML = '<p class="empty">Keine Videos gefunden.</p>';
    return;
  }
  const items = videos.map(video => {
    const posterAttr = video.poster ? ` poster="${video.poster}"` : '';
    const fileAttr = video.file ? ` data-src="${video.file}"` : '';
    return `
      <article class="video-card" role="listitem">
        <video controls playsinline preload="metadata"${posterAttr}${fileAttr} aria-label="${video.title}">
          <!-- Quelle wird via IntersectionObserver gesetzt -->
        </video>
        <h3>${video.title}</h3>
        <p class="meta">${video.year}</p>
        ${video.description ? `<p class="desc">${video.description}</p>` : ''}
      </article>
    `;
  }).join('');
  grid.innerHTML = items;

  // Lazy-Loading für Videos (Quelle erst setzen, wenn sichtbar)
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const v = e.target;
        const src = v.dataset.src;
        if (src && !v.dataset.loaded) {
          const s = document.createElement('source');
          s.src = src;
          s.type = 'video/mp4';
          v.appendChild(s);
          v.load();
          v.dataset.loaded = 'true';
        }
        io.unobserve(v);
      }
    });
  }, { rootMargin: '200px' });

  document.querySelectorAll('video[data-src]').forEach(v => io.observe(v));
}

function populateYearFilter(videos) {
  const yearFilter = document.getElementById('yearFilter');
  const years = [...new Set(videos.map(v => v.year))]
    .filter(y => typeof y === 'number' || typeof y === 'string')
    .map(y => Number(y))
    .filter(Number.isFinite)
    .sort((a,b) => b - a);
  const options = years.map(y => `<option value="${y}">${y}</option>`).join('');
  yearFilter.insertAdjacentHTML('beforeend', options);
}

function applyFilter() {
  const yearFilter = document.getElementById('yearFilter');
  const selected = yearFilter.value;
  const filtered = selected ? allVideos.filter(v => String(v.year) === selected) : allVideos;
  renderVideos(filtered);
}

// Init
document.addEventListener('DOMContentLoaded', () => {
  setStatus('Lade Videos...');
  fetch('videos.json', { cache: 'no-store' })
    .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
    .then(videos => {
      allVideos = Array.isArray(videos) ? videos : [];
      populateYearFilter(allVideos);
      renderVideos(allVideos);
      setStatus('');
    })
    .catch(err => {
      console.error('Fehler beim Laden der Videos:', err);
      setStatus('Videos konnten nicht geladen werden.', 'error');
    });

  document.getElementById('yearFilter').addEventListener('change', applyFilter);
});
