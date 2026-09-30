# GradeFrame — Workspace Experiment

A browser-based grading prototype for institute and term workspaces, maintained separately from the original GradeFrame project.

## Workflow

**Import marks → Student results → Analysis → Review & export**

- Separate institute workspaces, courses, student lists, grading scenarios, notes, and undo history.
- Validated Excel imports and synthetic sample data.
- Excel results with column filters, CSV results, and printable HTML grading reports.
- Optional guided introduction, responsive screens, keyboard controls, and reduced-motion support.

## Run

Open `index.html` in a browser, or run `python -m http.server 8765 --bind 127.0.0.1` from this folder and open `http://127.0.0.1:8765`. No build step or account is required.

## Input and privacy

Import `.xlsx` or `.xls`; only the first worksheet is read. Use exactly `BITS ID`, `Course`, and `Total Marks` columns in any order. Keep IDs as text, use whole marks from 0 to 100, and exclude NC students. The limits are 5 MB and 10,000 records. Formula cells and duplicate IDs within a course are rejected.

All student data stays in page memory and clears on refresh or close. The active app sends no marks to a server and uses no browser storage. A valid replacement resets only the selected institute; an invalid replacement keeps its previous data.

## Downloads

Excel includes all selected-course results, column filters, readable widths, preserved text IDs, comparison grades, and grading details. Results are saved values and do not recalculate after editing. CSV has no spreadsheet formatting or filters. HTML reports can be printed to PDF from a browser.

## Tests

Run `node --test tests/core.test.cjs tests/reports.test.cjs`. Serve the folder and open the three HTML test harnesses in `tests/` for browser verification with synthetic records.

The latest workspace/download suite passed 40 checks. The preceding flow revision passed 50 grading browser checks; 15 unchanged core/report tests also passed. Export contents were inspected; native Excel rendering and operating-system download saving have not been verified.

See [experiment notes](WORKSPACE-EXPERIMENT.md). Earlier documents and screenshots in `docs/` are historical references for the original challenge project.

## AI assistance

ChatGPT/Codex assisted with debugging, implementation, interface design, testing, and documentation.

## Status

Experimental BITS Digital CodeForge prototype; not an official BITS grading tool. Deployment is pending. No shared accounts or cloud persistence. The vendored SheetJS license is included in `vendor/`.
