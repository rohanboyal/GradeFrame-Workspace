# Verification record

Visual guide refresh: four illustrative previews, segmented progress and brief card transitions added. JavaScript syntax check passed. Keyboard navigation exercised all four steps, Back, completion and reopen. At 390px, the comparison card's dialog measured 342px client/scroll width and 648px client/scroll height, without clipped content. Transitions check prefers-reduced-motion before running; chart animation is limited to no-preference media. No grading logic changed.

Quick guide verification: first-visit dialog appeared; all four cards, Back, completion, Skip and Escape were exercised through keyboard controls. After completion, reloading the separate empty test tab kept the guide dismissed. Quick guide reopened at step 1. At 390px the dialog had equal client and scroll widths (342px), with no horizontal content overflow. Only the dismissal preference is persisted; workbook data remains session-only.

Local build reviewed on 27 September 2026 using synthetic data.

29 September design refinement: re-ran all 50 browser assertions successfully after adding contextual guidance and interaction states. Manually verified initial, loaded, missing-name, invalid-boundary and reset guidance. Checked 320px and 390px widths without horizontal page overflow. This does not replace the pending public deployment and native download checks below. Fresh browser results are in polish-regression.txt and polish-advanced.txt.

| Area | Evidence | Result |
| --- | --- | --- |
| Core and report logic | Node test runner, core.test.cjs and reports.test.cjs | 15 passed |
| Existing browser workflows | fixed-checks.html | 23 assertions passed |
| New workflows and edge cases | advanced-checks.html | 27 assertions passed |
| Large import | 10,000 rows, full export and pagination | Passed; 521 ms import/render in one local run, not a performance guarantee |
| Original defects | Preserved original and reproduction results | Eight defects documented |
| Actual XLSX file selection and CSV save | Native chooser and independently reopened four-record export | Passed in earlier verification; verified-export.csv retained |
| Responsive layout | In-app browser at desktop, 390px and 320px | No horizontal page overflow; mobile boundary controls visually inspected |
| Scenario demonstration | A cutoff changed from 80 to 85, 50 sample students | 4 lower, 46 unchanged, 0 higher |
| New HTML report and error CSV | Generated content checked by browser harness and logic tests | Passed; native saved files still require checking in the final browser |

The in-app browser exposed a report-prepared status, but no corresponding HTML file appeared in Downloads. Therefore native saving of the new report is not marked verified. Chrome and Edge were not separately tested. Public deployment has not yet been created or tested.

## Release checks

1. Open the deployed app in fresh Chrome and Edge sessions.
2. Import the sample workbook; verify course counts and statistics.
3. Repeat the scenario demonstration and confirm course-specific state.
4. Save and reopen CSV, grading report and validation error CSV.
5. Confirm all student rows are present, including when the preview is filtered.
6. Check the mobile layout and keyboard workflow on the public URL.

Session data is held in browser memory. Refreshing clears it. Named scenarios are limited to five per course. Decision reports include student results; the demonstration uses synthetic records only.
