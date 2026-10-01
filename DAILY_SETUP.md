# Enable daily testing in GitHub

The workflow is ready in `.github/workflows/daily-tests.yml`. It is not active until uploaded to a GitHub repository's default branch with Actions enabled.

1. Create a new empty GitHub repository named `nnidhin-site-tests`. Do not initialize it with a README; this package already includes one. Private is a reasonable choice; check your account's included Actions minutes before enabling recurring runs.
2. Extract this ZIP. Open the inner `nnidhin-automation` folder in VS Code. The folder you open must directly contain package.json and .github.
3. Open Terminal > New Terminal. Git must be installed. Run these commands once, replacing YOUR_USERNAME with your GitHub username:

```powershell
git init
git add .
git commit -m "Add daily portfolio automation"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/nnidhin-site-tests.git
git push -u origin main
```

Complete GitHub's normal sign-in if prompted. No OpenAI API key or site credentials are needed. This is an automation repository; you do not need the website source code.

4. On GitHub, confirm that package.json is at the repository root and `.github/workflows/daily-tests.yml` exists. Go to Actions; enable workflows if GitHub prompts you.
5. Select Daily Portfolio Tests > Run workflow > main > Run workflow. This initial manual run verifies setup. Later runs use the schedule automatically.
6. Open the run to see its status and step logs. Download `portfolio-test-results-...` under Artifacts for the report, JSON results and failure evidence. For the HTML report, install dependencies locally with npm ci, extract the artifact, then use `npx playwright show-report path/to/playwright-report`.

Default schedule: every day at 09:30 IST (04:00 UTC). GitHub schedules are not exact-time guarantees and may be delayed. Change the cron line to choose another time. Public-repository schedules can be disabled after 60 days without repository activity; re-enable them in Actions if that happens.

Only schedule and manual triggers are configured. Pushes do not automatically run this workflow. Your PC does not need to stay on. The workflow runs 38 test cases; mobile is emulated. It does not send contact messages or post guestbook entries.

A red workflow may indicate a real site defect, test maintenance needed, a site network failure or a runner setup failure. Open the logs and report to distinguish them. Known site issues are deliberately not suppressed.

Validation before delivery: YAML structure, trigger, schedule conversion, report upload and 38-case collection were checked. No GitHub run has been performed, and a complete live test run remains unverified because Chromium could not be downloaded in the preparation environment.

References:
- https://playwright.dev/docs/ci-intro
- https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#schedule
