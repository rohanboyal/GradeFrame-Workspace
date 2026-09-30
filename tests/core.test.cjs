const test = require('node:test');
const assert = require('node:assert/strict');
const G = require('../core.js');
const XLSX = require('../vendor/xlsx.full.min.js');
const header = ['BITS ID','Course','Total Marks'];

test('every integer mark has exactly one default grade, including all boundaries',()=>{
  const bands=G.defaults();assert.equal(G.validateRanges(bands),'');
  for(let mark=0;mark<=100;mark++) {
    assert.equal(bands.filter(([low,high])=>mark>=low&&mark<=high).length,1);
    const expected=mark>=80?'A':mark>=70?'A-':mark>=60?'B':mark>=50?'B-':mark>=40?'C':mark>=30?'C-':mark>=20?'D':'E';
    assert.equal(G.gradeFor(mark,bands),expected);
  }
});
test('missing endpoints, gaps, overlaps, blank values and reversed bands are rejected',()=>{
  for(const change of [r=>r[0][1]=99,r=>r[7][0]=1,r=>r[1][1]=78,r=>r[1][1]=80,r=>r[0][0]=NaN,r=>r[2][0]=69.5,r=>r[2][0]=70]) {
    const ranges=G.defaults();change(ranges);assert.notEqual(G.validateRanges(ranges),'');
    assert.throws(()=>G.exportCSV([{id:'TEST',course:'Course A',mark:80}],ranges,'Tester'));
  }
});
test('valid single-mark bands are accepted',()=>{
  const ranges=G.defaults();ranges[0][0]=100;ranges[1][1]=99;
  assert.equal(G.validateRanges(ranges),'');assert.equal(G.gradeFor(100,ranges),'A');assert.equal(G.gradeFor(99,ranges),'A-');
});
test('500 deterministic partitions cover every mark exactly once',()=>{
  let seed=17;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed;};
  for(let trial=0;trial<500;trial++) {
    const cuts=new Set();while(cuts.size<7)cuts.add(1+random()%100);
    const starts=[...[...cuts].sort((a,b)=>b-a),0];
    const ranges=starts.map((low,i)=>[low,i?starts[i-1]-1:100]);
    assert.equal(G.validateRanges(ranges),'');
    for(let mark=0;mark<=100;mark++)assert.equal(ranges.filter(([low,high])=>mark>=low&&mark<=high).length,1);
  }
});
test('statistics handle empty, even, odd, identical and string-imported marks',()=>{
  assert.deepEqual(G.statistics([]),{count:0,min:null,max:null,mean:null,median:null,std:null});
  const result=G.statistics([0,20,80,100].map(mark=>({mark})));
  assert.equal(result.min,0);assert.equal(result.max,100);assert.equal(result.mean,50);assert.equal(result.median,50);
  assert.equal(G.statistics([1,9,3].map(mark=>({mark}))).median,3);
  assert.equal(G.statistics([{mark:70},{mark:70}]).std,0);
  assert.equal(G.statistics(G.validateRows([header,['001','A','80'],['002','A','90']]).rows).mean,85);
});
test('workbook data rejects ambiguous and invalid records without silent rounding',()=>{
  for(const value of ['',null,undefined,'oops',true,NaN,Infinity,-1,101,80.2,'80.2'])assert.ok(G.validateRows([header,['ID','A',value]]).errors.length, String(value));
  assert.ok(G.validateRows([header,['','A',80]]).errors.length);
  assert.ok(G.validateRows([header,['ID','',80]]).errors.length);
  assert.ok(G.validateRows([header,['ID','A',80],['ID','A',90]]).errors.length);
  assert.equal(G.validateRows([header,['ID','A',80],['ID','B',90]]).errors.length,0);
  assert.ok(G.validateRows([header]).errors.length);
  assert.ok(G.validateRows([['ID','Course','Total Marks'],['ID','A',80]]).errors.length);
});
test('header order, leading-zero IDs, whitespace and blank rows are handled',()=>{
  const result=G.validateRows([['Total Marks','BITS ID','Course'],[80,'001',' A '],['','','']]);
  assert.deepEqual(result,{rows:[{id:'001',course:'A',mark:80}],errors:[]});
});
test('CSV round trip preserves commas, quotes, line breaks and Unicode',()=>{
  const rows=[{id:'001',course:'Math, "I"\nα',mark:100},{id:'002',course:'Math, "I"\nα',mark:0}];
  const csv=G.exportCSV(rows,G.defaults(),'Instructor, "Name"');
  const wb=XLSX.read(csv,{type:'string',raw:true});
  const parsed=XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]],{header:1});
  assert.equal(parsed.length,3);assert.equal(parsed[1][0],'001');assert.equal(parsed[1][1],rows[0].course);assert.equal(parsed[1][3],'A');assert.equal(parsed[2][3],'E');assert.equal(parsed[1][4],'Instructor, "Name"');
});
test('export requires a name and data, and protects spreadsheet formula text',()=>{
  assert.throws(()=>G.exportCSV([],G.defaults(),'Tester'));
  assert.throws(()=>G.exportCSV([{mark:1}],G.defaults(),' '));
  assert.throws(()=>G.exportCSV([{mark:101}],G.defaults(),'Tester'));
  assert.equal(G.csvCell('=1+1'),'"\'=1+1"');assert.equal(G.csvCell(' \t@SUM(1)'),'"\' \t@SUM(1)"');
});
