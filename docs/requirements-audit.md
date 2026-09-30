# CodeForge requirements audit

Reviewed 29 September 2026 against the supplied BITS Digital CodeForge V1.0 PDF (12 pages), the current source and saved verification evidence.

## Conclusion

The local implementation matches the PDF's functional rules and enhancement scope. No conflicting application behavior was identified in this review. Submission is not complete: public deployment, repository publication required by the submission form, final browser download verification and the participant's review remain outstanding.

| PDF requirement | Current implementation / evidence | Status |
| --- | --- | --- |
| Challenge prototype, not an official grading tool (p. 2) | Disclaimer in the app, README and decision report | Matches |
| Upload Excel .xlsx (p. 2) | Local SheetJS parser supports .xlsx, with optional .xls compatibility | Matches |
| Exactly three input columns (pp. 2–3) | BITS ID, Course, Total Marks; order may vary; extra columns rejected | Matches |
| Whole marks from 0 to 100 (p. 3) | Integer and range validation, no silent rounding | Matches |
| Exclude NC students (p. 3) | Import guidance says to exclude NC; nonnumeric marks are rejected. An absent student falsely entered with numeric marks cannot be inferred from the three-column input | Matches input contract |
| Select course and view analytics (pp. 2–3) | Unique course selector; count, mean, median, minimum, maximum, standard deviation and distribution | Matches |
| Eight grade bands and specified defaults (p. 3) | A 80–100, A- 70–79, B 60–69, B- 50–59, C 40–49, C- 30–39, D 20–29, E 0–19 | Exact match |
| Configure and validate ranges, show distribution (p. 2) | Editable boundaries, continuity and endpoint validation, current distribution and comparison | Matches |
| Export final grades as CSV (p. 2) | Complete selected course with ID, course, mark, grade and instructor; invalid ranges block export | Matches; actual four-record CSV previously verified |
| Reproduce, diagnose, fix and test bugs (pp. 3–5) | Eight documented original defects; original preserved with reproduction harness | Matches documented workflow |
| Required bug-log table (pp. 4–5) | PDF has all six fields: ID, issue, reproduction, root cause, fix and verification | Matches structure |
| At least three meaningful enhancements (pp. 5–6) | Scenario comparison; data-error and cutoff review; complete decision reports with notes | Meets feature count and stated purpose |
| Preserve core functionality after enhancements (p. 6) | 15 logic/report tests passed again on 29 September; 50 browser assertions recorded on 27 September | Supported by tests; final public workflow check pending |
| Public usable URL (pp. 6–8) | Local preview only | Outstanding |
| AI assistance allowed, understand changes (pp. 6–7) | Disclosure in README and submission draft; demo guide supports walkthrough | Disclosure prepared; participant must review and understand |
| Submit URL, bug log and enhancement summary (p. 7) | Bug log and summary prepared; URL pending | Partly complete |

## Scope decisions

- The PDF permits redesigning the experience and does not require a single HTML file. Separate CSS and JavaScript files are compatible with the instructions.
- Animations are optional polish. They are deliberately not counted among the three substantive enhancements. They are brief and respect reduced-motion preferences.
- Additional safeguards (file/row limits, duplicate detection and formula rejection) are documented product choices, not requirements claimed to come from the PDF.
- The PDF says a repository is required “if applicable”; the supplied submission-form screenshots make the GitHub URL mandatory. The stricter form requirement remains on the checklist.
- AI disclosure is explicitly required by the supplied form. The PDF also asks the participant to understand the changes; generating the code cannot establish that understanding.

## Remaining work before submission

1. Publish the repository and deploy the app at a public URL.
2. Verify uploads, calculations, scenario changes and complete CSV exports on that URL in a fresh browser session.
3. Verify native saving/reopening of the new HTML report and error CSV in Chrome/Edge. Their generated contents passed automated tests, but the in-app browser did not produce a saved HTML report during the earlier check.
4. Review the code and bug log with the participant, then complete an honest learning reflection and personal fields.
5. Submit once using the BITS account, with the final URLs, bug log, three enhancements and AI disclosure.

This audit re-ran the 15 Node tests. It reviewed the existing browser evidence rather than claiming a new browser test run on 29 September.
