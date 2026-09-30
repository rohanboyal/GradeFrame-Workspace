# Three-minute demonstration

Use synthetic sample data for the demonstration. These boundary changes illustrate the tool; they are not recommendations for real grading.

1. **Start with the problem (20 seconds).** Explain that the supplied prototype had incorrect statistics, incomplete boundary validation and upload state bugs. Show the bug log and one original reproduction if time permits.
2. **Import and understand (30 seconds).** Choose Try sample data, enter an instructor name and keep Foundations of Computing selected. Confirm 50 students, average 61.64, median 64.50 and marks 0–100. The workbook has another 16 students in Mathematics I.
3. **Explore a decision (50 seconds).** Save the default boundaries as “Faculty baseline”. Change A minimum from 80 to 85. A- maximum follows to 84. The comparison should show 0 higher, 4 lower and 46 unchanged. Show affected students to inspect marks 80, 81, 82 and 84.
4. **Review edge cases (30 seconds).** Clear filters. Enable Near a boundary and switch between one and two marks. Explain that proximity is a review aid, with no automatic changes to marks or grades. Switch courses and back to demonstrate independent course state.
5. **Leave a record (30 seconds).** Enter a short decision note. Download the grading report and open it in a browser. Show the full course results and baseline/draft ranges. Review and export the CSV. Explain that filters affect the preview, not the complete course export.
6. **Close with evidence (20 seconds).** Point to 15 automated logic tests and 50 browser assertions, including 10,000 rows, failed replacement, formula rejection and exact boundaries. Disclose ChatGPT/Codex assistance and explain the decisions you personally reviewed.

## Before presenting

- Practise the sequence once on the final public URL.
- Verify report, CSV and error CSV downloads in the presentation browser.
- Keep the bug log, repository and public app links ready.
- Use your own words for your learning reflection. Do not claim tests or understanding you have not reviewed.
