import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';
const server=spawn('python3',['-m','http.server','8127','--bind','127.0.0.1'],{stdio:'ignore'});
const browser=await chromium.launch({headless:true});
const delay=t=>new Promise(resolve=>setTimeout(resolve,t));
let tested=0;
try{
 await delay(1300);
 for(let n=11;n<=20;n++){
  const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  // Test the fallback when third-party pinyin is unavailable: the card must remain usable.
  await page.route('**/cdn.jsdelivr.net/**',route=>route.abort());
  await page.goto('http://127.0.0.1:8127/',{waitUntil:'domcontentloaded'});
  const lessonBtn=page.locator('#partB button.lesson').filter({hasText:'Урок '+n});
  if(!(await lessonBtn.isVisible())){
    console.log('LESSON BUTTON DIAGNOSTIC '+n,JSON.stringify(await page.evaluate(()=>{
      const b=[...document.querySelectorAll('#partB button.lesson')].find(e=>e.textContent.trim()==='Урок 11');
      const chain=[];for(let x=b;x&&chain.length<8;x=x.parentElement){const st=getComputedStyle(x);chain.push({tag:x.tagName,id:x.id,cls:x.className,display:st.display,visibility:st.visibility,opacity:st.opacity,rect:x.getBoundingClientRect().toJSON()})}return chain
    })));
  }
  const partDetails=page.locator('details.lesson-group').filter({has:page.locator('#partB')});
  if(await partDetails.count()) await partDetails.locator('summary').click();
  await lessonBtn.click();
  const studio=page.locator('#hsk4bStudio');await studio.waitFor({state:'visible',timeout:20000});
  const card=studio.locator('#hsk4bCard');
  await page.waitForFunction(()=>document.querySelector('#hsk4bCounter')?.textContent?.startsWith('Слово 1 из'),null,{timeout:15000});
  assert.match(await studio.locator('#hsk4bCounter').innerText(),/Слово 1 из/);
  const first=await studio.locator('.hsk4b-hanzi').innerText();
  assert(first.length>0);
  assert.equal(await studio.locator('.hsk4b-example-zh').count(),0,'Front must not show the example');
  await card.click();
  const example=await studio.locator('.hsk4b-example-zh').innerText();
  assert(example.includes(first),'Wrong word in example for '+first);
  assert((await studio.locator('.hsk4b-example-pinyin').innerText()).length>3);
  assert((await studio.locator('.hsk4b-example-ru').innerText()).length>10);
  await studio.locator('[data-action="no"]').click();
  const second=await studio.locator('.hsk4b-hanzi').innerText();
  assert.notEqual(second,first);
  await studio.locator('[data-action="no"]').click();
  await studio.locator('[data-action="review"]').click();
  assert.match(await studio.locator('#hsk4bCounter').innerText(),/Повторение: 1 из 2/);
  assert.equal(await studio.locator('.hsk4b-hanzi').innerText(),first);
  await studio.locator('[data-action="next"]').click();
  assert.equal(await studio.locator('.hsk4b-hanzi').innerText(),second);
  await studio.locator('[data-action="yes"]').click();
  assert.match(await studio.locator('#hsk4bCounter').innerText(),/Повторение: 1 из 1/);
  await studio.locator('[data-action="yes"]').click();
  assert.match(await studio.locator('.hsk4b-complete').innerText(),/Все трудные слова выучены/);
  await studio.locator('[data-action="all"]').click();
  assert.match(await studio.locator('#hsk4bUnknown').innerText(),/^0$/);
  // Force one missed word then reload to verify per-lesson local persistence.
  await studio.locator('[data-action="no"]').click();
  await page.reload({waitUntil:'domcontentloaded'});
  const reloadDetails=page.locator('details.lesson-group').filter({has:page.locator('#partB')});
  if(await reloadDetails.count()) await reloadDetails.locator('summary').click();
  await page.locator('#partB button.lesson').filter({hasText:'Урок '+n}).click();
  await studio.waitFor({state:'visible'});
  await page.waitForFunction(()=>document.querySelector('#hsk4bUnknown')?.textContent==='1',{timeout:10000});
  assert.equal(await studio.locator('#hsk4bUnknown').innerText(),'1','Review count not persisted');
  await studio.locator('[data-action="review"]').click();
  assert.match(await studio.locator('#hsk4bCounter').innerText(),/Повторение: 1 из 1/);
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth+2);
  assert.equal(overflow,false,'Horizontal overflow on mobile lesson '+n);
  assert.deepEqual(errors,[],'JavaScript exceptions on lesson '+n);
  await page.close();tested++;
  console.log('HSK 4B lesson '+n+' mobile flashcards passed');
 }
}finally{await browser.close();server.kill()}
console.log('Passed interactive tests for '+tested+' HSK 4B lessons.');
