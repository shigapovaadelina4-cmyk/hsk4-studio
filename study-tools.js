(() => {
  'use strict';

  function init() {
    document.getElementById('release-note')?.remove();

    document.querySelector('main.wrap > footer')?.remove();

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
        margin-top: 22px; padding: 22px; border: 1px solid #e7c9e4;
        border-radius: 22px; background: linear-gradient(145deg, #fff8fc, #f7edff);
        box-shadow: 0 12px 30px #86538b14; }
      .review-panel::before { content: '✿'; position: absolute; top: -31px; right: 20px;
        font-size: 105px; line-height: 1; color: #edcee9; opacity: .72;
        pointer-events: none; z-index: 0; transform: rotate(-18deg); }
      .review-panel::after { content: '✦'; position: absolute; right: 86px; top: 23px;
        font-size: 21px; color: #d9a0c9; pointer-events: none; z-index: 0; }
      .review-panel > * { position: relative; z-index: 1; }
      .review-panel h3 { margin: 0 60px 8px 0; color: #653c72; }
      .review-panel p { margin: 0 0 14px; }
      .review-panel .review-status { display: inline-block; margin: 3px 0;
        padding: 7px 12px; border-radius: 999px; background: #fff;
        color: #704b7a; font-size: 14px; box-shadow: 0 2px 9px #86538b12; }
      .review-words { display: flex; flex-wrap: wrap; gap: 10px; margin: 15px 0; }
      .review-words button { border: 1px solid #dfb9dc;
        background: linear-gradient(180deg, #fff, #fff0fa); color: #5b3566;
        border-radius: 999px; padding: 9px 15px; cursor: pointer;
        font: inherit; font-size: 18px; font-weight: 650;
        box-shadow: 0 4px 10px #86538b17;
        transition: transform .18s, box-shadow .18s, background .18s; }
      .review-words button::before { content: '✿'; color: #d58ebd; margin-right: 7px; }
      .review-words button:hover { transform: translateY(-2px);
        background: #fff; box-shadow: 0 7px 15px #86538b26; }
      .review-panel .review-next { border: 0; border-radius: 999px;
        padding: 12px 20px; background: linear-gradient(120deg, #b96aab, #7958a5);
        color: white; font: inherit; font-weight: 700;
        box-shadow: 0 6px 15px #7958a54a;
        transition: transform .18s, box-shadow .18s; }
      .review-panel .review-next::before { content: '✿'; margin-right: 8px; }
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
      @media (max-width: 480px) { .review-panel { padding: 18px; }
        .review-panel .review-next { width: 100%; } }
      @media (prefers-reduced-motion: reduce) {
        .review-panel button, #cards .controls [data-rate] { transition: none; }
      }
    `;
    document.head.append(style);

    const panel = document.createElement('section');
    panel.className = 'review-panel';
    panel.setAttribute('aria-label', 'Повторение сложных слов');
    panel.innerHTML = '<h3>🌸 Повторить сложные слова</h3>' +
      '<p class="muted small">Слова с отметками «Не знаю» и «С трудом» появятся здесь. Нажми на слово, чтобы вернуться к карточке.</p>' +
      '<p class="review-status" role="status"></p>' +
      '<div class="review-words"></div>' +
      '<button type="button" class="review-next">Следующее сложное →</button>';
    cards.append(panel);

    const status = panel.querySelector('.review-status');
    const words = panel.querySelector('.review-words');
    const next = panel.querySelector('.review-next');

    function difficultIndices() {
      return demo.flatMap((card, i) =>
        saved[card.w] === 'no' || saved[card.w] === 'hard' ? [i] : []);
    }

    function openCard(i) {
      index = i;
      flipped = false;
      renderCard();
      document.getElementById('flash').scrollIntoView({ behavior: 'smooth', block: 'center' });
      document.getElementById('flash').focus();
    }

    function renderReview() {
      const indices = difficultIndices();
      const rated = demo.filter(card => saved[card.w] === 'no' ||
        saved[card.w] === 'hard' || saved[card.w] === 'yes').length;
      status.textContent = `Отмечено ${rated} из ${demo.length} · Повторить: ${indices.length}`;
      words.replaceChildren();
      next.disabled = indices.length === 0;

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
        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = card.w;
        button.title = saved[card.w] === 'no' ? 'Не знаю' : 'С трудом';
        button.onclick = () => openCard(i);
        words.append(button);
      });
    }

    next.onclick = () => {
      const indices = difficultIndices();
      if (!indices.length) return;
      const current = indices.indexOf(index);
      openCard(indices[(current + 1) % indices.length]);
    };

    document.querySelectorAll('#cards [data-rate]').forEach(button => {
      button.addEventListener('click', renderReview);
    });
    renderReview();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
