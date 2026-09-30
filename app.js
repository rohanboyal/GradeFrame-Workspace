'use strict';
const G = window.Grading;
const R = window.GradingReports;
const $ = id => document.getElementById(id);
let data = [], ranges = G.defaults(), courseRanges = new Map(), history = new Map();
let page = 0, started = null, uploadRevision = 0, busy = false, filename = '';
let snapshots = new Map(), selectedBaselines = new Map(), decisionNotes = new Map(), uploadIssues = [], snapshotId = 0;
const baselineForCourse = () => (snapshots.get($('course').value)||[]).find(item=>item.id===selectedBaselines.get($('course').value));
const baselineRanges = () => baselineForCourse()?.ranges || G.defaults();
const baselineName = () => baselineForCourse()?.name || 'Default boundaries';
const pageSize = 25;
const rowsForCourse = () => data.filter(row => row.course === $('course').value);
const copyRanges = value => value.map(pair => [...pair]);
const el = (tag,text,className) => {const node=document.createElement(tag);if(text != null) node.textContent=text;if(className) node.className=className;return node;};
const fmt = value => value == null ? '—' : Number.isInteger(value) ? String(value) : value.toFixed(2);

function sampleMatrix() {
  const marks = [100,96,92,91,88,86,85,84,82,81,80,79,78,76,75,74,73,72,71,70,69,68,67,66,65,64,63,62,61,60,59,58,56,55,54,52,50,49,47,45,42,40,39,35,30,29,25,20,19,0];
  return [['BITS ID','Course','Total Marks'],...marks.map((mark,i)=>[`DEMO${String(i+1).padStart(3,'0')}`,'Foundations of Computing',mark]),...marks.slice(0,16).map((mark,i)=>[`DEMO${String(i+1).padStart(3,'0')}`,'Mathematics I',Math.max(0,mark-12)])];
}

function download(content,name,type) {
  if(name!=='sample-marks.xlsx') name=($('workspaceSelect')?.selectedOptions[0]?.textContent||'workspace').replace(/[^a-z0-9_-]+/gi,'-').slice(0,90)+'-'+name;
  const url = URL.createObjectURL(new Blob([content],{type}));
  const link=el('a');link.href=url;link.download=name;document.body.append(link);link.click();link.remove();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
}

function showErrors(messages,matrix=[]) {
  uploadIssues=R.issuesFor(matrix,messages);
  $('downloadIssues').hidden=!messages.length;
  const box=$('uploadErrors');box.replaceChildren();box.hidden=!messages.length;
  if (!messages.length) return;
  box.append(el('strong',`${messages.length} issue${messages.length===1?'':'s'} found. Workbook not imported.`));
  const scroller=el('div',null,'table-scroll'),table=el('table'),head=el('thead'),header=el('tr');
  ['Row','Original values','Issue'].forEach(title=>{const th=el('th',title);th.scope='col';header.append(th);});head.append(header);table.append(head);
  const body=el('tbody');uploadIssues.slice(0,30).forEach(issue=>{const tr=el('tr');[issue.row,issue.values||'—',issue.reason].forEach(value=>tr.append(el('td',value)));body.append(tr);});table.append(body);scroller.append(table);box.append(scroller);
  if(messages.length>30) box.append(el('p',`${messages.length-30} more issues. Correct the workbook and try again.`));
  if(data.length) box.append(el('p',`Still using ${filename}. The previous valid workbook has been kept.`));
}

async function importFile(file) {
  if(!file) return;
  const revision=++uploadRevision;
  let imported=false;
  busy=true;showErrors([]);$('uploadStatus').textContent='Checking workbook…';render();
  try {
    if(!/\.(xlsx|xls)$/i.test(file.name)) throw new Error('Choose an .xlsx or .xls workbook.');
    if(file.size>5*1024*1024) throw new Error('The workbook exceeds the 5 MB limit.');
    if(!window.XLSX) throw new Error('The Excel reader could not load. Refresh this page and try again.');
    const buffer=await file.arrayBuffer();
    if(revision!==uploadRevision) return;
    const signature=new Uint8Array(buffer,0,Math.min(buffer.byteLength,4));
    if(!(signature[0]===0x50&&signature[1]===0x4b)&&!(signature[0]===0xd0&&signature[1]===0xcf)) throw new Error('This file is not a supported Excel workbook. Save it as .xlsx and try again.');
    let workbook;
    try {workbook=XLSX.read(buffer,{type:'array',cellFormula:true,sheetRows:10002});} catch {throw new Error('The workbook could not be read. Check that it is a valid, unencrypted Excel file.');}
    if(!workbook.SheetNames.length) throw new Error('The workbook has no worksheets.');
    const sheet=workbook.Sheets[workbook.SheetNames[0]];
    const ref=sheet['!fullref']||sheet['!ref'];
    if(ref) {
      const dimension=XLSX.utils.decode_range(ref);
      if(dimension.e.r>10000) throw new Error('The first worksheet exceeds 10,000 data rows.');
      if(dimension.e.c>2) throw new Error('Use exactly three columns in the first worksheet. Remove extra columns and formatting beyond column C.');
    }
    const formulas=Object.entries(sheet).filter(([key,value])=>!key.startsWith('!')&&value.f);
    if(formulas.length) throw new Error(`Formula cells are not supported (${formulas.slice(0,5).map(([key])=>key).join(', ')}). Paste values into a copy of the workbook first.`);
    const matrix=XLSX.utils.sheet_to_json(sheet,{header:1,defval:'',raw:true,blankrows:true});
    const checked=G.validateRows(matrix);
    if(checked.errors.length){showErrors(checked.errors,matrix);$('uploadStatus').textContent='Import needs attention.';return;}
    data=checked.rows;filename=file.name;ranges=G.defaults();courseRanges=new Map();history=new Map();snapshots=new Map();selectedBaselines=new Map();decisionNotes=new Map();page=0;started=Date.now();
    $('course').replaceChildren();
    [...new Set(data.map(row=>row.course))].sort().forEach(course=>$('course').add(new Option(course,course)));
    $('search').value='';$('gradeFilter').value='';$('changedOnly').checked=false;$('nearOnly').checked=false;
    $('scenarioName').value='';$('scenarioStatus').textContent='';$('decisionNotes').value='';syncScenarios();
    $('exportStatus').textContent='';
    $('uploadStatus').textContent=`${file.name} · ${data.length} records verified · First worksheet: ${workbook.SheetNames[0]}`;
    $('dataBadge').textContent=file.name==='sample-marks.xlsx'?'SAMPLE DATA':`${data.length} records verified`;
    buildBands();updateTimer();imported=true;
  } catch(error) {
    if(revision===uploadRevision){showErrors([error.message]);$('uploadStatus').textContent='Import needs attention.';}
  } finally {
    if(revision===uploadRevision){busy=false;$('file').value='';render();document.dispatchEvent(new CustomEvent('gradeframe:import-finished',{detail:{success:imported}}));}
  }
}

function remember() {
  const course=$('course').value;
  const stack=history.get(course)||[];stack.push(copyRanges(ranges));if(stack.length>30) stack.shift();history.set(course,stack);
}

function buildBands() {
  $('bands').replaceChildren();
  G.GRADES.forEach((grade,index)=>{
    const row=el('div',null,'band');row.append(el('strong',grade));
    ['minimum','maximum'].forEach((kind,side)=>{
      const input=el('input');input.type='number';input.min=0;input.max=100;input.step=1;input.value=ranges[index][side];input.id=`band-${index}-${side}`;
      input.setAttribute('aria-label',`${grade} ${kind}`);
      input.disabled=!data.length||(index===0&&side===1)||(index===7&&side===0);
      input.oninput=input.onchange=()=>{
        const value=input.value===''?NaN:Number(input.value);
        if(Object.is(value,ranges[index][side])) return;
        remember();ranges[index][side]=value;
        if(side===0&&index<7) ranges[index+1][1]=ranges[index][0]-1;
        if(side===1&&index>0) ranges[index-1][0]=ranges[index][1]+1;
        courseRanges.set($('course').value,copyRanges(ranges));page=0;syncBands();render();
      };
      row.append(input);
    });
    const count=el('output','0');count.id=`band-count-${index}`;count.setAttribute('aria-label',`${grade} student count`);row.append(count);$('bands').append(row);
  });
}

function syncBands() {
  ranges.forEach((pair,i)=>pair.forEach((value,j)=>{$(`band-${i}-${j}`).value=Number.isFinite(value)?value:'';}));
}

function renderTable(rows,error) {
  const defaultRanges=baselineRanges();
  let filtered=rows.filter(row=>row.id.toLowerCase().includes($('search').value.toLowerCase().trim()));
  if(!error) filtered=filtered.filter(row=>(!$('gradeFilter').value||G.gradeFor(row.mark,ranges)===$('gradeFilter').value)&&(!$('changedOnly').checked||G.gradeFor(row.mark,ranges)!==G.gradeFor(row.mark,defaultRanges)));
  if(!error&&$('nearOnly').checked) filtered=filtered.filter(row=>R.nearestBoundary(row.mark,ranges,Number($('tolerance').value)));
  filtered.sort($('sort').value==='high'?(a,b)=>b.mark-a.mark:$('sort').value==='low'?(a,b)=>a.mark-b.mark:(a,b)=>a.id.localeCompare(b.id,undefined,{numeric:true}));
  page=Math.min(page,Math.max(0,Math.ceil(filtered.length/pageSize)-1));
  $('studentRows').replaceChildren();
  filtered.slice(page*pageSize,(page+1)*pageSize).forEach(row=>{
    const tr=el('tr');const baseline=G.gradeFor(row.mark,defaultRanges),current=error?null:G.gradeFor(row.mark,ranges);
    [row.id,row.course,String(row.mark),baseline].forEach(value=>tr.append(el('td',value)));
    const gradeCell=el('td');gradeCell.append(el('span',current||'Check ranges','grade-pill'));tr.append(gradeCell);
    tr.append(el('td',error?'Pending':current===baseline?'—':`${baseline} → ${current}`,current!==baseline?'changed':''));
    const boundary=error?null:R.nearestBoundary(row.mark,ranges,Number($('tolerance').value)),boundaryCell=el('td');
    boundaryCell.append(el('span',boundary?`${boundary.distance===0?'At':boundary.distance+' from'} ${boundary.grade} cutoff (${boundary.cutoff})`:'—',boundary?'boundary-label':''));tr.append(boundaryCell);$('studentRows').append(tr);
  });
  if(!filtered.length){const tr=el('tr'),td=el('td',rows.length?'No students match these filters.':'Upload a workbook or try sample data to see student results.','empty');td.colSpan=7;tr.append(td);$('studentRows').append(tr);}
  $('resultCount').textContent=`${filtered.length} of ${rows.length} students`;
  $('pageInfo').textContent=filtered.length?`${page*pageSize+1}–${Math.min((page+1)*pageSize,filtered.length)} of ${filtered.length}`:'No results';
  $('previous').disabled=page===0;$('next').disabled=(page+1)*pageSize>=filtered.length;
}

function render() {
  const rows=rowsForCourse(),stats=G.statistics(rows),error=G.validateRanges(ranges);
  $('setup').setAttribute('aria-busy',String(busy));
  $('setup').classList.toggle('is-busy',busy);
  $('boundaries').classList.toggle('needs-attention',!!rows.length&&!!error);
  document.querySelectorAll('#bands input').forEach(input=>input.setAttribute('aria-describedby','rangeError'));
  const guidance=busy
    ? ['Checking your workbook…','Your current session stays available until the replacement is valid.','View import','#setup']
    : uploadIssues.length
      ? ['Your workbook needs a correction.','Review the row details below, correct the workbook and import it again.','Review issues','#uploadErrors']
      : !rows.length
        ? ['Start with a workbook, or try the sample.','Explore with synthetic marks before importing your own. Nothing leaves your browser.','Start here','#setup']
        : error
          ? ['Check the grade boundaries.','Every whole mark from 0 to 100 needs exactly one grade. Your export is paused until the ranges are valid.','Fix boundaries','#boundaries']
          : !$('instructor').value.trim()
            ? ['Your marks are ready to explore.','Review the distribution and compare boundaries. Add your instructor name when you are ready to export.','Add your name','#instructor']
            : ['Ready for your final review.','Check the students affected by your boundaries. Export always includes the complete selected course.','Review results','#review'];
  $('nextTitle').textContent=guidance[0];$('nextHint').textContent=guidance[1];$('nextAction').textContent=guidance[2]+' ↗';$('nextAction').href=guidance[3];
  $('course').disabled=!data.length||busy;
  $('courseTitle').textContent=$('course').value||'Your grading workspace';
  $('count').textContent=stats.count;$('mean').textContent=fmt(stats.mean);$('median').textContent=fmt(stats.median);
  $('range').textContent=stats.count?`${stats.min}–${stats.max}`:'—';$('minimum').textContent=`Min ${fmt(stats.min)}`;$('maximum').textContent=`Max ${fmt(stats.max)}`;
  $('spread').textContent=`Standard deviation ${fmt(stats.std)}`;
  const bins=Array(10).fill(0);rows.forEach(row=>bins[Math.min(9,Math.floor(row.mark/10))]++);
  const peak=Math.max(1,...bins);$('histogram').replaceChildren();
  bins.forEach((count,i)=>{const label=`${i*10}–${i===9?100:i*10+9}`,column=el('div',null,'hist-column');column.setAttribute('aria-label',`${label} marks: ${count} students`);column.append(el('b',count));const bar=el('div',null,'bar');bar.style.height=`${count/peak*155}px`;column.append(bar,el('small',label));$('histogram').append(column);});
  const counts=G.GRADES.map(grade=>error?0:rows.filter(row=>G.gradeFor(row.mark,ranges)===grade).length);
  $('gradeSummary').replaceChildren();counts.forEach((count,i)=>{const cell=el('div',null,'summary-cell');cell.append(el('span',G.GRADES[i]),el('strong',error?'—':count));$('gradeSummary').append(cell);$(`band-count-${i}`).textContent=error?'—':count;});
  $('rangeError').textContent=rows.length?error:'';
  $('coverage').textContent=!rows.length?'Upload marks to start':error?'Resolve ranges before export':'✓ All marks 0–100 covered';
  $('reset').disabled=!rows.length||busy;$('undo').disabled=!(history.get($('course').value)||[]).length||busy;
  $('changedOnly').disabled=!rows.length||!!error;$('gradeFilter').disabled=!!error;$('nearOnly').disabled=!rows.length||!!error;
  const changed=rows.filter(row=>G.gradeFor(row.mark,ranges)!==G.gradeFor(row.mark,baselineRanges())).length;
  $('impactText').textContent=!rows.length?'Changes to grade boundaries will appear here.':error?'Resolve the grade ranges to preview their impact.':`${changed} of ${rows.length} students have a different grade compared with ${baselineName()}.`;
  const ready=rows.length>0&&!error&&$('instructor').value.trim()&&!busy;
  $('export').disabled=!ready;
  $('report').disabled=!ready;
  $('exportTitle').textContent=ready?`Download results for ${rows.length} students`:'Complete the export requirements';
  $('exportHint').textContent=busy?'Checking your workbook…':!rows.length?'Upload a valid workbook to begin.':error?'Resolve grade boundary errors in Analysis.':!$('instructor').value.trim()?'Enter your instructor name to enable downloads.':'Review this course, then choose Excel or CSV. All students in the course are included.';
  renderTable(rows,error);
  renderComparison(rows,error);
  document.dispatchEvent(new Event('gradeframe:render'));
}

function syncScenarios() {
  $('baselineSelect').replaceChildren(new Option('Default boundaries','defaults'));
  (snapshots.get($('course').value)||[]).forEach(item=>$('baselineSelect').add(new Option(item.name,item.id)));
  $('baselineSelect').value=selectedBaselines.get($('course').value)||'defaults';
  $('baselineDescription').textContent=baselineForCourse()?'Saved boundaries for this course. Editing current boundaries does not change this saved scenario.':"The challenge's original grade ranges.";
  $('baselineColumn').textContent='Baseline grade';
}

function renderComparison(rows,error) {
  const usable=rows.length&&!error;
  $('saveScenario').disabled=!usable||busy||(snapshots.get($('course').value)||[]).length>=5;
  $('applyBaseline').disabled=!rows.length||busy;$('baselineSelect').disabled=!rows.length||busy;
  const result=usable?R.compare(rows,baselineRanges(),ranges):null;
  $('higherCount').textContent=result?result.higher:'—';$('lowerCount').textContent=result?result.lower:'—';$('sameCount').textContent=result?result.unchanged:'—';
  $('comparisonChart').replaceChildren();
  const max=result?Math.max(1,...result.bands.flatMap(band=>[band.baseline,band.current])):1;
  G.GRADES.forEach((grade,i)=>{const band=result?.bands[i],block=el('div',null,'compare-band');block.append(el('h4',grade));
    ['baseline','current'].forEach(kind=>{const track=el('div',null,`compare-track ${kind}`),fill=el('i');fill.style.width=`${band?band[kind]/max*100:0}%`;track.append(fill);block.append(track);});
    block.append(el('small',band?`${band.baseline} → ${band.current}`:'—'));block.setAttribute('aria-label',band?`${grade}: baseline ${band.baseline}, draft ${band.current}`:`${grade}: no comparison`);$('comparisonChart').append(block);});
  const near=usable?rows.filter(row=>R.nearestBoundary(row.mark,ranges,Number($('tolerance').value))).length:0;
  $('nearCount').textContent=!rows.length?'Load a course to review boundary cases.':error?'Resolve boundaries to review nearby students.':`${near} students within ${$('tolerance').value} mark${$('tolerance').value==='1'?'':'s'} of a draft cutoff.`;
}

function updateTimer(){
  const total=started?Math.floor((Date.now()-started)/1000):0;
  $('timer').textContent=`${String(Math.floor(total/60)).padStart(2,'0')}:${String(total%60).padStart(2,'0')}`;
}

$('file').onchange=event=>importFile(event.target.files[0]);
$('demo').onclick=()=>{
  if(!window.XLSX){showErrors(['The Excel reader could not load. Refresh and try again.']);return;}
  const workbook=XLSX.utils.book_new();XLSX.utils.book_append_sheet(workbook,XLSX.utils.aoa_to_sheet(sampleMatrix()),'Marks');
  importFile(new File([XLSX.write(workbook,{type:'array',bookType:'xlsx'})],'sample-marks.xlsx'));
};
$('template').onclick=()=>{
  if(!window.XLSX){showErrors(['The Excel reader could not load. Refresh and try again.']);return;}
  const workbook=XLSX.utils.book_new();XLSX.utils.book_append_sheet(workbook,XLSX.utils.aoa_to_sheet(sampleMatrix()),'Marks');download(XLSX.write(workbook,{type:'array',bookType:'xlsx'}),'sample-marks.xlsx','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
};
$('course').onchange=()=>{ranges=copyRanges(courseRanges.get($('course').value)||G.defaults());page=0;$('decisionNotes').value=decisionNotes.get($('course').value)||'';$('scenarioStatus').textContent='';syncScenarios();buildBands();render();};
$('reset').onclick=()=>{if(!rowsForCourse().length)return;remember();ranges=G.defaults();courseRanges.set($('course').value,copyRanges(ranges));syncBands();render();};
$('undo').onclick=()=>{const stack=history.get($('course').value)||[];if(!stack.length)return;ranges=stack.pop();courseRanges.set($('course').value,copyRanges(ranges));syncBands();render();};
$('instructor').oninput=render;
['search','gradeFilter','sort','changedOnly','nearOnly','tolerance'].forEach(id=>$(id).addEventListener(id==='search'?'input':'change',()=>{page=0;render();}));
$('previous').onclick=()=>{page--;render();};$('next').onclick=()=>{page++;render();};
$('export').onclick=()=>{
  render();if($('export').disabled)return;
  $('exportDetails').textContent=`${$('course').value} · ${rowsForCourse().length} students · Instructor: ${$('instructor').value.trim()}`;
  $('exportBands').textContent=G.GRADES.map((grade,i)=>`${grade}: ${ranges[i][0]}–${ranges[i][1]}`).join(' · ');
  $('exportDialog').showModal();
};
$('cancelExport').onclick=()=>$('exportDialog').close();
$('confirmExcel').onclick=()=>{
  render();if($('export').disabled)return;
  try{
    const workbook=buildResultsWorkbook({rows:rowsForCourse(),ranges,baseline:baselineRanges(),instructor:$('instructor').value,workspace:$('workspaceSelect').selectedOptions[0].textContent,course:$('course').value,source:filename,notes:$('decisionNotes').value,baselineName:baselineName()});
    const course=$('course').value.replace(/[^a-z0-9_-]+/gi,'-').slice(0,70)||'course';
    download(XLSX.write(workbook,{type:'array',bookType:'xlsx'}),`${course}-results.xlsx`,'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    $('exportStatus').textContent=`Excel workbook prepared for ${rowsForCourse().length} students. Use the header arrows to filter the Student results sheet; grading context is on Grading details.`;
    $('exportDialog').close();
  }catch(error){$('exportDetails').textContent=error.message;}
};
$('confirmExport').onclick=()=>{
  try{const rows=rowsForCourse();const csv=G.exportCSV(rows,ranges,$('instructor').value);const course=$('course').value.replace(/[^a-z0-9_-]+/gi,'-').slice(0,70)||'course';download(csv,`${course}-grades.csv`,'text/csv;charset=utf-8');$('exportStatus').textContent=`CSV prepared for ${rows.length} students in ${$('course').value}. Session time: ${$('timer').textContent}.`; $('exportDialog').close();}catch(error){$('exportDetails').textContent=error.message;}
};
G.GRADES.forEach(grade=>$('gradeFilter').add(new Option(grade,grade)));
$('saveScenario').onclick=()=>{
  if(G.validateRanges(ranges)||!rowsForCourse().length||busy)return;
  const items=snapshots.get($('course').value)||[],name=$('scenarioName').value.trim()||`Scenario ${items.length+1}`;
  if(items.length>=5)return;
  if(items.some(item=>item.name.toLowerCase()===name.toLowerCase())){$('scenarioStatus').textContent='That name is already used in this course. Choose a different name.';return;}
  const item={id:`snapshot-${++snapshotId}`,name,ranges:copyRanges(ranges)};items.push(item);snapshots.set($('course').value,items);selectedBaselines.set($('course').value,item.id);$('scenarioName').value='';$('scenarioStatus').textContent=`Saved “${name}” as the comparison baseline. Adjust the draft above to explore changes.`;page=0;syncScenarios();render();
};
$('baselineSelect').onchange=()=>{selectedBaselines.set($('course').value,$('baselineSelect').value);page=0;syncScenarios();render();};
$('applyBaseline').onclick=()=>{if(!rowsForCourse().length)return;remember();ranges=copyRanges(baselineRanges());courseRanges.set($('course').value,copyRanges(ranges));syncBands();render();$('scenarioStatus').textContent=`Applied ${baselineName()} to the draft. You can undo this change.`;};
$('decisionNotes').oninput=()=>decisionNotes.set($('course').value,$('decisionNotes').value);
$('downloadIssues').onclick=()=>download(R.issueCSV(uploadIssues),'workbook-errors.csv','text/csv;charset=utf-8');
$('clearFilters').onclick=()=>{$('search').value='';$('gradeFilter').value='';$('changedOnly').checked=false;$('nearOnly').checked=false;page=0;render();};
$('report').onclick=()=>{
  render();if($('report').disabled)return;
    const html=R.gradingReport({rows:rowsForCourse(),baseline:baselineRanges(),draft:ranges,instructor:$('instructor').value,course:$('course').value,baselineName:baselineName(),notes:$('decisionNotes').value,source:`${$('workspaceSelect').selectedOptions[0].textContent} · ${filename}`,created:new Date().toLocaleString()});
  download(html,'grading-decision-report.html','text/html;charset=utf-8');$('exportStatus').textContent='Grading report prepared with the full course, comparison and decision notes. Open it in your browser; Print can save a PDF.';
};
buildBands();render();updateTimer();setInterval(updateTimer,1000);
