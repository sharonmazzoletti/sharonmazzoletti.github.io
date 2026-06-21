document.addEventListener('DOMContentLoaded', async () => {
  await Promise.all([initCarousel(), initRepertoire()]);
});

/* ===== Events Carousel ===== */

async function initCarousel() {
  let events;
  try {
    const res = await fetch('./data/events.json');
    const json = await res.json();
    events = json.events;
  } catch {
    console.warn('Could not load events.json. Use a local HTTP server for development.');
    return;
  }

  const track = document.getElementById('carouselTrack');
  if (!track) return;

  track.innerHTML = events.map(renderSlide).join('');

  // Wire ICS download on each date span
  track.querySelectorAll('.carousel__slide').forEach((slide, si) => {
    slide.querySelectorAll('.date-ics').forEach(span => {
      span.addEventListener('click', () => {
        downloadIcs(events[si], events[si].dates[+span.dataset.idx]);
      });
    });
  });

  const wrapper = document.getElementById('carouselWrapper');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');

  if (!wrapper || !prevBtn || !nextBtn) return;

  function getSlideWidth() {
    const slide = track.querySelector('.carousel__slide');
    if (!slide) return 0;
    // include margin-left so we scroll by exactly one card + its leading gap
    return slide.offsetWidth + (parseInt(getComputedStyle(slide).marginLeft) || 0);
  }

  function updateButtons() {
    const slides = Array.from(track.querySelectorAll('.carousel__slide'));
    if (!slides.length) return;
    const maxScroll = wrapper.scrollWidth - wrapper.clientWidth;
    const tol = 2;

    // On mobile, cards use scroll-snap-align:center so the first card rests at
    // scrollLeft ≈ gutter/2 (not 0) and the last at scrollMax − trailing space.
    // Calculate each card's true snap-scroll from its current viewport position
    // so the threshold is always correct regardless of card width or spacing.
    if (getComputedStyle(slides[0]).scrollSnapAlign === 'center') {
      const wLeft = wrapper.getBoundingClientRect().left;
      const hw    = wrapper.clientWidth / 2;
      const snapOf = s => {
        const r = s.getBoundingClientRect();
        return wrapper.scrollLeft + (r.left - wLeft + r.width / 2) - hw;
      };
      prevBtn.disabled = wrapper.scrollLeft <= Math.max(0, snapOf(slides[0])) + tol;
      nextBtn.disabled = wrapper.scrollLeft >= Math.min(maxScroll, snapOf(slides[slides.length - 1])) - tol;
    } else {
      // Desktop: start-snap, first card is at 0, last at scrollMax
      prevBtn.disabled = wrapper.scrollLeft <= tol;
      nextBtn.disabled = wrapper.scrollLeft >= maxScroll - tol;
    }
  }

  function checkFit() {
    const slides = Array.from(track.querySelectorAll('.carousel__slide'));
    if (!slides.length) return;
    // measure actual rendered widths + margins (same method as KiK)
    let totalWidth = 0;
    slides.forEach((slide, i) => {
      const style = getComputedStyle(slide);
      totalWidth += slide.offsetWidth + (parseInt(style.marginLeft) || 0);
      if (i === slides.length - 1) {
        totalWidth += parseInt(style.marginRight) || 0;
      }
    });
    track.classList.toggle('cards-fit', totalWidth <= wrapper.clientWidth);
  }

  prevBtn.addEventListener('click', () => {
    wrapper.scrollBy({ left: -getSlideWidth(), behavior: 'smooth' });
  });

  nextBtn.addEventListener('click', () => {
    wrapper.scrollBy({ left: getSlideWidth(), behavior: 'smooth' });
  });

  wrapper.addEventListener('scroll', updateButtons, { passive: true });

  const ro = new ResizeObserver(() => { checkFit(); updateButtons(); });
  ro.observe(wrapper);

  checkFit();
  updateButtons();
}

function renderSlide(event) {
  const target = event.button.newTab ? ' target="_blank" rel="noopener"' : '';
  const datesHtml = (event.dates || []).map((d, j) =>
    `<p><span class="date-ics" data-idx="${j}" title="Zum Kalender hinzufügen">${esc(d.date)}</span><br>${esc(d.location)}</p>`
  ).join('');
  return `
    <li class="carousel__slide">
      <div class="carousel__slide__image-wrap">
        <img src="${esc(event.imageUrl)}" alt="${esc(event.imageAlt)}" loading="lazy">
      </div>
      <div class="carousel__slide__content">
        <h2 class="carousel__slide__title">${esc(event.title)}</h2>
        <div class="carousel__slide__desc"><div class="carousel__slide__dates">${datesHtml}</div>${event.description || ''}</div>
        <div class="carousel__slide__footer">
          <a class="carousel__slide__btn" href="${esc(event.button.href)}"${target}>${esc(event.button.text)}</a>
        </div>
      </div>
    </li>`;
}

/* ===== ICS generation ===== */

function parseIcsDate(dateStr) {
  // "Sa, 30.05.26, 19:00" → { year, month, day, hours, minutes }
  const m = dateStr.match(/(\d{2})\.(\d{2})\.(\d{2}),?\s*(\d{2}):(\d{2})/);
  if (!m) return null;
  return { year: 2000 + +m[3], month: +m[2], day: +m[1], hours: +m[4], minutes: +m[5] };
}

function fmtIcal(c, addHours = 0) {
  const d = new Date(c.year, c.month - 1, c.day, c.hours + addHours, c.minutes);
  const p = n => n.toString().padStart(2, '0');
  return `${d.getFullYear()}${p(d.getMonth()+1)}${p(d.getDate())}T${p(d.getHours())}${p(d.getMinutes())}00`;
}

function stripHtml(html) {
  return (html || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ');
}

function downloadIcs(event, dateEntry) {
  const c = parseIcsDate(dateEntry.date);
  if (!c) return;

  const uid = `${event.id}-${dateEntry.date.replace(/[^0-9]/g, '')}@sharonmazzoletti.ch`;
  const now = new Date();
  const p = n => n.toString().padStart(2, '0');
  const stamp = `${now.getUTCFullYear()}${p(now.getUTCMonth()+1)}${p(now.getUTCDate())}T${p(now.getUTCHours())}${p(now.getUTCMinutes())}${p(now.getUTCSeconds())}Z`;
  const desc = stripHtml(event.description).replace(/\n/g, '\\n');

  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Sharon Mazzoletti//Events//DE',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${stamp}`,
    `DTSTART:${fmtIcal(c)}`,
    `DTEND:${fmtIcal(c, 2)}`,
    `SUMMARY:${event.title}`,
    `LOCATION:${dateEntry.location}`,
    `DESCRIPTION:${desc}`,
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${event.id || 'konzert'}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/* ===== Repertoire ===== */

async function initRepertoire() {
  let data;
  try {
    const res = await fetch('./data/repertoire.json');
    data = await res.json();
  } catch {
    return;
  }

  const list = document.querySelector('.repertoire__list');
  if (!list) return;

  const items = data.items || [];
  list.innerHTML = items.map(item =>
    `<li class="repertoire__item">${esc(item)}</li>`
  ).join('');
}

function esc(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
