/* Companion to a privately held HSK Standard Course 4A workbook.
   The user loads their own original PDF; no copyrighted exercise scans are published. */
(() => {
'use strict';
const el=(tag,text,cls)=>{const o=document.createElement(tag);if(text!==undefined)o.textContent=text;if(cls)o.className=cls;return o};
const btn=(label,fn,cls)=>{const b=el('button',label,cls);b.type='button';b.onclick=fn;return b};
const pageStart=n=>8+10*(n-1);
const norm=s=>String(s||'').trim().replace(/\s/g,'').toUpperCase();
function dbOpen(){
 return new Promise((resolve,reject)=>{const q=indexedDB.open('hsk4-private-source-v1',1);q.onupgradeneeded=()=>q.result.createObjectStore('pdf');q.onsuccess=()=>resolve(q.result);q.onerror=()=>reject(q.error)});
}
async function saveFile(file,id='4A'){const db=await dbOpen();return new Promise((res,rej)=>{const t=db.transaction('pdf','readwrite');t.objectStore('pdf').put(file,id);t.oncomplete=()=>{db.close();res()};t.onerror=()=>rej(t.error)})}
async function getFile(id='4A'){const db=await dbOpen();return new Promise((res,rej)=>{const t=db.transaction('pdf','readonly');const r=t.objectStore('pdf').get(id);r.onsuccess=()=>{db.close();res(r.result)};r.onerror=()=>rej(r.error)})}
function mount(host,lesson){
 const answers=window.HSK4OfficialAnswerCodes?.[lesson];
 if(!answers){host.append(el('p','Официальные ответы для этого урока ещё не проверены.'));return}
 const key='hsk4-original-companion-progress-'+lesson;
 let state={};try{state=JSON.parse(localStorage.getItem(key)||'{}')}catch(e){}
 const persist=()=>{try{localStorage.setItem(key,JSON.stringify(state))}catch(e){status.textContent='Не удалось сохранить прогресс.'}};
 const shell=el('section',undefined,'hsk-original');host.append(shell);
 shell.append(el('h3','📒 Оригинальная рабочая тетрадь · Урок '+lesson));
 shell.append(el('p','Здесь проверяются ответы на настоящие задания №1–50 из твоей HSK Standard Course 4A Workbook. Сначала открой свой PDF. Сайт не публикует страницы книги и не подменяет её текст авторскими вопросами.','hsk-wb-note'));
 const upload=el('div',undefined,'hsk-original-upload');
 upload.append(el('strong','Твоя рабочая тетрадь (PDF, хранится только на устройстве)'));
 const input=el('input');input.type='file';input.accept='application/pdf,.pdf';input.setAttribute('aria-label','Загрузить свою рабочую тетрадь HSK 4A');upload.append(input);
 const pdfStatus=el('p','Выбери свой PDF, чтобы видеть оригинальные задания здесь.');
 const pager=el('div',undefined,'hsk-wb-controls');const frame=el('iframe');frame.title='Оригинальные страницы твоей рабочей тетради';frame.className='hsk-original-frame';
 let fileUrl=null,page=pageStart(lesson);
 const pageLabel=el('span','Страница PDF: '+page);
 const showPage=()=>{page=Math.max(1,Math.min(112,page));pageLabel.textContent='Страница PDF: '+page;if(fileUrl)frame.src=fileUrl+'#page='+page+'&zoom=page-width'};
 const prevPage=btn('← Страница',()=>{page--;showPage()}),nextPage=btn('Страница →',()=>{page++;showPage()});
 const pgInput=el('input');pgInput.type='number';pgInput.min='1';pgInput.max='112';pgInput.value=String(page);pgInput.setAttribute('aria-label','Номер страницы PDF');pgInput.onchange=()=>{page=Number(pgInput.value)||page;showPage()};
 pager.append(prevPage,pageLabel,nextPage,pgInput);
 const openFile=blob=>{if(fileUrl)URL.revokeObjectURL(fileUrl);fileUrl=URL.createObjectURL(blob);showPage();pdfStatus.textContent='✓ Оригинальный PDF открыт. Он не загружается на GitHub.'};
 input.onchange=async()=>{const f=input.files?.[0];if(!f)return;openFile(f);try{await saveFile(f);pdfStatus.textContent+=' Сохранён в браузере.'}catch(e){pdfStatus.textContent+=' Сохранение PDF недоступно: выбери файл после перезагрузки.'}};
 getFile().then(f=>{if(f&&!fileUrl)openFile(f)}).catch(()=>{});
 upload.append(pdfStatus,pager,frame);shell.append(upload);
 // Private answer-key PDF is never published; page 4/8/... contains answer list.
 const keySection=el('details');const keySummary=el('summary','📑 Мои официальные ключи — сравнить письменные №44–50');keySection.append(keySummary);
 const keyInfo=el('p','Выбери HSK 4A (上) workbook keys. Ключи остаются на устройстве, а не в GitHub.');
 const keyInput=el('input');keyInput.type='file';keyInput.accept='.pdf,application/pdf';keyInput.setAttribute('aria-label','Загрузить официальный файл ключей HSK 4A');
 const keyFrame=el('iframe');keyFrame.title='Твои официальные ключи HSK 4A';keyFrame.className='hsk-original-frame';
 let keyUrl=null;const openKey=blob=>{if(keyUrl)URL.revokeObjectURL(keyUrl);keyUrl=URL.createObjectURL(blob);keyFrame.src=keyUrl+'#page='+(lesson*4)+'&zoom=page-width';keyInfo.textContent='✓ Официальные ключи открыты. Листай файл для сверки задания №44–50.'};
 keyInput.onchange=async()=>{const file=keyInput.files?.[0];if(!file)return;openKey(file);try{await saveFile(file,'keys-4A')}catch(e){keyInfo.textContent+=' (Повторно выбери файл после обновления.)'}};
 getFile('keys-4A').then(file=>{if(file&&!keyUrl)openKey(file)}).catch(()=>{});
 keySection.append(keyInfo,keyInput,keyFrame);shell.append(keySection);
 const status=el('p',undefined,'hsk-wb-status');status.setAttribute('role','status');
 const nav=el('div',undefined,'hsk-wb-sections'),jump=el('div',undefined,'hsk-wb-nav'),task=el('div',undefined,'hsk-wb-question'),actions=el('div',undefined,'hsk-wb-controls');
 const sections=[['听力 1–5',1,5],['听力 6–12',6,12],['听力 13–22',13,22],['阅读 23–30',23,30],['阅读 31–34',31,34],['阅读 35–43',35,43],['书写 44–50',44,50]];
 let current=1;
 function correct(i){const r=state[i];return i<=43&&r?.checked&&norm(r.value)===norm(answers[i])}
 function progress(){const done=Object.keys(state).filter(k=>state[k]?.checked).length;const score=Array.from({length:43},(_,i)=>i+1).filter(correct).length;status.textContent='Проверено: '+done+' из 50 · Верно (№1–43): '+score+' из 43 · №44–50 — самостоятельная сверка с ключом.'}
 function display(){
  const n=current,old=state[n]||{value:'',checked:false};nav.replaceChildren();jump.replaceChildren();task.replaceChildren();
  sections.forEach(([label,a,b])=>nav.append(btn(label,()=>{current=a;display()},n>=a&&n<=b?'active':'')));
  const group=sections.find(([,a,b])=>n>=a&&n<=b);
  for(let i=group[1];i<=group[2];i++){const c=btn(String(i),()=>{current=i;display()},(i===n?'active ':'')+(state[i]?.checked?(i<=43?(correct(i)?'correct':'wrong'):'correct'):''));jump.append(c)}
  task.append(el('p','Задание '+n+' / 50 · '+group[0]+' · Открой задание №'+n+' в PDF выше.','hsk-wb-number'));
  if(n<=22)task.append(el('p','Для оригинального аудирования нужен аудиофайл издательства; синтезированные случайные слова не заменяют диалоги из тетради.','hsk-wb-hint'));
  const choices=el('div',undefined,'hsk-wb-options');
  let value=old.value||'';
  const picks=n<=5?['Верно','Неверно']:n>=31&&n<=34?null:n<=30?Array.from({length:n>=23&&n<=30?5:4},(_,i)=>'ABCDE'[i]):n<=43?['A','B','C','D']:null;
  if(picks)for(const option of picks)choices.append(btn(option,()=>{value=option;state[n]={value,checked:false};persist();display()},option===value?'selected':''));
  else{const inp=el('input');inp.type='text';inp.value=value;inp.placeholder=n<=34?'Например: ACB':'Запиши своё предложение на китайском';inp.setAttribute('aria-label','Ответ на задание '+n);inp.oninput=()=>{value=inp.value;state[n]={value,checked:false};persist();progress()};choices.append(inp)}
  task.append(choices);
  const feedback=el('p',undefined,'hsk-wb-feedback');feedback.setAttribute('role','status');
  function show(){const r=state[n];feedback.replaceChildren();feedback.className='hsk-wb-feedback '+(n<=43?(correct(n)?'good':'bad'):'');
   if(n<=43){feedback.append(el('strong',correct(n)?'✓ Правильно':'✕ Ответ отличается от ключа'));feedback.append(el('p','Ответ по загруженному официальному ключу: '+answers[n]));}
   else feedback.textContent='Ответ сохранён. Письменное задание №'+n+' оцени самостоятельно по оригинальному PDF ключей; единственный буквальный вариант не всегда обязателен.';
  }
  if(old.checked)show();
  const check=btn('Проверить',()=>{state[n]={value,checked:true};persist();show();progress()},'hsk-wb-check');
  const reveal=btn('Показать ответ',()=>{feedback.className='hsk-wb-feedback';feedback.textContent=n<=43?'Ответ официального ключа: '+answers[n]:'Открой ключи HSK 4A, задание '+n+'; письменный ответ проверяется вручную.'});
  task.append(check,reveal,feedback);
  actions.replaceChildren();
  const back=btn('← Предыдущее',()=>{current--;display()}),next=btn('Следующее →',()=>{current++;display()}),reset=btn('Пройти заново ↻',()=>{if(confirm('Сбросить ответы этого урока?')){state={};persist();current=1;display()}});back.disabled=n===1;next.disabled=n===50;actions.append(back,next,reset);
  progress();
 }
 shell.append(status,nav,jump,task,actions);display();
}
window.HSKOriginalWorkbook={mount};
})();