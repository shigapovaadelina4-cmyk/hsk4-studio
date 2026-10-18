import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const html=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
const scripts=[...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)].map(x=>x[1]);
assert(scripts.length>0,'No inline scripts');
for(const [index,source] of scripts.entries()){
  if(!source.trim())continue;
  new vm.Script(source,{filename:'index.html:inline-script-'+(index+1)});
}

const dataStart=html.indexOf('const data={');
const dataEnd=html.indexOf('function init(){',dataStart);
assert(dataStart>=0&&dataEnd>dataStart,'Cannot locate vocabulary data assembly');
const context={console};
vm.runInNewContext(html.slice(dataStart,dataEnd)+'\n;globalThis.checkedData=data;',context);
const expected={2:34,3:33,4:32,5:31,6:31,7:33,8:29,9:33,10:30};
for(const [lesson,count] of Object.entries(expected)){
  const words=context.checkedData[lesson]?.words;
  assert.equal(words?.length,count,'Lesson '+lesson+' count differs from textbook');
  assert.equal(new Set(words.map(w=>w[0])).size,count,'Lesson '+lesson+' duplicate headword');
  for(const word of words){
    assert.equal(word.length,3,'Lesson '+lesson+' has unsourced example fields');
    assert(word.every(v=>typeof v==='string'&&v.trim()),'Lesson '+lesson+' has empty Chinese/pinyin/Russian field');
  }
}

const demoStart=html.indexOf('const demo=');
const demoEnd=html.indexOf('demo.push(...lesson1ProperNames);',demoStart);
assert(demoStart>=0&&demoEnd>demoStart,'Cannot locate lesson 1 vocabulary');
const c1={};
vm.runInNewContext(html.slice(demoStart,demoEnd+'demo.push(...lesson1ProperNames);'.length)+'\n;globalThis.words=demo;',c1);
assert.equal(c1.words.length,37,'Lesson 1 should have 32 numbered words and 5 proper names');
assert.equal(new Set(c1.words.map(w=>w.w)).size,37,'Lesson 1 duplicate headword');
for(const w of c1.words)assert(w.w&&w.p&&w.r&&!w.ex,'Lesson 1 card missing field or unsourced example');

assert(html.includes('Знаю')&&html.includes('Не знаю'),'Know / do not know controls missing');
assert(html.includes('mainLessonStudio'),'Main lesson studio missing');
assert(!html.includes('const draftCards='),'Non-textbook draft cards must not be present');
assert(!html.includes('const cardExamples='),'Unsourced Chinese example bank must not be present');
assert(!html.includes('const extraCardExamples='),'Unsourced Chinese example bank must not be present');
console.log('Passed: all inline JS parses; lessons 1–10: 323 cards including 14 proper names; no missing fields or duplicates; original controls retained.');
