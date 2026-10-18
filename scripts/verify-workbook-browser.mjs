import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';

const server=spawn('python3',['-m','http.server','8123','--bind','127.0.0.1'],{stdio:'ignore'});
const sleep=t=>new Promise(resolve=>setTimeout(resolve,t));
const browser=await chromium.launch({headless:true});
let tested=0;
try {
 await sleep(1200);
 for(let lesson=2;lesson<=10;lesson++){
  const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/cdn.jsdelivr.net/**',route=>route.abort());
  await page.goto('http://127.0.0.1:8123/',{waitUntil:'domcontentloaded'});
  await page.locator('#mainLessonStudio').waitFor({state:'attached',timeout:20000});
  await page.evaluate(n=>document.dispatchEvent(new CustomEvent('hsk-main-lesson',{detail:n})),lesson);
  await page.locator('#mainLessonStudio [data-ml="workbook"]').click();
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
