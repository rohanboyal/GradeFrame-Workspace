# Design refinements

The challenge asks for thoughtful improvements that solve user problems. This pass improves the existing grading workflow; animations are not counted as a substantive enhancement.

| User problem | Design response |
| --- | --- |
| A new user does not know where to begin | Three visible destinations: Import, Explore, Review & export; sample-data invitation in the initial state |
| A disabled export does not explain what to do next | Contextual guidance links to the missing name, invalid boundaries or workbook issues |
| A failed import might look like lost work | Existing preservation message remains; guidance points to the correction details |
| Small controls are difficult to use on phones | Larger boundary inputs and button targets; wrapping headers and compact navigation |
| Keyboard users can lose their place | Strong focus rings, highlighted active boundary row and visible skip link above the sidebar |
| Dense tables are difficult to scan | Gentle row hover highlighting and contained horizontal scrolling |
| Motion can distract or cause discomfort | Brief existing transitions, no repeating decorative animation, reduced-motion and print overrides |

The grading defaults, workbook rules, validation, complete-course exports and AI disclosure are unchanged. The interface uses the same restrained green and cream palette. No new account, external service or data collection was added.

Verification on 29 September 2026: all 50 existing browser assertions passed. Guidance was also exercised through initial, imported, missing-name, valid, invalid and reset states. Mobile widths of 320px and 390px showed no horizontal page overflow.
