import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const root=new URL('../',import.meta.url);
const html=fs.readFileSync(new URL('index.html',root),'utf8');
const source=fs.readFileSync(new URL('workbook-studio.js',root),'utf8');
new vm.Script(source,{filename:'workbook-studio.js'});
assert(html.includes('workbook-studio.js'),'Workbook engine must be linked');
assert(html.includes('workbook-studio.css'),'Mobile stylesheet must be linked');
const dataStart=html.indexOf('const data={');
const dataEnd=html.indexOf('function init(){',dataStart);
assert(dataStart>=0&&dataEnd>dataStart);
const context={console,window:{}};
vm.runInNewContext(html.slice(dataStart,dataEnd)+'\n;globalThis.checkedData=data;',context);
vm.runInNewContext(source,context);
for(let n=2;n<=10;n++){
 const dataset=context.checkedData[n];
 assert(dataset?.words?.length>=29,'Missing lesson vocabulary '+n);
 assert(dataset?.grammar?.length>=4,'Missing lesson grammar '+n);
 const tasks=context.window.HSKWorkbook.build(dataset);
 assert.equal(tasks.length,50,'Expected fifty authored workbook tasks in lesson '+n);
 assert.equal(new Set(tasks.map(q=>q.id)).size,50,'Duplicate IDs '+n);
 assert.equal(new Set(tasks.map(q=>q.section)).size,8,'Missing source-structured exercise section '+n);
 assert.equal(tasks.filter(x=>x.audio).length,22,'Listening count '+n);
 assert.equal(tasks.filter(x=>x.section.startsWith('阅读')).length,21,'Reading count '+n);
 assert.equal(tasks.filter(x=>x.section.startsWith('书写')).length,7,'Writing count '+n);
 for(const q of tasks){
  assert(q.prompt&&q.answer&&q.explanation,'Incomplete task '+n+' '+q.id);
  if(q.kind==='choice')assert(q.options.includes(q.answer),'No correct option in '+q.id);
  if(q.kind==='order')assert(q.tokens.length>=2,'No word tokens '+q.id);
  if(q.kind==='text'&&q.section==='Грамматика')assert(q.prompt.includes('＿＿＿'),'Missing blank '+q.id);
 }
 console.log('Lesson '+n+': '+tasks.length+' independently authored tasks across six types');
}
console.log('Workbook source-aligned authored practice verification passed (not a mobile browser test).');

const officialCodes=fs.readFileSync(new URL('workbook-answer-codes.js',root),'utf8');
const companion=fs.readFileSync(new URL('workbook-original-companion.js',root),'utf8');
new vm.Script(officialCodes,{filename:'workbook-answer-codes.js'});
new vm.Script(companion,{filename:'workbook-original-companion.js'});
assert(html.includes('workbook-original-companion.js'),'Original source companion not linked');
assert(html.includes('workbook-answer-codes.js'),'Official answer codes not linked');
const keyContext={window:{}};
vm.runInNewContext(officialCodes,keyContext);
for(let n=1;n<=10;n++){
 const k=keyContext.window.HSK4OfficialAnswerCodes[n];
 assert.equal(Object.keys(k).length,43,'Original key answer count '+n);
 for(let i=1;i<=43;i++){
  assert(typeof k[i]==='string'&&k[i].length>0,'Missing official workbook key '+n+'/'+i);
  if(i<=5)assert(['Верно','Неверно'].includes(k[i]));
  else if(i>=31&&i<=34)assert(/^[ABC]{3}$/.test(k[i]));
  else assert(/^[ABCDE]$/.test(k[i]));
 }
}
console.log('Ten original workbook keyed answer sheets validated against expected question types.');
