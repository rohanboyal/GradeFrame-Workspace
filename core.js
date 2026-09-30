(function (root) {
  'use strict';
  const GRADES = ['A', 'A-', 'B', 'B-', 'C', 'C-', 'D', 'E'];
  const DEFAULTS = [[80,100],[70,79],[60,69],[50,59],[40,49],[30,39],[20,29],[0,19]];
  const defaults = () => DEFAULTS.map(pair => [...pair]);

  function validateRanges(ranges) {
    if (!Array.isArray(ranges) || ranges.length !== GRADES.length) return 'All eight grade bands are required.';
    for (let i = 0; i < ranges.length; i++) {
      const [min, max] = ranges[i];
      if (![min,max].every(Number.isInteger) || min < 0 || max > 100 || min > max) return `${GRADES[i]} needs whole-number limits between 0 and 100, with minimum no greater than maximum.`;
      if (i && max !== ranges[i-1][0] - 1) return `${GRADES[i-1]} and ${GRADES[i]} must meet without a gap or overlap.`;
    }
    if (ranges[0][1] !== 100 || ranges[7][0] !== 0) return 'Grade bands must cover every mark from 0 to 100.';
    return '';
  }

  function gradeFor(mark, ranges) {
    const i = ranges.findIndex(([min,max]) => mark >= min && mark <= max);
    return i < 0 ? null : GRADES[i];
  }

  function statistics(rows) {
    const marks = rows.map(row => row.mark).sort((a,b) => a-b);
    if (!marks.length) return {count:0,min:null,max:null,mean:null,median:null,std:null};
    const mean = marks.reduce((a,b) => a+b,0)/marks.length;
    const mid = Math.floor(marks.length/2);
    return {count:marks.length,min:marks[0],max:marks.at(-1),mean,
      median:marks.length%2 ? marks[mid] : (marks[mid-1]+marks[mid])/2,
      std:Math.sqrt(marks.reduce((sum,mark) => sum+(mark-mean)**2,0)/marks.length)};
  }

  function validateRows(matrix) {
    const errors = [], rows = [], seen = new Set();
    const required = ['BITS ID','Course','Total Marks'];
    const headers = (matrix[0] || []).map(value => String(value ?? '').trim());
    if (headers.length !== 3 || !required.every(key => headers.includes(key))) return {rows,errors:['Use exactly these three headers: BITS ID, Course, Total Marks.']};
    const columns = required.map(key => headers.indexOf(key));
    for (let i = 1; i < matrix.length; i++) {
      const cells = matrix[i];
      if (cells.every(cell => cell == null || String(cell).trim() === '')) continue;
      const [idValue,courseValue,markValue] = columns.map(index => cells[index]);
      const id = String(idValue ?? '').trim(), course = String(courseValue ?? '').trim();
      const mark = typeof markValue === 'number' ? markValue : typeof markValue === 'string' && /^\d+$/.test(markValue.trim()) ? Number(markValue.trim()) : NaN;
      const reasons = [];
      if (!id) reasons.push('BITS ID is missing');
      if (!course) reasons.push('course is missing');
      if (!Number.isInteger(mark) || mark < 0 || mark > 100) reasons.push('marks must be a whole number from 0 to 100');
      if (cells.slice(3).some(value => value != null && String(value).trim())) reasons.push('extra columns are not supported');
      const key = JSON.stringify([id,course]);
      if (id && course && seen.has(key)) reasons.push('duplicate BITS ID within this course');
      seen.add(key);
      if (reasons.length) errors.push(`Row ${i+1}: ${reasons.join('; ')}.`);
      else rows.push({id,course,mark});
    }
    if (!rows.length && !errors.length) errors.push('The worksheet contains no student records.');
    return {rows,errors};
  }

  function csvCell(value) {
    let text = String(value ?? '');
    // Prevent text fields from becoming formulas when a CSV is opened in a spreadsheet.
    if (/^[\s\u0000-\u001f]*[=+@-]/.test(text)) text = "'" + text;
    return '"' + text.replaceAll('"','""') + '"';
  }

  function exportCSV(rows, ranges, instructor) {
    const error = validateRanges(ranges);
    if (error) throw new Error(error);
    if (!instructor.trim() || !rows.length) throw new Error('An instructor and student records are required.');
    const lines = [['BITS ID','Course','Total Marks','Grade','Instructor']];
    rows.forEach(row => {
      if (!Number.isInteger(row.mark) || row.mark < 0 || row.mark > 100) throw new Error('Invalid student mark.');
      const grade = gradeFor(row.mark,ranges);
      if (!grade) throw new Error('Every student must have a grade.');
      lines.push([row.id,row.course,row.mark,grade,instructor.trim()]);
    });
    return '\uFEFF' + lines.map(row => row.map(csvCell).join(',')).join('\r\n') + '\r\n';
  }
  const api = {GRADES,defaults,validateRanges,gradeFor,statistics,validateRows,csvCell,exportCSV};
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.Grading = api;
})(typeof window !== 'undefined' ? window : globalThis);
