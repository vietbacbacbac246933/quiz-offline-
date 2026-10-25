'use strict';
const assert=require('assert');
const {jsdom}=require('jsdom');
const mammoth=require('mammoth');
const {Document,Packer,Paragraph,TextRun,ImageRun,Table,TableRow,TableCell}=require('docx');
require('../public/quiz-core.js');
globalThis.DOMParser=jsdom('').defaultView.DOMParser;
function cell(text){return new TableCell({children:[new Paragraph(text)]});}
(async()=>{
  const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=','base64');
  const doc=new Document({sections:[{children:[
    new Paragraph('Câu 1: Thủ đô Việt Nam là gì?'),
    new Paragraph({children:[new ImageRun({type:'png',data:png,transformation:{width:10,height:10}})]}),
    new Paragraph('A. Huế'),new Paragraph({children:[new TextRun({text:'B. Hà Nội',bold:true})]}),
    new Paragraph('C. Đà Nẵng'),new Paragraph('D. Cần Thơ'),
    new Paragraph('Câu 2: Chọn kết quả của 2 + 2; ký hiệu x² và α'),
    new Table({rows:[new TableRow({children:[cell('A. 3'),cell('B. 4')]}),new TableRow({children:[cell('C. 5'),cell('D. 6')]})]}),
    new Table({rows:[new TableRow({children:[cell('BẢNG ĐÁP ÁN'),cell('Câu 1: B')]} )]})
  ]}]});
  const buffer=await Packer.toBuffer(doc), converted=await mammoth.convertToHtml({buffer},{convertImage:mammoth.images.imgElement(image=>image.read('base64').then(data=>({src:'data:'+image.contentType+';base64,'+data})))});
  const parsed=globalThis.QuizCore.parseWordHtml(converted.value);
  assert.equal(parsed.questions.length,2);
  assert.equal(parsed.questions[0].options[1],'B. Hà Nội'.replace(/^B\.\s*/,''));
  assert.equal(parsed.questions[0].answer,-1,'formatting hint must not silently select a correct answer');
  assert.ok(parsed.questions[0].review);
  assert.equal(parsed.questions[1].options[0],'3');
  assert.ok(parsed.questions[1].text.includes('x²')&&parsed.questions[1].text.includes('α'));
  assert.ok(parsed.warnings.some(x=>x.includes('định dạng đánh dấu')));
  assert.equal(parsed.questions[0].answerHint,1,'answer table may only provide a review hint');
  assert.ok(parsed.warnings.some(x=>x.includes('bảng đáp án gợi ý')));
  assert.ok(parsed.warnings.some(x=>x.includes('Tài liệu có ảnh')));
  console.log('quiz-word: generated DOCX -> Mammoth HTML -> parser; paragraph, table, answer hints, Vietnamese math text and image warning passed (10 assertions).');
})().catch(e=>{console.error(e);process.exit(1)});




