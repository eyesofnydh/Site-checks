# Verified observations — 1 October 2026

These observations came from live browser inspection and the site's served HTML, not a completed Playwright suite run.

| ID | Issue | Reproduction | Expected | Suggested fix |
|---|---|---|---|---|
| NN-01 | The contact form's Name field is omitted from standard form submission data. | Inspect the Name input under Contact: it has no `name` attribute. HTML form submission only includes named controls. | The entered name is included with email and message. | Add `name="name"` to the Name input. |
| NN-02 | The About popup does not close when Escape is pressed. | Click Know more, then press Escape; the popup remains visible. Mouse close works. | Escape dismisses the popup and focus returns to Know more. | Add keyboard dismissal and appropriate dialog focus handling; verify focus separately. |

Potential accessibility follow-up: social/project icon links expose glyphs such as “” as their accessible names. Give each an informative label describing the destination. No axe contrast scan was completed in this environment, so no contrast pass or failure is claimed.

Suite execution is blocked by unavailable Chromium after a failed browser download. Test collection passed (38 cases). Run the delivered suite locally to obtain actual functional and accessibility results.
