'use strict';
const assert=require('assert');
const {jsdom}=require('jsdom');
const mammoth=require('mammoth');
const {Document,Packer,Paragraph,TextRun,Table,TableRow,TableCell}=require('docx');
require('../public/quiz-core.js');
globalThis.DOMParser=jsdom('').defaultView.DOMParser;
function cell(text){return new TableCell({children:[new Paragraph(text)]});}
(async()=>{
  const doc=new Document({sections:[{children:[
    new Paragraph('Câu 1: Thủ đô Việt Nam là gì?'),
    new Paragraph('A. Huế'),new Paragraph({children:[new TextRun({text:'B. Hà Nội',bold:true})]}),
    new Paragraph('C. Đà Nẵng'),new Paragraph('D. Cần Thơ'),
    new Paragraph('Câu 2: Chọn kết quả của 2 + 2'),
    new Table({rows:[new TableRow({children:[cell('A. 3'),cell('B. 4')]}),new TableRow({children:[cell('C. 5'),cell('D. 6')]})]}),
    new Table({rows:[new TableRow({children:[cell('BẢNG ĐÁP ÁN'),cell('Câu 1: B')]} )]})
  ]}]});
  const buffer=await Packer.toBuffer(doc), converted=await mammoth.convertToHtml({buffer});
  const parsed=globalThis.QuizCore.parseWordHtml(converted.value);
  assert.equal(parsed.questions.length,2);
  assert.equal(parsed.questions[0].options[1],'B. Hà Nội'.replace(/^B\.\s*/,''));
  assert.equal(parsed.questions[0].answer,-1,'formatting hint must not silently select a correct answer');
  assert.ok(parsed.questions[0].review);
  assert.equal(parsed.questions[1].options[0],'3');
  assert.ok(parsed.warnings.some(x=>x.includes('định dạng đánh dấu')));
  assert.equal(parsed.questions[0].answerHint,1,'answer table may only provide a review hint');
  assert.ok(parsed.warnings.some(x=>x.includes('bảng đáp án gợi ý')));
  console.log('quiz-word: generated DOCX -> Mammoth HTML -> parser; 8 assertions passed');
})().catch(e=>{console.error(e);process.exit(1)});




