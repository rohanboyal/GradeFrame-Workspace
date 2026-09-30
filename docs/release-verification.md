# Release verification - 30 September 2026

Public app: https://rohanboyal.github.io/GradeFrame-Workspace/
Repository: https://github.com/rohanboyal/GradeFrame-Workspace

## Verified
- GitHub Pages enabled from codex/workspace-experiment, root directory; HTTPS enforced.
- Public app opened successfully without an application login.
- Real file chooser imported boundaries.xlsx: four records, grades E/D/A/A for marks 0/20/80/100.
- Import redirected to Students; next actions opened Analysis and Review & export.
- Mean and median 50, minimum 0, maximum 100 were correct.
- Instructor name enabled export review, which included all four records and correct bands.
- 15 core/report tests and 90 local browser checks passed before the final guide change.
- 40 workspace checks passed again on the public deployment, including Excel serialization/reopen, filters, text IDs, CSV scope, report institute context and workspace isolation.
- Four additional guide tests passed after the first-visit update; all 19 Node tests passed together.
- The four-page bug log was rendered and visually reviewed.
- Earlier GitHub repository rohanboyal/GradeFrame was deleted after explicit confirmation. Its local backup remains in D:\Bits\outputs\codeforge.

## Final changes and limits
- Initial heading focus is disabled; focus on navigation remains. This correction was pushed after the public smoke test.
- Guide now opens automatically until completion, Skip or Escape. Only a dismissal flag is stored locally; marks remain in memory. Local tests pass; live recheck of this final update remains pending.
- Excel export action reached the prepared state, but the in-app browser did not expose a saved download. A later CSV download attempt was blocked by automatic approval review because its usage limit was reached.
- Actual file saving and native Microsoft Excel appearance must still be checked in a regular browser. Generated workbook and CSV content passed automated checks. Do not claim native Excel validation is complete.
- Public review screen was inspected at the browser's available narrow width without overflow. The attempted 390px override did not apply to that tab, so it is not claimed as a new phone-width test.
