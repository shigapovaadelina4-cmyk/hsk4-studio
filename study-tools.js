(() => {
  'use strict';

  function init() {
    document.getElementById('release-note')?.remove();

    document.querySelector('main.wrap > footer')?.remove();

    const subtitle = document.querySelector('header > p');
    if (subtitle) subtitle.textContent = 'Карточки, грамматика, практика и аудирование · 20 уроков · Ярослав — мой любимый парень';

    function foldLessonList(id) {
      const list = document.getElementById(id);
      const heading = list?.previousElementSibling;
      if (!list || heading?.tagName !== 'H3') return;

      const details = document.createElement('details');
      details.className = 'lesson-group';
      const summary = document.createElement('summary');
      summary.textContent = heading.textContent;
      heading.replaceWith(details);
      details.append(summary, list);
      list.addEventListener('click', event => {
        if (event.target.closest('button.lesson')) details.open = false;
      });
    }

    foldLessonList('partA');
    foldLessonList('partB');

    const cards = document.getElementById('cards');
    if (!cards || typeof demo === 'undefined' || typeof saved === 'undefined') return;

    const style = document.createElement('style');
    style.textContent = `
      .lesson-group { margin: 12px 0 16px; }
      .lesson-group summary { cursor: pointer; padding: 14px 16px;
        border: 1px solid #e8dce8; border-radius: 14px; background: #fff;
        color: #49344d; font-weight: 700; }
      .lesson-group summary:hover, .lesson-group summary:focus-visible {
        background: #f6eaf5; border-color: #ac75a5; }
      .lesson-group .lessons { margin: 12px 0 4px; }
      .review-panel { position: relative; isolation: isolate; overflow: hidden;
        margin: 0; padding: 16px; border: 1px solid #e7c9e4;
        border-radius: 20px; background: linear-gradient(145deg, #fff8fc, #f7edff); }
      .card-study-area { display: grid; grid-template-columns: minmax(0, 1.3fr) minmax(300px, 1fr);
        gap: 14px; align-items: stretch; margin: 12px 0 4px; }
      #cards .card-study-area .flash { min-height: 250px; padding: 18px; }
      #cards .card-study-area .flash .hanzi { font-size: clamp(48px, 6vw, 76px); }
      #cards .card-study-area #backWord { font-size: 42px !important; }
      .review-panel::before { content: '✿'; position: absolute; top: -31px; right: 20px;
        font-size: 105px; line-height: 1; color: #edcee9; opacity: .72;
        pointer-events: none; z-index: 0; transform: rotate(-18deg); }
      .review-panel::after { content: '✦'; position: absolute; right: 86px; top: 23px;
        font-size: 21px; color: #d9a0c9; pointer-events: none; z-index: 0; }
      .review-panel > * { position: relative; z-index: 1; }
      .review-panel h3 { margin: 0 42px 6px 0; color: #653c72; font-size: 20px; }
      .review-panel p { margin: 0 0 8px; }
      .review-panel .review-status { display: inline-block; margin: 3px 0;
        padding: 5px 10px; border-radius: 999px; background: #fff;
        color: #704b7a; font-size: 13px; box-shadow: 0 2px 9px #86538b12; }
      .review-words { display: flex; flex-wrap: wrap; gap: 6px; margin: 8px 0;
        max-height: 156px; overflow-y: auto; align-content: flex-start; }
      .review-word { display: inline-flex; align-items: center; gap: 2px; padding: 2px;
        border: 1px solid #dfb9dc; border-radius: 999px; background: #fff; }
      .review-word.is-current { border-color: #9059ab; box-shadow: 0 0 0 2px #dbc0e8; }
      .review-word button { border: 0;
        background: linear-gradient(180deg, #fff, #fff0fa); color: #5b3566;
        border-radius: 999px; padding: 5px 9px; cursor: pointer;
        font: inherit; font-size: 15px; font-weight: 650; }
      .review-word button:hover { background: #f3e4f5; }
      .review-word .review-done { color: #247752; }
      .review-word .review-remove { color: #99556b; }
      .review-actions { display: flex; flex-wrap: wrap; gap: 7px; align-items: center; }
      .review-actions .review-clear { border: 1px solid #dfb9dc; border-radius: 999px;
        padding: 8px 11px; background: #fff; color: #7d526a; font: inherit;
        font-size: 13px; cursor: pointer; }
      .review-actions .review-clear:disabled { opacity: .5; cursor: default; }
      .review-panel .review-next { border: 0; border-radius: 999px;
        padding: 9px 14px; background: linear-gradient(120deg, #b96aab, #7958a5);
        color: white; font: inherit; font-weight: 700;
        box-shadow: 0 6px 15px #7958a54a;
        transition: transform .18s, box-shadow .18s; }
      .review-panel .review-next::before { content: '✿'; margin-right: 5px; }
      .review-panel .review-next:hover:not(:disabled) { transform: translateY(-2px);
        box-shadow: 0 9px 20px #7958a55c; }
      .review-panel .review-next:disabled { opacity: .55; cursor: default;
        box-shadow: none; }
      .review-panel button:focus-visible { outline: 3px solid #9b5ba8;
        outline-offset: 3px; }
      #cards .controls [data-rate] { border: 1px solid #ffffffb8;
        border-radius: 999px; box-shadow: 0 5px 12px #86538b1c;
        font-weight: 700; transition: transform .18s, box-shadow .18s; }
      #cards .controls [data-rate]:hover { transform: translateY(-2px);
        box-shadow: 0 8px 16px #86538b30; }
      @media (max-width: 760px) {
        .card-study-area { grid-template-columns: 1fr; }
        .card-study-area .review-panel { order: -1; }
        #cards .card-study-area .flash { min-height: 195px; }
        .review-words { max-height: 110px; }
      }
      @media (prefers-reduced-motion: reduce) {
        .review-panel button, #cards .controls [data-rate] { transition: none; }
      }
    `;
    document.head.append(style);

    const panel = document.createElement('section');
    panel.className = 'review-panel';
    panel.setAttribute('aria-label', 'Повторение сложных слов');
    panel.innerHTML = '<h3>🌸 Повторить сложные слова</h3>' +
      '<p class="muted small">Нажми слово, чтобы открыть карточку. ✓ — выучено, × — убрать из списка.</p>' +
      '<p class="review-status" role="status"></p>' +
      '<div class="review-words"></div>' +
      '<div class="review-actions"><button type="button" class="review-next">Следующее →</button>' +
      '<button type="button" class="review-clear">Очистить список</button>' +
      '<button type="button" class="review-clear review-undo" disabled>Отменить</button></div>';
    const studyArea = document.createElement('div');
    studyArea.className = 'card-study-area';
    const flash = document.getElementById('flash');
    flash.before(studyArea);
    studyArea.append(flash, panel);

    const status = panel.querySelector('.review-status');
    const words = panel.querySelector('.review-words');
    const next = panel.querySelector('.review-next');
    const clear = panel.querySelector('.review-clear');
    const undo = panel.querySelector('.review-undo');
    let lastChange = null;

    function difficultIndices() {
      return demo.flatMap((card, i) =>
        saved[card.w] === 'no' || saved[card.w] === 'hard' ? [i] : []);
    }

    function openCard(i) {
      index = i;
      flipped = false;
      renderCard();
      renderReview();
      flash.focus({ preventScroll: true });
    }

    function renderReview() {
      const indices = difficultIndices();
      const rated = demo.filter(card => saved[card.w] === 'no' ||
        saved[card.w] === 'hard' || saved[card.w] === 'yes').length;
      status.textContent = `Отмечено ${rated} из ${demo.length} · Повторить: ${indices.length}`;
      words.replaceChildren();
      next.disabled = indices.length === 0;
      clear.disabled = indices.length === 0;

      if (!indices.length) {
        const empty = document.createElement('span');
        empty.className = 'muted small';
        empty.textContent = rated ? 'Сложных слов пока нет — отличный результат!' :
          'Оцени карточки выше, и здесь появится список для повторения.';
        words.append(empty);
        return;
      }

      indices.forEach(i => {
        const card = demo[i];
        const item = document.createElement('span');
        item.className = 'review-word' + (i === index ? ' is-current' : '');
        const open = document.createElement('button');
        open.type = 'button';
        open.textContent = card.w;
        open.title = saved[card.w] === 'no' ? 'Открыть · Не знаю' : 'Открыть · С трудом';
        open.onclick = () => openCard(i);
        const done = document.createElement('button');
        done.type = 'button';
        done.className = 'review-done';
        done.textContent = '✓';
        done.setAttribute('aria-label', `Отметить «${card.w}» как выученное`);
        done.title = 'Знаю';
        done.onclick = () => updateWord(card.w, 'yes');
        const remove = document.createElement('button');
        remove.type = 'button';
        remove.className = 'review-remove';
        remove.textContent = '×';
        remove.setAttribute('aria-label', `Убрать «${card.w}» из повторения`);
        remove.title = 'Убрать отметку';
        remove.onclick = () => updateWord(card.w, null);
        item.append(open, done, remove);
        words.append(item);
      });
    }

    function updateWord(word, value) {
      lastChange = [[word, saved[word]]];
      if (value === null) delete saved[word];
      else saved[word] = value;
      undo.disabled = false;
      persist();
      renderCard();
      renderReview();
    }

    next.onclick = () => {
      const indices = difficultIndices();
      if (!indices.length) return;
      const current = indices.indexOf(index);
      openCard(indices[(current + 1) % indices.length]);
    };

    clear.onclick = () => {
      if (!window.confirm('Убрать все сложные слова из повторения? Отметки «Знаю» сохранятся.')) return;
      lastChange = difficultIndices().map(i => [demo[i].w, saved[demo[i].w]]);
      lastChange.forEach(([word]) => delete saved[word]);
      undo.disabled = false;
      persist();
      renderCard();
      renderReview();
    };

    undo.onclick = () => {
      if (!lastChange) return;
      lastChange.forEach(([word, value]) => {
        if (value === undefined) delete saved[word];
        else saved[word] = value;
      });
      lastChange = null;
      undo.disabled = true;
      persist();
      renderCard();
      renderReview();
    };

    document.querySelectorAll('#cards [data-rate]').forEach(button => {
      button.addEventListener('click', () => {
        lastChange = null;
        undo.disabled = true;
        renderReview();
      });
    });
    renderReview();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
