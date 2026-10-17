(() => {
  'use strict';

  function init() {
    document.getElementById('release-note')?.remove();

    const footer = document.querySelector('main.wrap > footer');
    if (footer) {
      footer.textContent = 'Учись в своём ритме: повторяй слова, тренируй грамматику и возвращайся к сложным заданиям.';
    }

    const cards = document.getElementById('cards');
    if (!cards || typeof demo === 'undefined' || typeof saved === 'undefined') return;

    const style = document.createElement('style');
    style.textContent = `
      .review-panel { margin-top: 22px; padding: 18px; border: 1px solid #dfcbe8;
        border-radius: 16px; background: #fbf5ff; }
      .review-panel h3 { margin: 0 0 7px; }
      .review-panel p { margin: 0 0 14px; }
      .review-words { display: flex; flex-wrap: wrap; gap: 8px; margin: 14px 0; }
      .review-words button { border: 1px solid #d8bde4; background: #fff;
        border-radius: 10px; padding: 8px 12px; cursor: pointer; font: inherit; }
      .review-words button:hover, .review-words button:focus-visible {
        border-color: #8653a1; background: #f0e2f8; }
      .review-panel .review-next:disabled { opacity: .55; cursor: default; }
    `;
    document.head.append(style);

    const panel = document.createElement('section');
    panel.className = 'review-panel';
    panel.setAttribute('aria-label', 'Повторение сложных слов');
    panel.innerHTML = '<h3>🔁 Повторить сложные слова</h3>' +
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
