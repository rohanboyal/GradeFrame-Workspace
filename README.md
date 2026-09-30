# GradeFrame

A grading workspace for organising courses, reviewing student marks, comparing grade boundaries, and exporting clear results. Built for BITS Digital CodeForge V1.0.

## Workflow

**Import marks → Student results → Analysis → Review & export**

- Separate institute workspaces, courses, student lists, grading scenarios, notes, and undo history.
- Validated Excel imports and synthetic sample data.
- Excel results with column filters, CSV results, and printable HTML grading reports.
- Automatic first-visit introduction with Skip and Quick guide replay, responsive screens, keyboard controls, and reduced-motion support.

## Run

Open `index.html` in a browser, or run `python -m http.server 8765 --bind 127.0.0.1` from this folder and open `http://127.0.0.1:8765`. No build step or account is required.

## Input and privacy

Import `.xlsx` or `.xls`; only the first worksheet is read. Use exactly `BITS ID`, `Course`, and `Total Marks` columns in any order. Keep IDs as text, use whole marks from 0 to 100, and exclude NC students. The limits are 5 MB and 10,000 records. Formula cells and duplicate IDs within a course are rejected.

All student data stays in page memory and clears on refresh or close. The app sends no marks to a server. A browser preference remembers only whether you dismissed the introduction; student data is never stored in browser storage. A valid replacement resets only the selected institute; an invalid replacement keeps its previous data.

## Downloads

Excel includes all selected-course results, column filters, readable widths, preserved text IDs, comparison grades, and grading details. Results are saved values and do not recalculate after editing. CSV has no spreadsheet formatting or filters. HTML reports can be printed to PDF from a browser.

## Tests

Run `node --test tests/core.test.cjs tests/reports.test.cjs tests/guide.test.cjs`. Serve the folder and open the three HTML test harnesses in `tests/` for browser verification with synthetic records.

The latest workspace/download suite passed 40 checks. The release passed 50 grading browser checks and 15 core/report tests. The 40 workspace checks also passed on the public deployment before the first-visit guide update. Export contents were inspected; native Excel rendering and operating-system download saving have not been verified.

See the [workflow notes](WORKSPACE-EXPERIMENT.md), [requirements audit](docs/requirements-audit.md), and [bug fix log](docs/CodeForge-Bug-Fix-Log.pdf).

## AI assistance

ChatGPT/Codex assisted with debugging, implementation, interface design, testing, and documentation.

## Status

BITS Digital CodeForge challenge prototype; not an official BITS grading tool. [Open GradeFrame](https://rohanboyal.github.io/GradeFrame-Workspace/). No shared accounts or cloud persistence. The vendored SheetJS license is included in `vendor/`.
