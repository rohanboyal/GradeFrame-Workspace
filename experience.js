(() => {
  const steps=[
    {title:'A home for every class.',text:'An institute workspace holds your courses and grading decisions. Start with the default workspace. Add another institute or term only when you need it.',visual:'<div class="tour-institute"><span>YOUR INSTITUTE</span><strong>One workspace.</strong><div><i>Computing</i><i>Mathematics</i></div></div>'},
    {title:'Your workbook becomes your courses.',text:'Import an Excel file with BITS ID, Course, and Total Marks. GradeFrame checks the first worksheet and groups valid records into course cards. Try sample data to explore first.',visual:'<div class="tour-file"><span>XLSX</span><div><b>BITS ID</b><b>Course</b><b>Marks</b></div><div><i>DEMO001</i><i>Computing</i><i>82</i></div></div>'},
    {title:'Understand the impact.',text:'Open a course to review its students. In Analysis, adjust grade boundaries, save a scenario, and see exactly how many grades change before deciding.',visual:'<div class="tour-impact"><span>EXPLORE A SCENARIO</span><div><strong>80</strong><i>→</i><strong>85</strong></div><p>Change a boundary. Review the effect.</p></div>'},
    {title:'Make the decision reviewable.',text:'Add your instructor name and decision notes, then review and export the full course. Everything is temporary: refreshing or closing this page clears all workspaces.',visual:'<div class="tour-record"><span>DECISION RECORD</span><strong>✓ Reviewed with care</strong><p>Course · Boundaries · Reasoning</p><div>CSV results &nbsp; / &nbsp; Grading report</div></div>'}
  ];
  let step=0;
  const dialog=$('workspaceTour');
  const mobileHelp=el('button','Quick guide','text-button mobile-guide');mobileHelp.id='mobileTour';document.querySelector('.topbar').append(mobileHelp);
  function show(){
    const content=steps[step];$('tourTitle').textContent=content.title;$('tourDescription').textContent=content.text;
    $('tourVisual').innerHTML=content.visual;
    $('tourProgress').textContent=`STEP ${step+1} OF ${steps.length}`;
    $('tourDots').replaceChildren(...steps.map((_,i)=>{const dot=el('i');dot.className=i===step?'active':'';return dot;}));
    $('tourBack').disabled=step===0;$('tourNext').textContent=step===steps.length-1?'Start exploring →':'Next →';
  }
  function close(){dialog.close();$('firstSteps').hidden=true;}
  function open(){step=0;show();dialog.showModal();}
  $('startTour').onclick=open;$('openTour').onclick=open;mobileHelp.onclick=open;$('dismissSteps').onclick=()=>$('firstSteps').hidden=true;
  $('skipTour').onclick=close;dialog.addEventListener('cancel',()=>{$('firstSteps').hidden=true;});
  $('tourNext').onclick=()=>{if(step===steps.length-1)close();else{step++;show();}};
  $('tourBack').onclick=()=>{if(step>0){step--;show();}};
})();
