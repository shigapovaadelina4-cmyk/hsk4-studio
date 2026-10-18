/* Official ANSWER CODES manually checked against user-provided HSK 4A answer-key scan.
   These codes contain no workbook exercise text and must be used only with the user's copy of the workbook.
   44–50: written responses require human comparison against user's original answer-key PDF. */
(() => {
'use strict';
const lines = {
1:['00101','DBACCDD','ACADDABDCA','EACB','DEBA','ACB CBA ACB BAC','BBCCDBADD'],
2:['10011','CABDCAC','BDCDACCACB','CEBA','EADB','BAC BCA ACB CBA','CDABCCACB'],
3:['10010','CBDBBAB','CBDCBCCABD','CEBA','BEAD','BCA ACB ACB BAC','BACABCDDC'],
4:['10001','ADACBCB','BCCADCDCCA','CAEB','DAEB','BAC ACB ABC BAC','CDBADACDB'],
5:['01101','ACBABCD','BACDBBCDCD','EBCA','EBAD','BCA ACB BAC BCA','BDCABACBD'],
6:['00011','DBACABC','DDABDADCAD','EBAC','DEAB','CAB ABC BAC BAC','BDBBDCCAD'],
7:['01011','CDBACAD','DBAACDDBDC','CAEB','DABE','ACB ACB CBA ABC','BCBDBACCB'],
8:['10101','BAADBCC','BCBDBACBBC','CEBA','DBAE','ABC CAB BCA BCA','ABBAABDCD'],
9:['10101','DBADCBA','CDABBDADDC','CBAE','BEDA','CBA CAB CBA BCA','BACCDDADC'],
10:['10110','BBCABDA','DCCDDCAADB','CEAB','DAEB','BAC CBA CAB CBA','CDCBCBCDA']
};
const keys={};
for(const [lesson,sections] of Object.entries(lines)){
 const all={};
 sections.slice(0,5).forEach((part,i)=>{
  const offsets=[1,6,13,23,27];
  [...part].forEach((answer,j)=>all[offsets[i]+j]=(i===0?(answer==='1'?'Верно':'Неверно'):answer));
 });
 sections[5].split(' ').forEach((v,j)=>all[31+j]=v);
 [...sections[6]].forEach((v,j)=>all[35+j]=v);
 if(Object.keys(all).length!==43)throw Error('Incomplete answer sheet in lesson '+lesson);
 keys[lesson]=all;
}
window.HSK4OfficialAnswerCodes=Object.freeze(keys);
})();