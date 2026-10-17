(() => {
  'use strict';

  function init() {
    const games = document.getElementById('games');
    if (!games || typeof demo === 'undefined' || demo.length < 4) return;

    const style = document.createElement('style');
    style.textContent = `
      .pinyin-game { position: relative; overflow: hidden; margin-top: 26px;
        padding: 22px; border: 1px solid #e1d2eb; border-radius: 20px;
        background: linear-gradient(145deg, #fbf7ff, #fff8fc); }
      .pinyin-game::after { content: '✿'; position: absolute; right: 16px; top: -28px;
        color: #ead6ed; font-size: 100px; line-height: 1; pointer-events: none; }
      .pinyin-game > * { position: relative; z-index: 1; }
      .pinyin-game h3 { margin: 0 60px 6px 0; }
      .pinyin-game .sprint-track { height: 8px; overflow: hidden;
        border-radius: 999px; background: #eadfed; margin: 15px 0; }
      .pinyin-game .sprint-fill { height: 100%; width: 0;
        background: linear-gradient(90deg, #d790b8, #8862b2);
        transition: width .2s; }
      .pinyin-game .sprint-prompt { font-size: clamp(30px, 8vw, 46px);
        font-weight: 750; color: #673d76; margin: 8px 0 2px; }
      .pinyin-game .sprint-hint { color: #76637d; margin: 0 0 16px; }
      .pinyin-game .sprint-options { display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
      .pinyin-game .sprint-options button { min-height: 66px; padding: 10px;
        border: 1px solid #dfcde8; border-radius: 14px;
        background: #fff; color: #4d3659; font: inherit; font-size: 25px;
        box-shadow: 0 3px 10px #76578212; transition: transform .15s, background .15s; }
      .pinyin-game .sprint-options button:hover:not(:disabled) {
        transform: translateY(-2px); background: #f8edfb; }
      .pinyin-game .sprint-options button:disabled { cursor: default; opacity: 1; }
      .pinyin-game .sprint-options button.is-correct { border-color: #76b995;
        background: #e4f7ec; color: #176945; }
      .pinyin-game .sprint-options button.is-wrong { border-color: #dda2ab;
        background: #fff0f1; color: #9c4050; }
      .pinyin-game .sprint-feedback { min-height: 48px; margin: 13px 0;
        line-height: 1.5; }
      .pinyin-game .sprint-next { border: 0; border-radius: 999px;
        padding: 12px 20px; color: white; font: inherit; font-weight: 700;
        background: linear-gradient(120deg, #b96aab, #7958a5);
        box-shadow: 0 5px 14px #7958a53b; }
      .pinyin-game .sprint-next:disabled { opacity: .5; cursor: default; }
      .pinyin-game button:focus-visible { outline: 3px solid #8653a1;
        outline-offset: 2px; }
      @media (max-width: 520px) { .pinyin-game { padding: 17px; }
        .pinyin-game .sprint-options { grid-template-columns: 1fr 1fr; }
        .pinyin-game .sprint-options button { font-size: 21px; }
        .pinyin-game .sprint-next { width: 100%; } }
      @media (prefers-reduced-motion: reduce) {
        .pinyin-game button, .pinyin-game .sprint-fill { transition: none; }
      }
    `;
    document.head.append(style);

    const game = document.createElement('section');
    game.className = 'pinyin-game';
    game.innerHTML = '<h3>🕵️ Пиньинь-детектив</h3>' +
      '<p class="muted small">Прочитай pinyin и выбери нужные иероглифы. Подсказка — перевод слова. В раунде 10 случайных слов.</p>' +
      '<div class="sprint-track"><div class="sprint-fill"></div></div>' +
      '<p class="sprint-status muted small" aria-live="polite"></p>' +
      '<div class="sprint-prompt"></div><p class="sprint-hint"></p>' +
      '<div class="sprint-options"></div>' +
      '<p class="sprint-feedback" role="status"></p>' +
      '<button type="button" class="sprint-next" disabled>Следующее слово →</button>';
    games.append(game);

    const status = game.querySelector('.sprint-status');
    const fill = game.querySelector('.sprint-fill');
    const prompt = game.querySelector('.sprint-prompt');
    const hint = game.querySelector('.sprint-hint');
    const options = game.querySelector('.sprint-options');
    const feedback = game.querySelector('.sprint-feedback');
    const next = game.querySelector('.sprint-next');
    const bestKey = 'hsk4-pinyin-detective-best-v1';
    let best = 0;
    try { best = Number(localStorage.getItem(bestKey)) || 0; } catch (_) {}
    let round = [];
    let position = 0;
    let score = 0;
    let streak = 0;
    let answered = false;

    function shuffle(items) {
      const result = [...items];
      for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
      }
      return result;
    }

    function render() {
      options.replaceChildren();
      feedback.textContent = '';
      answered = false;
      fill.style.width = `${Math.round(position / round.length * 100)}%`;

      if (position === round.length) {
        if (score > best) {
          best = score;
          try { localStorage.setItem(bestKey, String(best)); } catch (_) {}
        }
        status.textContent = `Раунд завершён · Рекорд: ${best} из ${round.length}`;
        prompt.textContent = '🌸 Готово!';
        hint.textContent = `Ты угадала ${score} из ${round.length} слов. Попробуй ещё один раунд?`;
        next.textContent = 'Сыграть ещё ↻';
        next.disabled = false;
        return;
      }

      const word = round[position];
      status.textContent = `Слово ${position + 1} из ${round.length} · Верно: ${score} · Серия: ${streak} · Рекорд: ${best}`;
      prompt.textContent = word.p;
      hint.textContent = `Подсказка: ${word.r}`;
      next.textContent = 'Следующее слово →';
      next.disabled = true;

      const others = shuffle(demo.filter(item => item.w !== word.w))
        .filter((item, i, items) => items.findIndex(candidate => candidate.w === item.w) === i)
        .slice(0, 3);
      shuffle([word, ...others]).forEach(item => {
        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = item.w;
        button.onclick = () => {
          if (answered) return;
          answered = true;
          const correct = item.w === word.w;
          if (correct) { score++; streak++; } else { streak = 0; }
          options.querySelectorAll('button').forEach(choice => {
            choice.disabled = true;
            if (choice.textContent === word.w) choice.classList.add('is-correct');
            else if (choice === button) choice.classList.add('is-wrong');
          });
          feedback.textContent = correct ? `✓ Верно! ${word.w} — ${word.r}` :
            `✕ Это ${item.w}. Правильный ответ: ${word.w} — ${word.r}`;
          status.textContent = `Слово ${position + 1} из ${round.length} · Верно: ${score} · Серия: ${streak} · Рекорд: ${best}`;
          next.disabled = false;
        };
        options.append(button);
      });
    }

    function startRound() {
      round = shuffle(demo).slice(0, Math.min(10, demo.length));
      position = 0;
      score = 0;
      streak = 0;
      render();
    }

    next.onclick = () => {
      if (position === round.length) startRound();
      else if (answered) { position++; render(); }
    };
    startRound();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
