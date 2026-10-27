import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const expected={11:31,12:32,13:34,14:32,15:31,16:31,17:34,18:32,19:32,20:33};
let total=0;
const chinese=/[\u3400-\u9fff]/;
for(let lesson=11;lesson<=20;lesson++){
 const data=JSON.parse(fs.readFileSync(new URL('../hsk4b/lesson-'+lesson+'.json',import.meta.url),'utf8'));
 assert.equal(data.lesson,lesson);
 assert.equal(data.items.length,expected[lesson],'Lesson '+lesson+' count');
 assert.equal(new Set(data.items.map(w=>w[0])).size,data.items.length,'Duplicate headwords lesson '+lesson);
 for(const row of data.items){
  assert.equal(row.length,5,'Field count: '+lesson);
  const [word,pinyin,meaning,example,translation]=row;
  assert(word&&pinyin&&meaning&&example&&translation,'Empty field '+lesson);
  assert(chinese.test(word)&&chinese.test(example),'Chinese missing '+word);
  assert(example.includes(word),'Example must use the vocabulary item '+word);
  assert(pinyin==='ya'||/[āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜńň]/i.test(pinyin),'Tones missing in '+word+' '+pinyin);
  assert(/[。！？]$/.test(example),'Chinese punctuation '+word);
 }
 total+=data.items.length;
}
assert.equal(total,322);
for(const path of ['hsk4b-studio.js']){
 const code=fs.readFileSync(new URL('../'+path,import.meta.url),'utf8');
 new vm.Script(code,{filename:path});
}
const html=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
assert(html.includes('hsk4b-studio.js')&&html.includes('hsk4b-studio.css'),'HSK4B assets not linked');
console.log('Verified '+total+' HSK 4B cards in lessons 11–20; Chinese sentence, pinyin, meaning and Russian translation present.');
