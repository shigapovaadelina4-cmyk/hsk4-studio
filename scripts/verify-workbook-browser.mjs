import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';

const server=spawn('python3',['-m','http.server','8123','--bind','127.0.0.1'],{stdio:'ignore'});
const sleep=t=>new Promise(resolve=>setTimeout(resolve,t));
const browser=await chromium.launch({headless:true});
let tested=0;
try {
 await sleep(1200);
 const lessonOne=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 const l1errors=[];lessonOne.on('pageerror',e=>l1errors.push(e.message));
 await lessonOne.route('**/cdn.jsdelivr.net/**',route=>route.abort());
 await lessonOne.goto('http://127.0.0.1:8123/',{waitUntil:'domcontentloaded'});
 for(let i=0;i<37;i++){
  await lessonOne.locator('#flash').click();
  const example=await lessonOne.locator('#example').innerText();
  const word=await lessonOne.locator('#backWord').innerText();
  assert.ok(example.includes(word),'Missing lesson 1 contextual example for '+word);
  assert.ok((await lessonOne.locator('#exampleRu').innerText()).length>8);
  await lessonOne.locator('#cards [data-rate="yes"]').click();
 }
 assert.equal(await lessonOne.locator('#speakExample').count(),1);
 assert.deepEqual(l1errors,[],'Lesson 1 flashcard JavaScript errors');
 await lessonOne.close();
 console.log('Interactive mobile flashcard test passed: lesson 1, all 37 cards');
 for(let lesson=2;lesson<=10;lesson++){
  const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/cdn.jsdelivr.net/**',route=>route.abort());
  await page.goto('http://127.0.0.1:8123/',{waitUntil:'domcontentloaded'});
  await page.locator('#mainLessonStudio').waitFor({state:'attached',timeout:20000});
  await page.evaluate(n=>document.dispatchEvent(new CustomEvent('hsk-main-lesson',{detail:n})),lesson);
  await page.locator('#mainLessonStudio [data-ml="workbook"]').click();
  // Verify real workbook mode first: original PDF upload and 50 numbered answers.
  const original=page.locator('#mainLessonStudio .hsk-original');
  await original.waitFor({state:'visible'});
  assert.match(await original.locator('.hsk-original-banner').innerText(),/HSK 4 · Тренировка/);
  assert.match(await original.locator('.hsk-original-step-header').innerText(),/Задание 1 · 1 из 5 · Отвечено: 0/);
  assert.equal(await original.locator('.hsk-original-embedded').count(),1);
  assert.equal(await original.locator('.hsk-original-materials').getAttribute('open'),null);
  assert.equal(await original.locator('.hsk-original-exercise .hsk-wb-nav button').count(),5);
  assert.equal(await original.locator('.hsk-wb-sections button').count(),7);
  await original.locator('.hsk-wb-options button').first().click();
  await original.locator('.hsk-wb-check').click();
  assert.match(await original.locator('.hsk-wb-feedback').innerText(),/ключу/);
  assert.match(await original.locator('.hsk-wb-status').innerText(),/Проверено: 1 из 50/);
  
  await original.locator('.hsk-wb-sections button').filter({hasText:'阅读 23–30'}).click();
  assert.equal(await original.locator('.hsk-original-exercise .hsk-wb-nav button').count(),12);
  assert.match(await original.locator('.hsk-original-step-header').innerText(),/Задание 23 · 1 из 12/);
  if(lesson===2){
   assert.match(await original.locator('.hsk-source-question').innerText(),/如果有什么问题/);
   assert.match(await original.locator('.hsk-source-bank').innerText(),/C 及时/);
   await original.locator('.hsk-wb-options button').filter({hasText:'C'}).click();
   await original.locator('.hsk-wb-check').click();
   assert.match(await original.locator('.hsk-wb-feedback').innerText(),/正确|Правильно/);
  }
  assert.equal(await original.locator('.hsk-original-embedded .hsk-original-upload .hsk-original-frame').count(),1);
  assert.equal(await original.locator('.hsk-original-materials').getAttribute('open'),null);
  assert.match(await original.locator('.hsk-original-instruction').innerText(),/оригинальная страница/);
  await original.locator('.hsk-wb-sections button').filter({hasText:'阅读 31–34'}).click();
  if(lesson===2)assert.match(await original.locator('.hsk-source-question').innerText(),/来北京半年多了/);
  const exact=await page.evaluate(n=>window.HSK4OfficialAnswerCodes[n][31],lesson);
  for(const character of exact)await original.locator('.hsk-wb-tokens button').filter({hasText:character}).click();
  assert.equal(await original.locator('.hsk-wb-assembled').innerText(),exact);
  await original.locator('.hsk-wb-check').click();
  assert.match(await original.locator('.hsk-wb-feedback').innerText(),/Правильно/);
  await original.locator('.hsk-wb-sections button').filter({hasText:'书写 44–50'}).click();
  await original.locator('.hsk-wb-options input').fill('我练习写汉字。');
  await original.locator('.hsk-wb-check').click();
  assert.match(await original.locator('.hsk-wb-feedback').innerText(),/手|Письменное|письменное/);
  assert.match(await original.locator('.hsk-wb-status').innerText(),/Проверено: 3 из 50/);
  // Match source pages: question 44 uses page start + 8.
  const sourcePage=await original.locator('.hsk-original-source input[type=number]').inputValue();
  assert.equal(Number(sourcePage),8+(lesson-1)*10+8,'Wrong original PDF page for lesson '+lesson);
  const audioPicker=original.locator('input[aria-label="Загрузить три аудиозаписи текущего урока"]');
  assert.equal(await audioPicker.count(),1,'Original audio upload missing');
  await audioPicker.setInputFiles([0,1,2].map(i=>({name:'part'+(i+1)+'.mp3',mimeType:'audio/mpeg',buffer:Buffer.from([73,68,51,3,0,0,0,0,0,0])})));
  await original.locator('.hsk-wb-sections button').filter({hasText:'听力 13–22'}).click();
  assert.match(await original.locator('.hsk-original-source audio').getAttribute('src')||'',/^blob:/);
  const pdfInput=original.locator('.hsk-original-upload input[type=file]');
  await pdfInput.setInputFiles({name:'practice.pdf',mimeType:'application/pdf',buffer:Buffer.from('%PDF-1.4\\n1 0 obj <</Type /Catalog>> endobj\\n%%EOF')});
  await page.locator('#mainLessonStudio .hsk-wb-sections button').filter({hasText:'Дополнительная авторская практика'}).click();
  const wb=page.locator('#mainLessonStudio .hsk-wb');
  await wb.waitFor({state:'visible'});
  assert.match(await wb.locator('.hsk-wb-status').innerText(),/из 50/);
  assert.equal(await wb.locator('.hsk-wb-sections button').count(),8);
  // Wrong answer, check feedback and stored progress.
  const choice=wb.locator('.hsk-wb-options button').first();
  await choice.click();await wb.locator('.hsk-wb-check').click();
  assert.match(await wb.locator('.hsk-wb-feedback').innerText(),/Правильный ответ/);
  // Reading: real contextual Chinese prose rather than a single isolated vocabulary item.
  await wb.locator('.hsk-wb-sections button').filter({hasText:'阅读 23–30'}).click();
  assert.ok((await wb.locator('.hsk-wb-passage').innerText()).length>=12);
  // Fill-in answer and verify navigation.
  await wb.locator('.hsk-wb-sections button').filter({hasText:'阅读 35–43'}).click();
  await wb.locator('.hsk-wb-answer input').fill('测试');
  await wb.locator('.hsk-wb-check').click();
  assert.match(await wb.locator('.hsk-wb-feedback').innerText(),/Правильный ответ/);
  await wb.locator('.hsk-wb-controls button').filter({hasText:'Следующее'}).click();
  await wb.locator('.hsk-wb-controls button').filter({hasText:'Предыдущее'}).click();
  // Builder: clickable tokens, verify, then reset selection.
  await wb.locator('.hsk-wb-sections button').filter({hasText:'书写 49–50'}).click();
  await wb.locator('.hsk-wb-tokens button').first().click();
  await wb.locator('.hsk-wb-check').click();
  assert.match(await wb.locator('.hsk-wb-feedback').innerText(),/Правильный ответ/);
  await wb.locator('.hsk-wb-answer button').filter({hasText:'Сбросить'}).click();
  // Browser persistence: re-enter workbook after page refresh.
  await page.reload({waitUntil:'domcontentloaded'});
  await page.locator('#mainLessonStudio').waitFor({state:'attached'});
  await page.evaluate(n=>document.dispatchEvent(new CustomEvent('hsk-main-lesson',{detail:n})),lesson);
  await page.locator('#mainLessonStudio [data-ml="workbook"]').click();
  assert.match(await page.locator('#mainLessonStudio .hsk-original .hsk-wb-status').innerText(),/Проверено: 3 из 50/);
  await page.locator('#mainLessonStudio .hsk-wb-sections button').filter({hasText:'Дополнительная авторская практика'}).click();
  const progress=await wb.locator('.hsk-wb-status').innerText();
  assert.match(progress,/Выполнено: [1-9]/,'Progress must survive reload');
  const overflow=await wb.evaluate(el=>el.scrollWidth>window.innerWidth+2);
  assert.equal(overflow,false,'Workbook overflows iPhone width');
  page.once('dialog',d=>d.accept());
  await wb.locator('.hsk-wb-controls button').filter({hasText:'Пройти заново'}).click();
  assert.match(await wb.locator('.hsk-wb-status').innerText(),/Выполнено: 0 из 50/);
  assert.deepEqual(errors,[],'Unexpected JavaScript errors in lesson '+lesson);
  await page.close();tested++;
  console.log('Interactive mobile browser test passed: lesson '+lesson);
 }
} finally {
 await browser.close();server.kill();
}
console.log('Tested '+tested+' lessons on 390px mobile viewport.');
