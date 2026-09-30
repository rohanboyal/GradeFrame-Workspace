# Requirements audit - 30 September 2026

Reviewed all 12 pages of the supplied BITS Digital CodeForge V1.0 PDF and the submission form screenshots before deployment.

| Requirement | GradeFrame evidence | Result |
| --- | --- | --- |
| Excel import with BITS ID, Course, Total Marks | First-sheet .xlsx import; exact headers, integer 0-100 validation; NC exclusion guidance | Matches |
| Course selection and marks analytics | Unique course list, student count, mean, median, min/max, deviation and distribution | Matches |
| Eight specified default bands | A 80-100; A- 70-79; B 60-69; B- 50-59; C 40-49; C- 30-39; D 20-29; E 0-19 | Matches |
| Editable, valid boundaries and CSV export | Complete 0-100 coverage, no gaps/overlap, full-course CSV | Matches |
| Diagnose and document original bugs | Eight defects, six required columns in CodeForge-Bug-Fix-Log.pdf; original reproduction harness retained | Matches |
| At least three useful enhancements | Institute workspaces and guided flow; grading scenario comparison; explanatory multi-format exports | Matches |
| Preserve core grading functions | 15 Node tests, 23 fixed browser checks, 27 advanced checks and 40 workspace checks passed on 30 September | Matches tested cases |
| Public usable URL | GitHub Pages deployment authorised; public verification pending | In progress |
| Accessible GitHub repository | rohanboyal/GradeFrame-Workspace is public | Complete |
| AI disclosure | Concise ChatGPT/Codex statement in README and submission draft | Prepared |
| Participant understanding, learning and declaration | Demo guide and evidence available; participant review and personal answers pending | Participant action |

## Product scope

The PDF permits redesign and names GitHub Pages as a deployment option. It does not require a single HTML file. Workspace state is temporary, isolated by institute and term, and clears on refresh/close. There are no accounts or cloud student records. This remains a challenge prototype, not an official BITS grading tool.

Animations and colours are supporting polish, not counted as substantive enhancements. The selected three enhancements address course organisation, understanding boundary changes and reviewing/exporting results. Extra format support, limits and safeguards are documented choices, not claimed PDF requirements.

## Release verification

Final public import, export and mobile checks will be recorded in release-verification.md. Spreadsheet content and native filter metadata are covered by serialization/reopen tests; native Microsoft Excel visual rendering is a separate check and is not yet verified.
