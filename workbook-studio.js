/* HSK 4A Studio: original, independently authored interactive practice.
   Not an edition, transcript, or answer key of HSK Standard Course Workbook. */
(() => {
'use strict';
const $=(tag,cls,txt)=>{const el=document.createElement(tag);if(cls)el.className=cls;if(txt!==undefined)el.textContent=txt;return el;};
const shuffle=(a,seed)=>{const b=[...a];for(let i=b.length-1;i>0;i--){let j=(seed*17+i*13+i*i)% (i+1);[b[i],b[j]]=[b[j],b[i]]}return b};
const normalize=v=>String(v||'').replace(/[\s，。！？!?、,.;；：:]/g,'').trim();
function splitSentence(sentence,words){
 const clean=sentence.replace(/[。！？!?]/g,'');
 const known=[...new Set([...words.map(w=>w[0]),'我们','他们','你们','这个','那个','今天','明天','每天','周末','一个','自己','老师','朋友','工作','学习','时候','没有','因为','所以','但是','还是','如果','可以','应该','知道','觉得','喜欢','很多','已经','非常','一起','正在','不管','只要','尽管','虽然','就是','首先','其次','另外','结果','最后','现在','来不及','差不多','通过','健康','生活','自己','重要','好看'])].sort((a,b)=>b.length-a.length);
 const parts=[];let i=0;
 while(i<clean.length){const ch=clean[i];if(/[，,；;：:\s]/.test(ch)){i++;continue}
  let match=known.find(w=>clean.startsWith(w,i));if(!match)match=clean.slice(i,i+Math.min(2,clean.length-i));parts.push(match);i+=match.length;
 }
 return parts.length>=2?parts:[clean];
}
function build(lesson){
 const words=lesson.words.filter(w=>w[0]&&w[1]&&w[2]);
 const grammar=lesson.grammar.filter(g=>g[2]&&g[3]);
 const items=[];
 const opts=(right,wrong,seed)=>shuffle([right,...[...new Set(wrong.filter(x=>x&&x!==right))].slice(0,3)],seed);
 const w=i=>words[i%words.length],g=i=>grammar[i%grammar.length];
 const add=(id,section,kind,prompt,answer,explanation,extra={})=>items.push({id,section,kind,prompt,answer,explanation,...extra});
 // Original workbook structure: 听力 1–22, 阅读 23–43, 书写 44–50.
 // These 50 prompts are ORIGINAL TRAINING ANALOGUES, not the copyrighted questions.
 for(let i=0;i<5;i++){
  const x=w(i);
  add('a-'+(i+1),'听力 1–5 · Аудирование','choice','Прослушай слово и выбери его перевод.',x[2],x[0]+' · '+x[1]+' · '+x[2],{audio:x[0],options:opts(x[2],words.map(y=>y[2]),i)});
 }
 for(let i=0;i<7;i++){
  const x=w(i+5);
  add('a-'+(i+6),'听力 6–12 · Аудирование','choice','Прослушай слово и выбери иероглифы.',x[0],x[0]+' · '+x[1]+' · '+x[2],{audio:x[0],options:opts(x[0],words.map(y=>y[0]),i+9)});
 }
 for(let i=0;i<10;i++){
  const x=g(i),other=grammar.filter(y=>y!==x).map(y=>y[3]);
  add('a-'+(i+13),'听力 13–22 · Аудирование','choice','Прослушай авторское предложение и выбери перевод.',x[3],x[2]+' · '+(x[5]||'')+' · '+x[3]+' · '+x[1],{audio:x[2],options:opts(x[3],other,i+23)});
 }
 for(let i=0;i<8;i++){
  const x=w(i+12);
  add('a-'+(i+23),'阅读 23–30 · Чтение','choice','Прочитай слово «'+x[0]+'» и выбери перевод.',x[2],x[0]+' · '+x[1]+' · '+x[2],{options:opts(x[2],words.map(y=>y[2]),i+35)});
 }
 for(let i=0;i<4;i++){
  const x=g(i);
  add('a-'+(i+31),'阅读 31–34 · Чтение','choice','Прочитай авторское предложение и выбери его перевод: '+x[2],x[3],x[2]+' · '+(x[5]||'')+' · '+x[3]+' · '+x[1],{options:opts(x[3],grammar.map(y=>y[3]),i+45)});
 }
 for(let i=0;i<9;i++){
  const x=g(i+4),matches=(x[0].match(/[\u3400-\u9fff]+/g)||[]);
  const answer=matches.find(t=>x[2].includes(t))||matches.flatMap(t=>[...t]).find(t=>x[2].includes(t))||((x[2].match(/[\u3400-\u9fff]{2,}/g)||[])[0]||'').slice(0,2);
  if(!answer)throw Error('Cannot generate grammar cloze');
  add('a-'+(i+35),'阅读 35–43 · Чтение','text','Вставь пропущенное слово: '+x[2].replace(answer,'＿＿＿'),answer,'Полное предложение: '+x[2]+' · '+(x[5]||'')+' · '+x[3]+' · Правило: '+x[1],{hint:'Перевод: '+x[3]});
 }
 for(let i=0;i<5;i++){
  const x=w(i+20);
  add('a-'+(i+44),'书写 44–48 · Письмо','text','Напиши китайскими иероглифами: '+x[2],x[0],x[0]+' · '+x[1]+' · '+x[2],{hint:'Пиньинь: '+x[1]});
 }
 for(let i=0;i<2;i++){
  const x=g(i+2),tokens=splitSentence(x[2],words);
  add('a-'+(i+49),'书写 49–50 · Письмо','order','Собери авторское предложение: '+x[3],tokens.join(''),x[2]+' · '+(x[5]||'')+' · '+x[3]+' · '+x[1],{tokens});
 }
 return items;
}
function mount(host,n,data,speak){
 const items=build(data),key='hsk4-authored-workbook-v2-'+n;
 let responses={},pos=0;
 try{responses=JSON.parse(localStorage.getItem(key)||'{}')}catch(_){}
 const save=()=>{try{localStorage.setItem(key,JSON.stringify(responses))}catch(e){note.textContent='Не получилось сохранить ответы на этом устройстве.'}};
 const shell=$('section','hsk-wb');host.append(shell);
 const heading=$('h3','','📒 Рабочая тетрадь · Урок '+n);
 const note=$('p','hsk-wb-note','50 авторских тренировочных заданий по структуре HSK 4A Workbook: 22 аудирования, 21 чтение, 7 письма. Это не оригинальные вопросы и не официальные ключи. Озвучка синтезированная.');
 const status=$('p','hsk-wb-status');status.setAttribute('role','status');
 const bar=$('div','hsk-wb-bar'),fill=$('div','hsk-wb-fill');bar.append(fill);
 const sections=$('div','hsk-wb-sections'),nav=$('div','hsk-wb-nav'),question=$('div','hsk-wb-question');
 const controls=$('div','hsk-wb-controls');
 const previous=$('button','','← Предыдущее'),next=$('button','','Следующее →'),reset=$('button','','Пройти заново ↻');
 for(const b of [previous,next,reset])b.type='button';
 controls.append(previous,next,reset);shell.append(heading,note,status,bar,sections,nav,question,controls);
 const correctAt=i=>{const task=items[i],r=responses[task.id];if(!r?.checked)return false;const value=task.kind==='order'?String(r.value||'').split('|').filter(Boolean).map(k=>task.tokens[Number(k)]).join(''):r.value;return normalize(value)===normalize(task.answer)};
 const progress=()=>{const done=items.filter(x=>responses[x.id]?.checked).length,correct=items.filter((x,i)=>correctAt(i)).length;status.textContent='Правильно: '+correct+' из '+items.length+' · Выполнено: '+done+' из '+items.length;fill.style.width=(100*done/items.length)+'%'};
 const button=(text,fn,cls)=>{const b=$('button',cls||'',text);b.type='button';b.onclick=fn;return b};
 function render(){
  const task=items[pos],stored=responses[task.id]||{value:'',checked:false};question.replaceChildren();sections.replaceChildren();nav.replaceChildren();
  const titles=[...new Set(items.map(x=>x.section))];
  for(const title of titles){const index=items.findIndex(x=>x.section===title);sections.append(button(title,()=>{pos=index;render()},task.section===title?'active':''))}
  const begin=items.findIndex(x=>x.section===task.section),end=items.findLastIndex(x=>x.section===task.section);
  for(let i=begin;i<=end;i++){nav.append(button(String(i-begin+1),()=>{pos=i;render()},(pos===i?'active ':'')+(responses[items[i].id]?.checked?(correctAt(i)?'correct':'wrong'):'')))}
  question.append($('p','hsk-wb-number','Задание '+(pos+1)+' из '+items.length+' · '+task.section));
  question.append($('h4','hsk-wb-prompt',task.prompt));
  if(task.hint)question.append($('p','hsk-wb-hint',task.hint));
  if(task.audio)question.append(button('🔊 Прослушать',()=>speak(task.audio),'hsk-wb-audio'));
  let current=stored.value||'';const area=$('div','hsk-wb-answer'),feedback=$('div','hsk-wb-feedback');feedback.setAttribute('role','status');
  const ensureDraft=()=>{responses[task.id]={value:current,checked:false};save();progress();feedback.replaceChildren()};
  let tiles=null;
  if(task.kind==='text'){
   const input=$('input');input.type='text';input.autocomplete='off';input.value=current;input.placeholder='Введи китайские иероглифы';input.setAttribute('aria-label','Ответ на задание '+(pos+1));
   input.oninput=()=>{current=input.value;ensureDraft()};input.onkeydown=e=>{if(e.key==='Enter')check()};area.append(input);
  }else if(task.kind==='choice'){
   tiles=$('div','hsk-wb-options');
   for(const opt of task.options){const b=button(opt,()=>{current=opt;ensureDraft();render()},current===opt?'selected':'');tiles.append(b)}area.append(tiles);
  }else{
   const chosen=task.tokens.map((t,i)=>({t,i})).filter(x=>(stored.value||'').split('|').includes(String(x.i))).map(x=>x.i);
   // Preserve click sequence rather than source order.
   let indices=(stored.value||'').split('|').filter(x=>x!=='').map(Number).filter(i=>i>=0&&i<task.tokens.length);
   current=indices.join('|');
   const assembled=$('div','hsk-wb-assembled');const pool=$('div','hsk-wb-tokens');
   const paint=()=>{assembled.replaceChildren();pool.replaceChildren();indices.forEach(i=>assembled.append(button(task.tokens[i],()=>{indices=indices.filter(x=>x!==i);current=indices.join('|');ensureDraft();paint()})));
     shuffle(task.tokens.map((_,i)=>i),pos+17).forEach(i=>{if(!indices.includes(i))pool.append(button(task.tokens[i],()=>{indices.push(i);current=indices.join('|');ensureDraft();paint()}))})};
   paint();area.append(assembled,pool,button('Сбросить ↻',()=>{indices=[];current='';ensureDraft();paint()}));
  }
  question.append(area);
  function answer(){return task.kind==='order'?current.split('|').filter(x=>x!=='').map(i=>task.tokens[Number(i)]).join(''):current}
  function check(){const value=current,good=normalize(answer())===normalize(task.answer);
   responses[task.id]={value,checked:true};save();showFeedback(good);progress();renderNavStates();}
  function renderNavStates(){[...nav.children].forEach((b,j)=>{const idx=begin+j;b.className=(pos===idx?'active ':'')+(responses[items[idx].id]?.checked?(correctAt(idx)?'correct':'wrong'):'')})}
  function showFeedback(good){feedback.replaceChildren();feedback.className='hsk-wb-feedback '+(good?'good':'bad');
   feedback.append($('strong','',good?'✓ Правильно!':'✕ Неправильно.'));
   feedback.append($('p','','Правильный ответ: '+(task.kind==='order'?task.tokens.join(''):task.answer)));
   feedback.append($('p','',task.explanation));}
  question.append(button('Проверить',check,'hsk-wb-check'));
  question.append(button('Показать правильный ответ',()=>showFeedback(false),'hsk-wb-reveal'));
  question.append(feedback);
  if(stored.checked)showFeedback(correctAt(pos));
  previous.disabled=pos===0;next.disabled=pos===items.length-1;
  progress();
 }
 previous.onclick=()=>{if(pos>0){pos--;render()}};
 next.onclick=()=>{if(pos<items.length-1){pos++;render()}};
 reset.onclick=()=>{if(window.confirm('Начать урок заново? Сохранённые ответы этого урока будут удалены.')){responses={};save();pos=0;render()}};
 render();
 return {count:items.length,sections:[...new Set(items.map(x=>x.section))]};
}
window.HSKWorkbook={mount,build};
})();