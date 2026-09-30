(() => {
  'use strict';
  const key = 'gradeframe-guide-v1';
  const dialog = document.getElementById('welcomeGuide');
  const get = id => document.getElementById(id);
  const cards = [
    ['Start with your marks', 'Upload an Excel workbook, or choose Try sample data to explore with fictional students. Select the course you want to review.', 'Three columns: BITS ID · Course · Total Marks. Use whole marks from 0 to 100 and exclude NC students.'],
    ['Understand the class', 'Read the class statistics and marks distribution. Adjust a grade minimum to explore a different boundary; its neighbouring maximum follows automatically.', 'Every mark needs exactly one grade. If a boundary is invalid, the app explains the problem and pauses export.'],
    ['Compare before deciding', 'Save the current boundaries as a named snapshot, then adjust your draft. Compare the grade counts and show affected students. Near a boundary helps you inspect cutoff cases.', 'Example: changing A from 80 to 85 moves students with marks 80–84 from A to A-, if the other boundaries stay at their defaults.'],
    ['Review and keep a record', 'Enter your instructor name, review the student results and add optional decision notes. Review & export downloads grades as CSV; the grading report includes the comparison and notes.', 'Exports include every student in the selected course, even when the table is filtered. You can reopen this walkthrough from Quick guide.']
  ];
  const visuals = [
    '<div class="mini-file"><span class="mini-tag">YOUR STARTING POINT</span><strong>marks.xlsx <b>↗</b></strong><div class="mini-grid"><span>BITS ID</span><span>Course</span><span>Marks</span><b>DEMO001</b><b>Course A</b><b>82</b><b>DEMO002</b><b>Course A</b><b>71</b></div><div class="mini-label">Excel in. A clearer picture out.</div></div>',
    '<div class="mini-chart"><span class="mini-tag">SEE THE WHOLE CLASS</span><div class="mini-bars"><i style="--h:28%"></i><i style="--h:42%"></i><i style="--h:65%"></i><i style="--h:94%"></i><i style="--h:80%"></i><i style="--h:52%"></i><i style="--h:35%"></i></div><div class="mini-label">Marks distribution · illustrative preview</div></div>',
    '<div class="mini-compare"><span class="mini-tag">EXPLORE THE WHAT-IF</span><div class="mini-pair"><div><small>BASELINE</small><strong>80</strong><span>A starts here</span></div><b>→</b><div><small>YOUR DRAFT</small><strong>85</strong><span>A starts here</span></div></div><div class="mini-label">See who changes before you decide.</div></div>',
    '<div class="mini-file"><span class="mini-tag">A DECISION YOU CAN EXPLAIN</span><strong><span class="mini-check">✓</span> Ready for review</strong><div class="mini-checklist"><span>✓ Complete course results</span><span>✓ Grade boundaries</span><span>✓ Your decision notes</span></div><div class="mini-label">Grades.csv + decision report</div></div>'
  ];
  let step = 0;
  function renderCard() {
    get('guideVisual').innerHTML = visuals[step];
    document.querySelectorAll('.guide-steps i').forEach((item,i)=>item.classList.toggle('complete',i<=step));
    get('guideProgress').textContent = `Step ${step + 1} of ${cards.length}`;
    ['guideTitle','guideDescription','guideExample'].forEach((id, i) => get(id).textContent = cards[step][i]);
    get('guideBack').disabled = step === 0;
    get('guideNext').textContent = step === cards.length - 1 ? 'Start using GradeFrame →' : 'Next step →';
    if (dialog.open && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
      [get('guideCard'),get('guideVisual')].forEach(element=>{
        element.getAnimations().forEach(animation=>animation.cancel());
        element.animate([{opacity:0,transform:'translateY(9px)'},{opacity:1,transform:'translateY(0)'}],{duration:260,easing:'ease-out'});
      });
    }
  }
  function open() { step = 0; renderCard(); dialog.showModal(); }
  function dismiss() {
    try { localStorage.setItem(key, 'dismissed'); } catch { /* Storage may be unavailable in private browsing. */ }
    dialog.close();
    get('openGuide').focus();
  }
  get('openGuide').addEventListener('click', open);
  get('skipGuide').addEventListener('click', dismiss);
  get('guideBack').addEventListener('click', () => { if (step > 0) { step--; renderCard(); } });
  get('guideNext').addEventListener('click', () => {
    if (step === cards.length - 1) dismiss();
    else { step++; renderCard(); }
  });
  dialog.addEventListener('cancel', event => { event.preventDefault(); dismiss(); });
  let seen = false;
  try { seen = localStorage.getItem(key) === 'dismissed'; } catch {}
  if (!seen) open();
})();
