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
