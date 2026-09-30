(() => {
  'use strict';
  const workspaces = new Map();
  let activeId = 'workspace-1', sequence = 1, view = 'workspace', editing = false;
  function emptyState() {
    return {data:[],ranges:G.defaults(),courseRanges:new Map(),history:new Map(),snapshots:new Map(),selectedBaselines:new Map(),decisionNotes:new Map(),snapshotId:0,page:0,started:null,filename:'',course:'',instructor:'',search:'',grade:'',sort:'id',changed:false,near:false,tolerance:'2',uploadStatus:'',exportStatus:'',scenarioStatus:'',uploadIssues:[],errorNodes:[],scenarioName:''};
  }
  workspaces.set(activeId,{name:'My institute',term:'Current term',state:emptyState()});
  function capture() {
    workspaces.get(activeId).state={data,ranges,courseRanges,history,snapshots,selectedBaselines,decisionNotes,snapshotId,page,started,filename,
      course:$('course').value,instructor:$('instructor').value,search:$('search').value,grade:$('gradeFilter').value,sort:$('sort').value,changed:$('changedOnly').checked,near:$('nearOnly').checked,tolerance:$('tolerance').value,
      uploadStatus:busy?'Import cancelled when you switched workspaces.':$('uploadStatus').textContent,exportStatus:$('exportStatus').textContent,scenarioStatus:$('scenarioStatus').textContent,uploadIssues,errorNodes:[...$('uploadErrors').childNodes].map(node=>node.cloneNode(true)),scenarioName:$('scenarioName').value};
  }
  function restore(state) {
    uploadRevision++;busy=false;
    ({data,ranges,courseRanges,history,snapshots,selectedBaselines,decisionNotes,snapshotId,page,started,filename,uploadIssues}=state);
    $('course').replaceChildren();
    const courses=[...new Set(data.map(row=>row.course))].sort();
    if(!courses.length)$('course').add(new Option('Import a workbook in this workspace',''));
    courses.forEach(course=>$('course').add(new Option(course,course)));
    $('course').value=state.course||courses[0]||'';
    $('instructor').value=state.instructor;$('search').value=state.search;$('gradeFilter').value=state.grade;$('sort').value=state.sort;
    $('changedOnly').checked=state.changed;$('nearOnly').checked=state.near;$('tolerance').value=state.tolerance;
    $('decisionNotes').value=decisionNotes.get($('course').value)||'';$('scenarioName').value=state.scenarioName;$('file').value='';
    $('uploadStatus').textContent=state.uploadStatus;$('exportStatus').textContent=state.exportStatus;$('scenarioStatus').textContent=state.scenarioStatus;
    $('dataBadge').textContent=data.length?`${data.length} records verified`:'No workbook loaded';
    $('uploadErrors').replaceChildren(...state.errorNodes.map(node=>node.cloneNode(true)));$('uploadErrors').hidden=!uploadIssues.length;$('downloadIssues').hidden=!uploadIssues.length;syncScenarios();buildBands();render();updateTimer();
  }
  function setView(next, focusHeading = true) {
    $('flowStatus').textContent='';
    if(['students','analysis','decision'].includes(next)&&!rowsForCourse().length)next='import';
    if(next==='decision'&&G.validateRanges(ranges)){next='analysis';$('flowStatus').textContent='Review the highlighted grade boundaries before continuing to export.';}
    view=next;document.body.dataset.view=view;
    $('workspaceHub').hidden=view!=='workspace';$('courseStudio').hidden=!['students','analysis','decision'].includes(view);$('importView').hidden=view!=='import';
    const hints={students:['Review the student list, then explore how boundaries affect grades.','Explore analysis →','analysis'],analysis:['Compare your scenarios before preparing the final results.','Review & export →','decision'],decision:['Your export includes the complete selected course, regardless of filters.','Back to students →','students']};
    const hint=hints[view];
    if(hint){$('courseStepHint').textContent=hint[0];$('courseNext').textContent=hint[1];$('courseNext').onclick=()=>setView(hint[2]);}
    document.querySelectorAll('[data-view]').forEach(button=>button.setAttribute('aria-current',button.dataset.view===view?'page':'false'));
    document.querySelectorAll('#railCourses button').forEach(button=>button.setAttribute('aria-current',!$('courseStudio').hidden&&button.dataset.course===$('course').value?'page':'false'));
    const target=view==='workspace'?$('instituteTitle'):view==='import'?$('setupTitle'):$('courseTitle');
    if(focusHeading){target.setAttribute('tabindex','-1');target.focus({preventScroll:true});}window.scrollTo({top:0,behavior:'instant'});
  }
  function switchWorkspace(id) {
    if(!workspaces.has(id)||id===activeId)return;
    capture();activeId=id;restore(workspaces.get(id).state);setView('workspace');
  }
  function openCourse(course) {
    $('course').value=course;$('course').dispatchEvent(new Event('change'));setView('students');
    $('courseTitle').setAttribute('tabindex','-1');$('courseTitle').focus();
  }
  function renderHub() {
    const active=workspaces.get(activeId);
    $('instituteTitle').textContent=active.name;$('instituteTerm').textContent=active.term||'No term specified';
    $('workspaceSelect').replaceChildren();
    workspaces.forEach((workspace,id)=>$('workspaceSelect').add(new Option(`${workspace.name}${workspace.term?' · '+workspace.term:''}`,id)));
    $('workspaceSelect').value=activeId;
    $('courseInstitute').textContent=active.name+(active.term?' / '+active.term:'');
    const courses=[...new Set(data.map(row=>row.course))].sort();
    $('instituteStudents').textContent=new Set(data.map(row=>row.id)).size;
    $('instituteCourses').textContent=courses.length;$('instituteRecords').textContent=data.length;
    $('workspaceSource').textContent=filename||'No workbook imported';$('courseCards').replaceChildren();
    $('hubDemo').disabled=busy;$('importContinue').disabled=!data.length||busy;
    $('hubDemo').textContent=busy?'Checking workbook…':data.length?'View your courses ↓':'Explore sample data →';
    const courseKey=JSON.stringify([activeId,courses]);
    if($('railCourses').dataset.key!==courseKey){
      $('railCourses').dataset.key=courseKey;$('railCourses').replaceChildren();
      if(!courses.length)$('railCourses').append(el('p','Import a workbook to add your courses.'));
      courses.forEach(course=>{const button=el('button',course);button.dataset.course=course;button.onclick=()=>openCourse(course);$('railCourses').append(button);});
    }
    document.querySelectorAll('#railCourses button').forEach(button=>button.setAttribute('aria-current',!$('courseStudio').hidden&&button.dataset.course===$('course').value?'page':'false'));
    if(!courses.length) {
      const empty=el('div',null,'workspace-empty');empty.append(el('span','+','empty-symbol'),el('h3','A fresh start for your next class.'),el('p','Import your workbook above, or explore the sample to see two courses come to life.'));$('courseCards').append(empty);
    }
    courses.forEach(course=>{
      const rows=data.filter(row=>row.course===course),stats=G.statistics(rows),card=el('article',null,'course-card');
      card.append(el('span','COURSE','eyebrow'),el('h3',course));
      const metrics=el('div',null,'course-metrics');metrics.append(el('span',`${rows.length} students`),el('span',`Average ${stats.mean.toFixed(1)} / 100`));card.append(metrics);
      const band=course===$('course').value?ranges:courseRanges.get(course)||G.defaults();
      const spark=el('div',null,'course-spark');spark.setAttribute('aria-label','Marks distribution in ten-point groups');
      const bins=Array(10).fill(0);rows.forEach(row=>bins[Math.min(9,Math.floor(row.mark/10))]++);
      bins.forEach((count,i)=>{const bar=el('i');bar.style.setProperty('--bar',`${Math.max(3,count/Math.max(...bins)*100)}%`);bar.title=`${i*10}–${i===9?100:i*10+9}: ${count} students`;spark.append(bar);});card.append(spark);
      card.append(el('p',G.validateRanges(band)?'Grade boundaries need review':'All marks covered by grade ranges','course-health'));
      const button=el('button','Open student list →','secondary');button.onclick=()=>openCourse(course);card.append(button);$('courseCards').append(card);
    });
  }
  document.querySelectorAll('[data-view]').forEach(button=>button.addEventListener('click',()=>setView(button.dataset.view)));
  $('workspaceSelect').onchange=()=>switchWorkspace($('workspaceSelect').value);
  $('hubImport').onclick=()=>{setView('import');$('file').focus();};
  $('hubDemo').onclick=()=>{if(data.length)$('courseCards').scrollIntoView({block:'start'});else $('demo').click();};
  function openEditor(edit) {
    editing=edit;const active=workspaces.get(activeId);
    $('workspaceDialogTitle').textContent=edit?'Edit workspace':'Create a workspace';
    $('workspaceName').value=edit?active.name:'';$('workspaceTerm').value=edit?active.term:'';$('workspaceError').textContent='';
    $('workspaceDialog').showModal();$('workspaceName').focus();
  }
  $('newWorkspace').onclick=()=>openEditor(false);$('editWorkspace').onclick=()=>openEditor(true);
  $('cancelWorkspace').onclick=()=>$('workspaceDialog').close();
  $('workspaceForm').onsubmit=event=>{
    event.preventDefault();const name=$('workspaceName').value.trim(),term=$('workspaceTerm').value.trim();
    if(!name){$('workspaceError').textContent='Enter an institute name.';return;}
    if([...workspaces].some(([id,w])=>(!editing||id!==activeId)&&w.name.toLowerCase()===name.toLowerCase()&&w.term.toLowerCase()===term.toLowerCase())){
      $('workspaceError').textContent='That institute and term already have a workspace.';return;
    }
    if(editing){Object.assign(workspaces.get(activeId),{name,term});renderHub();}
    else {capture();activeId=`workspace-${++sequence}`;workspaces.set(activeId,{name,term,state:emptyState()});restore(workspaces.get(activeId).state);setView('workspace');}
    $('workspaceDialog').close();$('workspaceSelect').focus();
  };
  document.addEventListener('gradeframe:render',renderHub);
  document.addEventListener('gradeframe:import-finished',event=>{
    if(event.detail.success){setView('students');$('flowStatus').textContent=`${data.length} records imported. Step 1: review ${$('course').value}. Use the course selector to review another class.`;}
    else {setView('import');$('flowStatus').textContent='The workbook needs attention. Fix the listed issues and import again.';}
  });
  $('course').addEventListener('change',()=>{$('flowStatus').textContent='Step 1: review the students in this course, then continue to analysis.';setView('students');});
  $('changedOnly').addEventListener('change',()=>{if($('changedOnly').checked){setView('students');$('flowStatus').textContent='Showing students affected by your current boundary changes. Continue to Analysis when you finish reviewing.';}});
  renderHub();setView('workspace', false);
})();
