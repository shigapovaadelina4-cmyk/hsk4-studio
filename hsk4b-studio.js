/* HSK Standard Course 4B — lessons 11–20.
   Words follow the lesson vocabulary; all example sentences are independent training material.
   The HSK 4A studio remains untouched. */
(() => {
  'use strict';
  const root=document.createElement('section');
  root.id='hsk4bStudio';root.className='hsk4b-studio';root.hidden=true;
  root.innerHTML=`<div class="hsk4b-header"><div><span class="hsk4b-kicker">📘 HSK STANDARD COURSE · 4B</span><h2 id="hsk4bTitle">Урок 11</h2></div><div id="hsk4bCounter" class="hsk4b-counter"></div></div>
  <p class="hsk4b-notice">Слова из словарей учебника. Предложения для запоминания написаны специально для сайта, это не цитаты из учебника.</p>
  <div class="hsk4b-toolbar"><button type="button" data-action="all" class="hsk4b-mode active">Все слова</button><button type="button" data-action="review" class="hsk4b-mode">🔁 Повторить незнакомые <span id="hsk4bUnknown">0</span></button></div>
  <div class="hsk4b-progress"><div id="hsk4bProgressFill"></div></div>
  <button type="button" id="hsk4bCard" class="hsk4b-card" aria-label="Перевернуть карточку" aria-pressed="false">
    <span class="hsk4b-face" id="hsk4bFace"></span>
  </button>
  <div class="hsk4b-rating"><button type="button" class="hsk4b-no" data-action="no">✕ Не знаю</button><button type="button" class="hsk4b-yes" data-action="yes">✓ Знаю</button></div>
  <p id="hsk4bStats" class="hsk4b-stats" aria-live="polite"></p>
  <div class="hsk4b-nav"><button type="button" data-action="prev">← Назад</button><button type="button" data-action="speak">🔊 Слово</button><button type="button" data-action="sentence">🔊 Пример</button><button type="button" data-action="next">Далее →</button></div>
  <div id="hsk4bNumbers" class="hsk4b-numbers" aria-label="Перейти к карточке"></div>`;
  const titles={
    11:'读书好，读好书，好读书 · Чтение',
    12:'用心发现世界 · Открывать мир',
    13:'喝着茶看京剧 · Пекинская опера',
    14:'保护地球母亲 · Беречь планету',
    15:'教育孩子的艺术 · Воспитание',
    16:'生活可以更美好 · Жить лучше',
    17:'人与自然 · Человек и природа',
    18:'科技与世界 · Технологии и мир',
    19:'生活的味道 · Вкус жизни',
    20:'路上的风景 · Дорога и путешествия'
  };
  const $=id=>root.querySelector('#'+id);
  const getStoreKey=n=>'hsk4b-card-progress-'+n;
  let lesson=11,words=[],index=0,review=false,flipped=false,ratings={};
  const cache={};
  const indices=()=>words.map((w,i)=>ratings[w[0]]==='no'?i:-1).filter(i=>i>=0);
  const activeIndices=()=>review?indices():words.map((_,i)=>i);
  function loadRatings(){
    try{const obj=JSON.parse(localStorage.getItem(getStoreKey(lesson))||'{}');ratings=obj&&typeof obj==='object'&&!Array.isArray(obj)?obj:{}}catch(e){ratings={}}
  }
  function saveRatings(){try{localStorage.setItem(getStoreKey(lesson),JSON.stringify(ratings))}catch(e){}}
  function pinyin(sentence){
    const converter=window.pinyinPro?.pinyin;
    if(typeof converter!=='function')return 'Пиньинь предложения загружается…';
    try{return converter(sentence,{toneType:'symbol'})}catch(e){return 'Пиньинь временно недоступен'}
  }
  function clear(el){el.replaceChildren()}
  function node(tag,cls,txt){
    const el=document.createElement(tag);if(cls)el.className=cls;if(txt!==undefined)el.textContent=txt;return el;
  }
  function say(text){
    if(!('speechSynthesis' in window))return;
    window.speechSynthesis.cancel();
    const utter=new SpeechSynthesisUtterance(text);utter.lang='zh-CN';utter.rate=.82;
    const voice=window.speechSynthesis.getVoices().find(v=>/^zh[-_]/i.test(v.lang));
    if(voice)utter.voice=voice;
    window.speechSynthesis.speak(utter);
  }
  function render(){
    if(!words.length){$('hsk4bFace').textContent='Словарь урока не загрузился.';return}
    const missed=indices(),queue=activeIndices();
    root.querySelector('[data-action="all"]').classList.toggle('active',!review);
    root.querySelector('[data-action="review"]').classList.toggle('active',review);
    $('hsk4bUnknown').textContent=String(missed.length);
    $('hsk4bTitle').textContent='Урок '+lesson+' · '+titles[lesson];
    const know=Object.values(ratings).filter(x=>x==='yes').length;
    $('hsk4bStats').textContent='Знаю: '+know+' · Повторить: '+missed.length+' · Всего слов: '+words.length;
    $('hsk4bProgressFill').style.width=Math.round(know/words.length*100)+'%';
    const face=$('hsk4bFace');clear(face);
    const nums=$('hsk4bNumbers');clear(nums);
    if(review&&!queue.length){
      $('hsk4bCounter').textContent='Нет незнакомых слов';
      face.append(node('span','hsk4b-complete','🎉 Отлично! Все трудные слова выучены. Можно вернуться к полному списку.'));
      $('hsk4bCard').setAttribute('aria-pressed','true');
      return;
    }
    if(!queue.includes(index))index=queue[0];
    const w=words[index];const position=queue.indexOf(index);
    $('hsk4bCounter').textContent=(review?'Повторение: ':'Слово ')+(position+1)+' из '+queue.length;
    $('hsk4bCard').setAttribute('aria-pressed',String(flipped));
    if(!flipped){
      face.append(node('span','hsk4b-hanzi',w[0]),node('span','hsk4b-hint','Нажми на карточку, чтобы увидеть пример'));
    }else{
      face.append(node('span','hsk4b-word',w[0]),node('span','hsk4b-word-pinyin',w[1]),node('span','hsk4b-translation',w[2]));
      const box=node('span','hsk4b-example');
      box.append(node('span','hsk4b-example-zh',w[3]),node('span','hsk4b-example-pinyin',pinyin(w[3])),node('span','hsk4b-example-ru',w[4]));
      face.append(box);
      face.append(node('span','hsk4b-credit','Авторский тренировочный пример'));
    }
    for(const n of queue){
      const btn=node('button','hsk4b-number'+(index===n?' active':'')+(ratings[words[n][0]]==='yes'?' learned':'')+(ratings[words[n][0]]==='no'?' unknown':''),String(n+1));
      btn.type='button';btn.setAttribute('aria-label','Карточка '+(n+1));
      btn.onclick=()=>{index=n;flipped=false;render()};nums.append(btn);
    }
  }
  function move(step){
    const queue=activeIndices();if(!queue.length)return;
    const p=queue.indexOf(index);index=queue[(p+step+queue.length)%queue.length];flipped=false;render();
  }
  function rate(value){
    if(!words.length)return;
    const before=activeIndices(),pos=before.indexOf(index);
    ratings[words[index][0]]=value;saveRatings();
    const after=activeIndices();
    if(after.length){const next=before[(pos+1)%before.length];index=after.includes(next)?next:after[Math.min(pos,after.length-1)]}
    flipped=false;render();
  }
  root.addEventListener('click',e=>{
    const b=e.target.closest('[data-action]');
    if(b){
      const action=b.dataset.action;
      if(action==='review'){review=true;index=indices()[0]??0;flipped=false;render()}
      if(action==='all'){review=false;index=0;flipped=false;render()}
      if(action==='no'||action==='yes')rate(action);
      if(action==='prev')move(-1);
      if(action==='next')move(1);
      if(action==='speak'&&words[index])say(words[index][0]);
      if(action==='sentence'&&words[index])say(words[index][3]);
      return;
    }
    if(e.target.closest('#hsk4bCard')&&activeIndices().length){flipped=!flipped;render()}
  });
  window.addEventListener('hsk-pinyin-ready',()=>{if(!root.hidden&&flipped)render()});
  async function open(n){
    lesson=n;index=0;review=false;flipped=false;loadRatings();root.hidden=false;
    $('hsk4bFace').textContent='Загружаю словарь урока '+n+'…';
    const old=document.querySelector('#sourceStudio');if(old)old.hidden=true;
    document.querySelector('#mainLessonStudio')?.setAttribute('hidden','');
    const panel=document.querySelector('main.wrap > .panel');if(panel)panel.style.display='none';
    try{
      if(!cache[n]){
        const response=await fetch('./hsk4b/lesson-'+n+'.json',{cache:'no-store'});
        if(!response.ok)throw Error('HTTP '+response.status);
        const json=await response.json();
        if(json.lesson!==n||!Array.isArray(json.items)||!json.items.length)throw Error('Неверный набор слов');
        cache[n]=json.items;
      }
      if(lesson!==n)return;
      words=cache[n];render();
      root.scrollIntoView({behavior:'smooth',block:'start'});
    }catch(err){$('hsk4bFace').textContent='Не удалось открыть слова урока '+n+'. Попробуй обновить страницу.';}
  }
  function mount(){
    const main=document.querySelector('main.wrap');if(!main)return;
    const studio=document.querySelector('#mainLessonStudio');
    if(studio)studio.insertAdjacentElement('afterend',root);else main.append(root);
    document.addEventListener('hsk-source-lesson',e=>{const n=Number(e.detail);if(n>=11&&n<=20)queueMicrotask(()=>open(n))});
    document.addEventListener('hsk-main-lesson',()=>{root.hidden=true});
    const partA=document.querySelector('#partA');if(partA)partA.addEventListener('click',()=>{root.hidden=true});
    document.addEventListener('click',e=>{if(e.target.closest('#partA .lesson'))root.hidden=true});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();
})();
