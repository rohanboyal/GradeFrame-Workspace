const test=require('node:test');
const assert=require('node:assert/strict');
const G=require('../core.js');
const R=require('../reports.js');
const XLSX=require('../vendor/xlsx.full.min.js');

test('comparison conserves student counts and reports grade movement',()=>{
  const draft=G.defaults();draft[0][0]=85;draft[1][1]=84;
  const rows=[79,80,84,85,100,0].map((mark,i)=>({id:`ID${i}`,course:'A',mark}));
  const result=R.compare(rows,G.defaults(),draft);
  assert.equal(result.lower,2);assert.equal(result.higher,0);assert.equal(result.unchanged,4);
  assert.equal(result.bands.reduce((n,b)=>n+b.baseline,0),6);
  assert.equal(result.bands.reduce((n,b)=>n+b.current,0),6);
  assert.equal(R.compare(rows,draft,G.defaults()).higher,2);
});
test('boundary review includes exact cutoffs and both sides of tolerance',()=>{
  for(const mark of [78,79,80,81,82])assert.equal(R.nearestBoundary(mark,G.defaults(),2).cutoff,80);
  assert.equal(R.nearestBoundary(77,G.defaults(),2),null);
  assert.equal(R.nearestBoundary(82,G.defaults(),1),null);
  assert.equal(R.nearestBoundary(0,G.defaults(),2),null);
  assert.equal(R.nearestBoundary(100,G.defaults(),2),null);
});
test('comparison refuses invalid ranges and does not mutate snapshots',()=>{
  const baseline=G.defaults(),draft=G.defaults();draft[0][0]=85;draft[1][1]=84;
  R.compare([{mark:80}],baseline,draft);assert.equal(baseline[0][0],80);assert.equal(draft[0][0],85);
  draft[0][1]=99;assert.throws(()=>R.compare([{mark:80}],baseline,draft));
  assert.equal(R.nearestBoundary(80,draft),null);
});
test('error report preserves original row values and escapes spreadsheet formulas',()=>{
  const matrix=[['BITS ID','Course','Total Marks'],['=1+1','A','bad'],['ID2','A',101]];
  const issues=R.issuesFor(matrix,G.validateRows(matrix).errors);
  assert.equal(issues[0].row,2);assert.equal(issues[0].values,'=1+1 | A | bad');
  const csv=R.issueCSV(issues);assert.ok(csv.includes("'=1+1"));
  const wb=XLSX.read(csv,{type:'string',raw:true});assert.equal(XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]],{header:1}).length,3);
});
test('grading report includes complete results and safely escapes untrusted text',()=>{
  const html=R.gradingReport({rows:[{id:'<img src=x onerror=alert(1)>',course:'A',mark:80}],baseline:G.defaults(),draft:G.defaults(),instructor:'<script>bad</script>',course:'A & B',baselineName:'Original',notes:'<b>Reason</b>',source:'test.xlsx',created:'Test date'});
  assert.ok(!html.includes('<script>'));assert.ok(!html.includes('<img'));
  assert.ok(html.includes('&lt;script&gt;'));assert.ok(html.includes('A &amp; B'));assert.ok(html.includes('&lt;b&gt;Reason&lt;/b&gt;'));
  assert.ok(html.includes('Complete student results'));assert.ok(html.includes('Test date'));
});
test('large comparison accounts for 10000 records without truncation',()=>{
  const rows=Array.from({length:10000},(_,i)=>({id:`ID${i}`,course:'Large',mark:i%101}));
  const result=R.compare(rows,G.defaults(),G.defaults());assert.equal(result.unchanged,10000);assert.equal(result.students.length,10000);
});
