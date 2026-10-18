/* Companion to a privately held HSK Standard Course 4A workbook.
   The user loads their own original PDF; no copyrighted exercise scans are published. */
(() => {
'use strict';
const el=(tag,text,cls)=>{const o=document.createElement(tag);if(text!==undefined)o.textContent=text;if(cls)o.className=cls;return o};
const btn=(label,fn,cls)=>{const b=el('button',label,cls);b.type='button';b.onclick=fn;return b};
const pageStart=n=>8+10*(n-1);
// Ten pages per lesson in the supplied HSK 4A Workbook PDF.
const pageFor=(lesson,task)=>pageStart(lesson)+(task<=5?0:task<=12?1:task<=22?2:task<=26?3:task<=30?4:task<=34?5:task<=38?6:task<=43?7:task<=48?8:9);
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
 const banner=el('div',undefined,'hsk-original-banner');banner.append(el('strong','🧠 HSK 4 · Тренировка'),el('span','🌸 Урок '+lesson));shell.append(banner);
 shell.append(el('p','📖 Выполняй задания по оригинальным страницам прямо на карточке, выбирай ответы и сразу проверяй. Файл остаётся только на твоём устройстве.','hsk-original-lead'));
 const upload=el('div',undefined,'hsk-original-upload');
 upload.append(el('strong','Твоя рабочая тетрадь (PDF, хранится только на устройстве)'));
 const input=el('input');input.type='file';input.accept='application/pdf,.pdf';input.setAttribute('aria-label','Загрузить свою рабочую тетрадь HSK 4A');upload.append(input);
 const pdfStatus=el('p','Выбери свой PDF, чтобы видеть оригинальные задания здесь.');
 const pager=el('div',undefined,'hsk-wb-controls');const frame=el('iframe');frame.title='Оригинальные страницы твоей рабочей тетради';frame.className='hsk-original-frame';
 let fileUrl=null,page=pageStart(lesson);
 const pageLabel=el('span','Страница PDF: '+page);
 const showPage=()=>{page=Math.max(1,Math.min(112,page));pageLabel.textContent='Страница PDF: '+page;pgInput.value=String(page);if(fileUrl)frame.src=fileUrl+'#page='+page+'&zoom=page-width'};
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
 // Local audio from the learner's own licensed workbook package (three listening parts).
 const audioSection=el('details');audioSection.open=false;
 audioSection.append(el('summary','🎧 Оригинальное аудирование · части 1–3'));
 audioSection.append(el('p','Выбери три файла аудио этого урока по порядку. Файлы хранятся локально в браузере, без публикации или отправки на сервер.','hsk-wb-hint'));
 const audioInput=el('input');audioInput.type='file';audioInput.accept='audio/*,.mp3,.m4a,.wav,.ogg';audioInput.multiple=true;audioInput.setAttribute('aria-label','Загрузить три аудиозаписи текущего урока');
 const audioStatus=el('p','Аудиофайлы ещё не выбраны.','hsk-wb-hint');
 const player=el('audio');player.controls=true;player.preload='none';player.style.width='100%';
 const recordings=[null,null,null];const audioUrls=[null,null,null];
 const audioPart=n=>n<=5?0:n<=12?1:2;
 function updateAudio(n){
  if(n>22){player.hidden=true;return}
  player.hidden=false;const part=audioPart(n);const file=recordings[part];
  if(file){if(!audioUrls[part])audioUrls[part]=URL.createObjectURL(file);if(player.src!==audioUrls[part]){player.pause();player.src=audioUrls[part]}}
  else{player.pause();player.removeAttribute('src');player.load()}
  audioStatus.textContent=file?'Запись '+(part+1)+' · '+file.name:'Для заданий '+(part===0?'1–5':part===1?'6–12':'13–22')+' загрузи запись '+(part+1)+' своего урока.';
 }
 audioInput.onchange=async()=>{
  const files=[...(audioInput.files||[])].slice(0,3);
  for(let i=0;i<files.length;i++){recordings[i]=files[i];if(audioUrls[i])URL.revokeObjectURL(audioUrls[i]);audioUrls[i]=null;try{await saveFile(files[i],'audio-'+lesson+'-'+i)}catch(e){}}
  updateAudio(current);
 };
 for(let i=0;i<3;i++)getFile('audio-'+lesson+'-'+i).then(f=>{if(f){recordings[i]=f;updateAudio(current)}}).catch(()=>{});
 audioSection.append(audioInput,audioStatus,player);shell.append(audioSection);

 const status=el('p',undefined,'hsk-wb-status');status.setAttribute('role','status');
 const nav=el('div',undefined,'hsk-wb-sections'),jump=el('div',undefined,'hsk-wb-nav'),task=el('div',undefined,'hsk-wb-question'),actions=el('div',undefined,'hsk-wb-controls');
 const stepHeader=el('div',undefined,'hsk-original-step-header');
 const progressTrack=el('div',undefined,'hsk-original-progress');const progressFill=el('div',undefined,'hsk-original-progress-fill');progressTrack.append(progressFill);
 const originalBox=el('div',undefined,'hsk-original-embedded');const originalTitle=el('h3','📖 Оригинальное задание · Урок '+lesson);
 const originalBody=el('div',undefined,'hsk-original-embedded-body');const originalCopy=el('p',undefined,'hsk-original-instruction');
 const sourceText=el('div',undefined,'hsk-source-text');sourceText.setAttribute('lang','zh-Hans');originalBody.append(sourceText);
 originalBox.append(originalTitle,originalCopy,originalBody);
 const sections=[['听力 1–5',1,5],['听力 6–12',6,12],['听力 13–22',13,22],['阅读 23–30',23,30],['阅读 31–34',31,34],['阅读 35–43',35,43],['书写 44–50',44,50]];
 let current=1;
 function correct(i){const r=state[i];return i<=43&&r?.checked&&norm(r.value)===norm(answers[i])}
 function progress(){const done=Object.keys(state).filter(k=>state[k]?.checked).length;const score=Array.from({length:43},(_,i)=>i+1).filter(correct).length;status.textContent='Проверено: '+done+' из 50 · Верно (№1–43): '+score+' из 43 · №44–50 — самостоятельная сверка с ключом.';
 const group=current>=23&&current<=34?[23,34]:current>=35&&current<=43?[35,43]:current>=44?[44,50]:current<=5?[1,5]:current<=12?[6,12]:[13,22];
 const answered=Array.from({length:group[1]-group[0]+1},(_,i)=>group[0]+i).filter(i=>state[i]?.checked).length;
 stepHeader.textContent='Задание '+current+' · '+(current-group[0]+1)+' из '+(group[1]-group[0]+1)+' · Отвечено: '+answered;
 progressFill.style.width=(100*answered/(group[1]-group[0]+1))+'%'}
 function display(){
  const n=current,old=state[n]||{value:'',checked:false};nav.replaceChildren();jump.replaceChildren();task.replaceChildren();
  const targetPage=pageFor(lesson,n);if(page!==targetPage){page=targetPage;showPage()}updateAudio(n)
  sections.forEach(([label,a,b])=>nav.append(btn(label,()=>{current=a;display()},n>=a&&n<=b?'active':'')));
  const group=sections.find(([,a,b])=>n>=a&&n<=b);
  const navigationRange=n>=23&&n<=34?[23,34]:[group[1],group[2]];
  for(let i=navigationRange[0];i<=navigationRange[1];i++){const c=btn(String(i),()=>{current=i;display()},(i===n?'active ':'')+(state[i]?.checked?(i<=43?(correct(i)?'correct':'wrong'):'correct'):''));jump.append(c)}
  task.append(el('h3','Задание '+n,'hsk-original-task-title'));
  task.append(el('p',group[0]+' · Страница '+targetPage+' твоей рабочей тетради','hsk-wb-number'));
  const sourceItem=window.HSKWorkbookSourceItems?.[lesson]?.[n];
  sourceText.replaceChildren();
  if(sourceItem){
   const question=el('p',sourceItem.text,'hsk-source-question');sourceText.append(question);
   if(sourceItem.choices){const choicesList=el('p',sourceItem.choices.map((v,i)=>'ABCDE'[i]+' '+v).join(' · '),'hsk-source-bank');sourceText.append(choicesList)}
   if(sourceItem.type==='order')sourceText.append(el('p','Нажми на A, B, C в правильном порядке.','hsk-source-task-note'));
   originalCopy.textContent='Урок '+lesson+' · задание №'+n+' · сверено с твоим PDF (страница '+targetPage+').';
  }else originalCopy.textContent='Задание №'+n+' · оригинальная страница '+targetPage+'. Открой PDF, чтобы увидеть условие целиком.';
  upload.hidden=!!sourceItem;
  task.append(el('p','Выбери ответ на задание №'+n+' со страницы выше.','hsk-wb-hint'));
  task.append(btn('📖 Открыть исходную страницу',()=>{page=targetPage;showPage();upload.hidden=false;reference.open=true;originalBox.scrollIntoView({behavior:'smooth',block:'start'})},'hsk-wb-audio'));
  if(n>=23&&n<=26)task.append(el('p','阅读 第一部分 · подбери подходящее слово A–E к пропуску.','hsk-wb-hint'));
  if(n>=27&&n<=30)task.append(el('p','阅读 第二部分 · подбери соответствующий вариант A–E.','hsk-wb-hint'));
  if(n>=31&&n<=34)task.append(el('p','阅读 第三部分 · поставь части A, B, C в правильном порядке.','hsk-wb-hint'));
  if(n>=35&&n<=43)task.append(el('p','阅读 第四部分 · прочитай текст и выбери верный вариант.','hsk-wb-hint'));
  if(n>=44&&n<=50)task.append(el('p','书写 · напиши своё предложение, затем сравни с образцом в ключах.','hsk-wb-hint'));
  if(n>=1&&n<=5)task.append(el('p','听力 第一部分 · прослушай высказывание и определи, верно оно или нет.','hsk-wb-hint'));

  if(n<=22)task.append(el('p','Для оригинального аудирования нужен аудиофайл издательства; синтезированные случайные слова не заменяют диалоги из тетради.','hsk-wb-hint'));
  const choices=el('div',undefined,'hsk-wb-options');
  let value=old.value||'';
  const picks=n<=5?['Верно','Неверно']:n>=31&&n<=34?null:n<=22?['A','B','C','D']:n<=30?['A','B','C','D','E']:n<=43?['A','B','C','D']:null;
  if(n>=31&&n<=34){
   const arranged=el('div',undefined,'hsk-wb-assembled');arranged.setAttribute('role','status');
   const controls=el('div',undefined,'hsk-wb-tokens');
   const redraw=()=>{arranged.textContent=value||'Нажимай на A, B, C в нужном порядке.';controls.replaceChildren();
    for(const part of ['A','B','C']){const b=btn(part,()=>{if(value.includes(part))return;value+=part;state[n]={value,checked:false};persist();redraw();progress()});b.disabled=value.includes(part);controls.append(b)}
   };
   redraw();choices.append(arranged,controls,btn('Сбросить порядок ↻',()=>{value='';state[n]={value,checked:false};persist();redraw();progress()}));
  }else if(picks)for(const option of picks)choices.append(btn(option,()=>{value=option;state[n]={value,checked:false};persist();display()},option===value?'selected':''));
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
 const layout=el('div',undefined,'hsk-original-layout');
 const sourceCol=el('div',undefined,'hsk-original-source');const exerciseCol=el('div',undefined,'hsk-original-exercise');
 const materials=el('details',undefined,'hsk-original-materials');const materialHeading=el('summary','🎧 Дополнительно: аудио и официальные ключи');
 materials.append(materialHeading,sourceCol);sourceCol.append(audioSection,keySection);
 // The actual workbook page must be visible inside the question card, never hidden in a separate sidebar or drawer.
 // When the original prompt is available as text, keep its PDF available only as an optional reference.
 const reference=el('details',undefined,'hsk-source-reference');reference.append(el('summary','📄 Оригинальная страница PDF'));reference.append(upload);
 originalBody.append(reference,materials);
 const showRef=()=>{if(upload.hidden){upload.hidden=false;reference.open=true}else reference.open=true};
 originalBox.addEventListener('click',e=>{if(e.target.closest('.hsk-show-original'))showRef()});
 exerciseCol.append(status,nav,stepHeader,progressTrack,jump,originalBox,task,actions);
 layout.append(exerciseCol);shell.append(layout);display();
}
window.HSKOriginalWorkbook={mount};
})();