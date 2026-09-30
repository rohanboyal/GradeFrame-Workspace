# GradeFrame workspace guide

GradeFrame organises course grading into institute and term workspaces.

## Workflow

1. Edit the initial workspace's institute name and term, or create another workspace.
2. Select Import marks and upload the existing three-column Excel format, or try synthetic sample data. Successful imports automatically open the first course's student list. Failed imports remain on the import screen with their errors.
3. The overview counts unique student IDs, courses, and student-course records separately.
4. Open a course card to review its student list. Follow Students → Analysis → Review & export. Importing has its own screen, and the sidebar lists available courses.
5. Switch institutes using the top selector. Marks, instructor, boundaries, undo history, snapshots, notes, filters, and upload errors stay with their institute.

All data is held in page memory. Refreshing or closing the page clears every workspace. There are no accounts, shared users, cloud storage, localStorage, or sessionStorage writes in the active app. This is a local prototype of the workspace workflow.

A successful replacement workbook resets the selected institute's grading decisions. An invalid upload keeps its last valid data. Switching institutes cancels an unfinished import. Reports include institute context; export filenames include the institute and term.

## Run locally

Serve this directory with a static server, or use the existing preview:
http://127.0.0.1:8765/experiments/GradeFrame/index.html

## Verification — 30 September 2026

- 15 Node core and report tests passed.
- 23 existing browser bug-fix checks passed.
- 27 existing advanced browser checks passed, including 10,000 records.
- 40 workspace, download, and navigation checks passed: isolation with identical course names, state restoration, replacement, invalid imports, CSV and HTML contents, pending import cancellation, duplicate workspace names, reset on refresh, separate import view, guided tour navigation, course review flow, automatic redirects, and Excel serialization.
- Desktop overview and mobile views inspected. No document overflow at 390px and 320px viewport widths; student tables scroll within their container. Workspace form creation was exercised at 320px.

Browser harnesses capture generated export blobs to check their contents. These results do not verify that the browser saved the files to the operating system's Downloads directory.

Tests are in `tests/workspace-checks.html`, `tests/fixed-checks.html`, and `tests/advanced-checks.html`. Results are in `docs/workspace-tests.txt` and `docs/workspace-regressions.txt`.

The inherited challenge documents describe the primary submission. GitHub repository: https://github.com/rohanboyal/GradeFrame-Workspace. Deployment verification is pending.

## Experience refinements

The overview now has a forest-green illustrated introduction, a direct sample-data action, course distribution previews, and course navigation in the sidebar. Students, Analysis, and Review & export each have a focused screen with a next-step action. The four-card walkthrough supports next, back, skip, and reopening from Quick guide. Its dismissal lasts for the page session; no browser storage is written.

Animations cover the introductory bars, course hover states, and walkthrough transitions. Reduced-motion preferences disable these effects. The revised overview, review screen, and guide were inspected at narrow widths down to 320px without document overflow. The latest 40 workspace/download checks pass alongside the 50 browser regressions passed for the flow revision and 15 unchanged core/report tests.

Navigation follows Import → Students → Analysis → Review & export. Changing courses returns to Students. Invalid boundaries redirect export navigation to Analysis. Selecting affected students opens the filtered student list. View changes focus the destination heading and reset page scroll.

## Download formats

Review results before choosing Excel (.xlsx) or CSV. The Excel workbook contains Student results with native column-header filters, readable column widths, text IDs, assigned and comparison grades, and grade changes. Grading details contains source information, instructor, course, institute, grade boundaries, counts, and notes. Results are saved values and do not recalculate after editing the exported file. CSV retains the original five-column results format without spreadsheet styling or filters. The separate HTML grading report can be opened in a browser and printed to PDF.

The Excel writer uses the app's existing vendored spreadsheet library. Tests serialize and reopen the generated workbook to verify values, filters, widths, sheets, and formula-like text safety. The format-choice dialog was inspected on desktop and at 390px. Native Excel rendering and operating-system download saving have not been verified.
