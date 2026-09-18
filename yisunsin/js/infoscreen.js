import { step, swipeDir } from './pager.js';

function lineCell(line, reels, rows) {
  const cells = [];
  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < reels; c += 1) {
      cells.push(`<i class="pl-c${line[c] === r ? ' on' : ''}"></i>`);
    }
  }
  return `<div class="pl" style="--pl-cols:${reels}">${cells.join('')}</div>`;
}

function pageHtml(page) {
  const head = `<h3>${page.title}</h3>${page.note ? `<p class="sheet-note">${page.note}</p>` : ''}`;

  if (page.id === 'paylines') {
    const grids = page.lines
      .map((line, i) => `<div class="pl-box"><span class="pl-n">${i + 1}</span>`
        + `${lineCell(line, page.gridReels, page.gridRows)}</div>`)
      .join('');
    return `${head}<div class="pl-wrap">${grids}</div>`;
  }

  const rows = page.rows.map((r) => `
    <li class="feat-card${r.asset ? '' : ' no-ico'}">
      ${r.asset ? `<img src="${r.asset}" alt="" width="96" height="96" loading="lazy">` : ''}
      <div class="feat-txt"><strong>${r.name}</strong><span>${r.how}</span></div>
    </li>`).join('');
  return `${head}<ul class="feat-grid">${rows}</ul>`;
}

export function createInfoScreen($, plan) {
  const total = plan.pages.length;
  let at = 0;
  let built = false;

  const paint = () => {
    const body = $('#info-body');
    if (body) body.innerHTML = pageHtml(plan.pages[at]);
    const dots = $('#info-dots');
    if (dots) {
      dots.innerHTML = plan.pages
        .map((p, i) => `<i class="dot${i === at ? ' on' : ''}" data-go="${i}"></i>`).join('');
    }

    const prev = $('#info-prev');
    const next = $('#info-next');
    if (prev) prev.disabled = at === 0;
    if (next) next.disabled = at === total - 1;
    if (body) body.scrollTop = 0;
  };

  const go = (dir) => {
    const to = step(at, dir, total);
    if (to === at) return;
    at = to;
    paint();
  };

  return {
    build() {
      if (built) return;
      built = true;
      paint();

      $('#info-prev').addEventListener('click', () => go(-1));
      $('#info-next').addEventListener('click', () => go(+1));

      $('#info-dots').addEventListener('click', (ev) => {
        const i = ev.target && ev.target.dataset && ev.target.dataset.go;
        if (i == null) return;
        at = step(Number(i), 0, total);
        paint();
      });

      const body = $('#info-body');
      let sx = 0;
      let sy = 0;
      body.addEventListener('touchstart', (ev) => {
        const t = ev.touches && ev.touches[0];
        if (t) { sx = t.clientX; sy = t.clientY; }
      }, { passive: true });
      body.addEventListener('touchend', (ev) => {
        const t = ev.changedTouches && ev.changedTouches[0];
        if (!t) return;
        go(swipeDir(t.clientX - sx, t.clientY - sy));
      }, { passive: true });
    },

    reset() {
      at = 0;
      if (built) paint();
    },

    move(dir) {
      go(dir);
    },
  };
}
