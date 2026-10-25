'use strict';
const assert=require('assert');
require('../public/quiz-core.js');
const c=globalThis.QuizCore;
const exam=c.validateExam({title:'Ôn tập tiếng Việt',questions:[{text:'Câu 1: 2 + 2 = ?',options:['3','4','5','6'],answer:1}]});
assert.equal(exam.questions.length,1);assert.ok(exam.id);
assert.throws(()=>c.validateExam({questions:[{text:'x',options:['a'],answer:0}]}),/2 đến 10/);
assert.throws(()=>c.validateExam({questions:[{text:'x',options:['a','b'],answer:-1}]}),/đáp án/);
assert.throws(()=>c.validateExam({questions:[{id:'dup',text:'x',options:['a','b'],answer:0},{id:'dup',text:'y',options:['a','b'],answer:0}]}),/ID câu hỏi bị trùng/);
assert.throws(()=>c.validateExam({questions:[{text:'x',options:['a',''],answer:0}]}),/phương án trống/);
const html=c.standalone(exam);assert.ok(html.startsWith('<!doctype html>'));assert.ok(html.includes('Ôn tập tiếng Việt'));assert.ok(!/https?:\/\//.test(html));assert.ok(html.includes('attemptId'));assert.ok(html.includes('</script></html>'));
assert.throws(()=>c.result({}),/thiếu/);
const r=c.result({examId:exam.id,attemptId:'attempt-1',answers:[1],score:1,student:{name:'An'}});assert.equal(r.student.name,'An');
assert.equal(c.result({...r,attemptId:'attempt-2'}).attemptId,'attempt-2');
const aggregated=c.aggregateResults([{name:'a.json',data:r},{name:'dup.json',data:r},{name:'broken.json',data:{}}]);
assert.equal(aggregated.results.length,1);assert.equal(aggregated.errors.length,2);
const mixed=c.aggregateResults([{name:'mixed.json',data:[r,{}, {...r,attemptId:'attempt-3'}]},{name:'empty.json',data:[]}]);
assert.equal(mixed.results.length,2);assert.equal(mixed.errors.length,2);
const merged=c.mergeResults([r],[{name:'batch.json',data:[r,{...r,attemptId:'attempt-4',score:0},{}]}]);
assert.equal(merged.results.length,2);assert.equal(merged.added.length,1);assert.equal(merged.results[0].attemptId,'attempt-1');assert.equal(merged.results[1].attemptId,'attempt-4');assert.equal(merged.errors.length,2);
const XLSX=require('xlsx'),wb=XLSX.utils.book_new(),excelRows=c.resultExcelRows(aggregated.results);XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(excelRows),'Ket qua');
const roundTrip=XLSX.read(XLSX.write(wb,{type:'buffer',bookType:'xlsx'}),{type:'buffer'});const sheet=XLSX.utils.sheet_to_json(roundTrip.Sheets['Ket qua']);assert.deepStrictEqual(Object.keys(sheet[0]),['STT','Họ tên','Lớp','Tên đề','ID đề','Điểm','Số câu đúng','Tổng số câu','Thời điểm nộp','ID lượt làm bài','Câu trả lời']);assert.equal(sheet[0]['Họ tên'],'An');assert.equal(sheet[0]['Điểm'],1);assert.equal(sheet[0]['ID đề'],r.examId);assert.equal(sheet[0]['ID lượt làm bài'],r.attemptId);assert.equal(sheet[0]['Câu trả lời'],'[1]');
const fs=require('fs'),os=require('os'),path=require('path');const temp=fs.mkdtempSync(path.join(os.tmpdir(),'quiz-results-xlsx-')),xlsxPath=path.join(temp,'results.xlsx');try{XLSX.writeFile(wb,xlsxPath);const reopened=XLSX.readFile(xlsxPath);assert.equal(XLSX.utils.sheet_to_json(reopened.Sheets['Ket qua'])[0]['ID lượt làm bài'],r.attemptId);}finally{if(fs.existsSync(xlsxPath))fs.unlinkSync(xlsxPath);fs.rmdirSync(temp);}
const hostile=c.standalone(c.validateExam({title:'<img src=x>',questions:[{text:'</script><img src=x onerror=1>',options:['<b>x</b>','y'],answer:0}]}));
assert.ok(hostile.includes('&lt;img src=x&gt;')&&!hostile.includes('<img src=x onerror=1>'));
console.log('quiz-core: passed 35 assertions');

const marker='<script>';const start=html.lastIndexOf(marker);const end=html.lastIndexOf('</script></html>');assert.ok(start>=0&&end>start,'standalone app script is present');new Function(html.slice(start+marker.length,end));assert.ok(!html.includes('<script src=')&&!html.includes('https://'));console.log('standalone HTML inline script parses with no external URLs');

(async()=>{
  const fs=require('fs'),fixture=path=>fs.readFileSync(require('path').join(__dirname,'fixtures','result-import',path),'utf8');
  const files=[
    {name:'valid-1.json',text:async()=>fixture('valid-1.json')},
    {name:'valid-and-duplicate.json',text:async()=>fixture('valid-and-duplicate.json')},
    {name:'malformed.json',text:async()=>fixture('malformed.json')},
    {name:'invalid.json',text:async()=>fixture('invalid.json')}
  ];
  const loaded=await c.readResultFiles(files);assert.equal(loaded.results.length,2);assert.equal(loaded.errors.length,3);assert.equal(loaded.results[0].student.name,'Nguyễn An');assert.equal(loaded.results[1].attemptId,'attempt-browser-002');
  const persisted=c.mergeResults([], [{name:'input',data:loaded.results}]);assert.equal(persisted.results.length,2);assert.equal(persisted.added.length,2);
  console.log('quiz result files: valid, batch, duplicate, malformed and incomplete inputs handled; 6 assertions passed');
})().catch(e=>{console.error(e);process.exitCode=1});




