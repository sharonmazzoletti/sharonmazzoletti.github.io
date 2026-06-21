'use strict';

function initEnsembleGallery(images) {
  if (!images || images.length === 0) return;

  let current = 0;
  let touchStartX = 0;

  const mainImg  = document.getElementById('ensGalleryMain');
  const thumbsEl = document.getElementById('ensGalleryThumbs');
  const prevBtn  = document.getElementById('ensGalleryPrev');
  const nextBtn  = document.getElementById('ensGalleryNext');
  const counter  = document.getElementById('ensGalleryCounter');

  if (!mainImg) return;

  function show(index) {
    current = (index + images.length) % images.length;
    mainImg.src = images[current];
    mainImg.alt = 'Bild ' + (current + 1);

    if (counter) counter.textContent = (current + 1) + ' / ' + images.length;

    if (thumbsEl) {
      Array.from(thumbsEl.querySelectorAll('.ens-gallery__thumb')).forEach((el, i) => {
        el.classList.toggle('is-active', i === current);
      });
    }
  }

  function buildThumbs() {
    if (!thumbsEl) return;
    thumbsEl.innerHTML = '';
    images.forEach((src, i) => {
      const img = document.createElement('img');
      img.className = 'ens-gallery__thumb';
      img.src = src;
      img.alt = 'Vorschau ' + (i + 1);
      img.loading = 'lazy';
      img.addEventListener('click', () => show(i));
      thumbsEl.appendChild(img);
    });
  }

  if (prevBtn) prevBtn.addEventListener('click', () => show(current - 1));
  if (nextBtn) nextBtn.addEventListener('click', () => show(current + 1));

  document.addEventListener('keydown', e => {
    const stage = document.querySelector('.ens-gallery');
    if (!stage) return;
    const rect = stage.getBoundingClientRect();
    if (rect.top > window.innerHeight || rect.bottom < 0) return;
    if (e.key === 'ArrowLeft')  { e.preventDefault(); show(current - 1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); show(current + 1); }
  });

  if (mainImg) {
    mainImg.addEventListener('touchstart', e => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    mainImg.addEventListener('touchend', e => {
      const diff = touchStartX - e.changedTouches[0].screenX;
      if (Math.abs(diff) > 50) show(diff > 0 ? current + 1 : current - 1);
    }, { passive: true });
  }

  buildThumbs();
  show(0);
}
