(function(root){
  'use strict';
  root.buildResultsWorkbook=function({rows,ranges,baseline,instructor,workspace,course,source,notes,baselineName}){
    const G=root.Grading,X=root.XLSX;
    G.exportCSV(rows,ranges,instructor);
    if(G.validateRanges(baseline))throw new Error('The comparison scenario has invalid boundaries.');
    const comparison=root.GradingReports.compare(rows,baseline,ranges);
    const records=[['BITS ID','Course','Total marks','Assigned grade','Comparison grade','Grade change','Instructor'],...comparison.students.map(row=>[row.id,row.course,row.mark,row.after,row.before,row.direction>0?'Higher':row.direction<0?'Lower':'Unchanged',instructor.trim()])];
    const results=X.utils.aoa_to_sheet(records);
    results['!autofilter']={ref:`A1:G${records.length}`};
    results['!cols']=[{wch:24},{wch:Math.min(52,Math.max(26,course.length+2))},{wch:16},{wch:18},{wch:20},{wch:17},{wch:Math.min(40,Math.max(24,instructor.length+2))}];
    results['!rows']=[{hpt:28}];
    rows.forEach((_,i)=>{results[`A${i+2}`].z='@';results[`C${i+2}`].z='0';});
    const stats=G.statistics(rows);
    const details=[['Grading details','Value'],['Workspace',workspace],['Course',course],['Instructor',instructor.trim()],['Source workbook',source],['Exported at',new Date().toISOString()],['Students',rows.length],['Mean mark',stats.mean],['Median mark',stats.median],['Comparison scenario',baselineName],['Review guidance','Use filter arrows on the Student results sheet. All students are included.'],['Result type','Saved values. Changing marks in this workbook does not recalculate grades.'],[],['Grade','Minimum mark','Maximum mark','Students']];
    G.GRADES.forEach((grade,i)=>details.push([grade,ranges[i][0],ranges[i][1],comparison.bands[i].current]));
    details.push([],['Decision notes']);
    const text=notes.trim()||'No decision notes provided.';
    text.split(/\r?\n/).forEach(line=>{const chunks=line.match(/.{1,90}(?:\s|$)|.{1,90}/g)||[''];chunks.forEach(chunk=>details.push(['',chunk.trim()]));});
    const info=X.utils.aoa_to_sheet(details);
    info['!cols']=[{wch:25},{wch:94},{wch:18},{wch:16}];
    info['!rows']=details.map((_,i)=>({hpt:i===0||i===13?28:22}));
    info.B8.z='0.00';info.B9.z='0.00';
    const workbook=X.utils.book_new();
    X.utils.book_append_sheet(workbook,results,'Student results');X.utils.book_append_sheet(workbook,info,'Grading details');
    workbook.Props={Title:`${course} — GradeFrame results`,Subject:workspace,Author:instructor.trim()};
    return workbook;
  };
})(window);
