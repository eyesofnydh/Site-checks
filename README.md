# Nidhin portfolio automation

Target: https://nnidhin.netlify.app/

38 Playwright test cases: 19 scenarios each on desktop Chromium and an emulated Pixel 7. Tests cover homepage content, five navigation links, About popup and keyboard dismissal, contact validation and payload completeness, guestbook validation and reaction selection, snake game controls, horizontal overflow, images, internal anchors, JavaScript exceptions and three axe accessibility scans.

## Run on Windows (VS Code terminal or PowerShell)

1. Install Node.js LTS if Node/npm are not installed.
2. Extract this ZIP and open the `nnidhin-automation` folder in VS Code.
3. Run:

```powershell
npm ci
npx playwright install chromium
npm test
npm run report
```

To watch the desktop tests:

```powershell
npm run test:desktop -- --headed
```

If the Chromium download is unavailable but Google Chrome is already installed:

```powershell
$env:USE_CHROME = '1'
npm run test:desktop -- --headed
```

Optional commands: `npm run test:mobile`, `npm run test:ui`.

Reports: `playwright-report/index.html`, `results.json`, and `test-results/`. Failed browser tests save screenshots, videos and traces. Accessibility tests attach full axe results including incomplete checks needing manual review. Existing defects intentionally fail assertions; they are not suppressed.

## Verification performed here, 1 October 2026

Dependency installation succeeded. `npx playwright test --list` successfully collected 38 tests. A desktop test execution was attempted but stopped before visiting the site because the Chromium executable was unavailable. The browser download returned invalid/truncated ZIP data. Therefore the 38-case suite has NOT completed a live run, and its pass/fail results are not yet established. The included execution log documents this environment failure; it is not a site defect.

Separate live browser inspection confirmed the homepage, sections and six project cards; About opens and closes with the mouse; Escape leaves the About popup open; the contact Name input lacks a `name` attribute; all inspected internal fragment targets exist; no completed image was broken at the time of inspection; the inspected desktop page had no document-level horizontal overflow (1363px viewport and content).

See OBSERVATIONS.md for issue wording and suggested fixes.

## Coverage boundaries

Tests do not send contact messages or guestbook entries. Non-read-only network requests are blocked during tests. Valid email delivery and persisted guestbook submissions need a separate approved test environment/flow. External project/social links are visible in the site but their destinations are not exhaustively checked. The runner does not provide full game gameplay coverage or load testing.

Mobile is browser emulation, not a physical-device test. There are no visual baselines or Firefox/WebKit runs. Automated accessibility checks cannot certify WCAG compliance or reproduce a screen reader. Check manually with NVDA on Windows: reading order, link/button names, form errors, popup focus movement/trapping/return, keyboard-only operation, charts and canvas game alternatives. Also check text zoom at 200%, reflow at 400%, reduced motion and contrast that axe marks incomplete.

No OpenAI API key is needed. Playwright and axe run these checks directly.
