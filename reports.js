(function (root) {
  'use strict';
  const G = typeof module !== 'undefined' && module.exports ? require('./core.js') : root.Grading;
  const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));

  function compare(rows, baseline, draft) {
    if (G.validateRanges(baseline) || G.validateRanges(draft)) throw new Error('Both scenarios need valid grade ranges.');
    const bands = G.GRADES.map((grade,i) => ({grade,baseline:0,current:0,range:[...draft[i]]}));
    const students = rows.map(row => {
      const before=G.gradeFor(row.mark,baseline),after=G.gradeFor(row.mark,draft);
      bands[G.GRADES.indexOf(before)].baseline++;
      bands[G.GRADES.indexOf(after)].current++;
      return {...row,before,after,direction:Math.sign(G.GRADES.indexOf(before)-G.GRADES.indexOf(after))};
    });
    return {bands,students,higher:students.filter(row=>row.direction>0).length,lower:students.filter(row=>row.direction<0).length,unchanged:students.filter(row=>row.direction===0).length};
  }

  function nearestBoundary(mark, ranges, tolerance=2) {
    if (G.validateRanges(ranges)) return null;
    const candidates=ranges.slice(0,-1).map(([cutoff],i)=>({grade:G.GRADES[i],cutoff,distance:Math.abs(mark-cutoff)})).sort((a,b)=>a.distance-b.distance||b.cutoff-a.cutoff);
    return candidates[0].distance<=tolerance?candidates[0]:null;
  }

  function issuesFor(matrix, messages) {
    return messages.map(reason=>{
      const match=reason.match(/^Row (\d+):/),row=match?Number(match[1]):null;
      const cells=row?matrix[row-1]||[]:[];
      return {row:row||'Workbook',values:cells.map(value=>String(value??'')).join(' | '),reason};
    });
  }

  function issueCSV(issues) {
    return '\uFEFF'+[['Spreadsheet row','Original values','Issue'],...issues.map(issue=>[issue.row,issue.values,issue.reason])].map(row=>row.map(G.csvCell).join(',')).join('\r\n')+'\r\n';
  }

  function gradingReport({rows,baseline,draft,instructor,course,baselineName,notes,source,created}) {
    if(!rows.length||!instructor.trim()) throw new Error('An instructor and student records are required.');
    const result=compare(rows,baseline,draft),stats=G.statistics(rows);
    const cell=value=>`<td>${escape(value)}</td>`;
    const bandRows=result.bands.map((band,i)=>`<tr>${[band.grade,baseline[i].join('–'),draft[i].join('–'),band.baseline,band.current,band.current-band.baseline].map(cell).join('')}</tr>`).join('');
    const studentRows=result.students.map(row=>`<tr>${[row.id,row.mark,row.before,row.after,row.direction>0?'Higher':row.direction<0?'Lower':'Unchanged'].map(cell).join('')}</tr>`).join('');
    return `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escape(course)} · Grading report</title><style>body{font:14px/1.6 system-ui,sans-serif;color:#173c40;max-width:1050px;margin:auto;padding:40px}h1{font-size:32px;line-height:1.2}h2{margin-top:32px}p{white-space:pre-wrap}small{color:#49676a}.banner{background:#123d40;color:white;padding:24px;border-radius:12px}.metrics{display:flex;flex-wrap:wrap;gap:24px;margin:24px 0}.metrics strong{display:block;font-size:24px}table{width:100%;border-collapse:collapse;margin:16px 0}th,td{text-align:left;padding:9px;border-bottom:1px solid #dce5e4;overflow-wrap:anywhere}th{background:#edf5f2}thead{display:table-header-group}.table-wrap{overflow:auto}footer{margin-top:32px;color:#49676a;font-size:12px}@media print{body{padding:0;font-size:10px}tr{break-inside:avoid}h2{break-after:avoid}.table-wrap{overflow:visible}.banner{color:#123d40;background:white;border:1px solid #cddbd8}thead{display:table-header-group}@page{size:A4;margin:15mm}}</style>
    <header class="banner"><small style="color:inherit">GRADEFRAME / GRADING DECISION RECORD</small><h1>${escape(course)}</h1><p>Instructor: ${escape(instructor)}<br>Source: ${escape(source)}<br>Generated: ${escape(created)}</p></header>
    <div class="metrics"><div><strong>${rows.length}</strong>students</div><div><strong>${stats.mean.toFixed(2)}</strong>average mark</div><div><strong>${result.higher}</strong>higher grade</div><div><strong>${result.lower}</strong>lower grade</div><div><strong>${result.unchanged}</strong>unchanged</div></div>
    <h2>Scenario comparison</h2><p>Baseline: ${escape(baselineName)}. Compared with the current draft. Counts cover the complete selected course; preview filters are not applied.</p>
    <div class="table-wrap"><table><thead><tr><th>Grade</th><th>Baseline range</th><th>Draft range</th><th>Baseline count</th><th>Draft count</th><th>Difference</th></tr></thead><tbody>${bandRows}</tbody></table></div>
    <h2>Instructor's decision notes</h2><p>${escape(notes.trim()||'No decision notes supplied.')}</p>
    <h2>Complete student results</h2><div class="table-wrap"><table><thead><tr><th>BITS ID</th><th>Marks</th><th>Baseline grade</th><th>Draft grade</th><th>Movement</th></tr></thead><tbody>${studentRows}</tbody></table></div>
    <footer>Challenge prototype; not an official BITS grading tool. Grade boundaries are selected by the instructor. This report contains student results; share only with intended recipients. Use your browser's Print command to save a PDF.</footer></html>`;
  }
  const api={compare,nearestBoundary,issuesFor,issueCSV,gradingReport};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.GradingReports=api;
})(typeof window!=='undefined'?window:globalThis);
