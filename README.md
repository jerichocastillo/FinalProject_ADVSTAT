# Statistical Analysis System (Phase 1)

An educational web app built with Next.js (App Router), React, TypeScript, Tailwind CSS, Recharts, and Lucide React.

## Features

- **Dashboard** with cards for each tool
- **Simple Linear Regression and Correlation**: data table, slope, intercept, equation, Pearson r with strength, prediction, scatter plot with fitted line
- **Hypothesis Testing**: one-sample and two-sample Z-tests, left/right/two-tailed, α = 0.10 / 0.05 / 0.01, critical values, decision, and a normal curve with the rejection region shaded
- **About** page

Phase 1 is local only: no database, login, saved history, or deployment.

## How to run

You need Node.js 20.9 or newer. Check with:

```bash
node -v
npm -v
```

Then, inside this folder:

```bash
npm install
npm run dev
```

Open http://localhost:3000.

To test the production build:

```bash
npm run build
npm run start
```

## Project structure

```text
app/            layout.tsx, page.tsx (section switching), globals.css
components/     Sidebar, Dashboard, About, RegressionCalculator, RegressionChart,
                HypothesisTesting, NormalDistributionChart, ui (shared pieces)
lib/            regression.ts, hypothesis-testing.ts, format.ts  (all the math, no UI)
```

All formulas live in `lib/`, separate from the screens, so they can be tested on their own.

## Quick checks you can do by hand

Regression sample data (hours studied vs exam score, 10 pairs from the lesson):
ŷ ≈ 55.4788 + 6.1879x, r ≈ 0.9970 (very strong positive), predicted Y at X = 12 ≈ 129.7333.

Z-test examples from the lesson (α = 0.05):

| Example | z | Decision |
|---|---|---|
| Luggage, two-tailed (n=50, x̄=38, μ₀=40, σ=9.5) | −1.4887 | Fail to reject H₀ |
| Cereal, two-tailed (n=36, x̄=495, μ₀=500, σ=10) | −3.0000 | Reject H₀ |
| Test scores, right-tailed (n=100, x̄=78, μ₀=75, σ=8) | 3.7500 | Reject H₀ |
