# School Budget Planner

A budget planning and financial projection tool for school bursars, business managers and executives. Enter what you actually know — pupil numbers, fees, staffing and running costs — and the app calculates surplus/deficit, reserves, key ratios and multi-year projections.

## The logic runs the right way around

Earlier versions of this tool asked you to *enter* your current surplus and then derived costs backwards from it. That has been corrected. The model now works the way school finance actually works:

```
Income      = pupils × fee × terms − fee remissions + other income
Expenditure = staff costs (headcount × salary × on-costs) + non-staff costs + capital
Surplus     = Income − Expenditure          ← calculated, never assumed
Reserves    = opening reserves + cumulative surpluses
```

## Features

- **Income modelling** — pupil roll, termly fee, fee remissions (staff-child discounts, bursaries and scholarships with configurable rates), and non-fee income (lettings, catering, trips, grants).
- **Expenditure modelling** — staff costs either as a known total or built from teaching/support headcount × average salary × employer on-costs (NI + pension); non-staff costs as a total or by category (premises, catering, teaching resources, admin, other); annual capital/loan repayments.
- **1–5 year projections** — per-year pupil numbers, fee increases, pay awards, cost inflation and staffing plans, editable in a compact year-by-year grid. Rates can be zero or negative (fee freezes, pay cuts, deflation).
- **Reserves tracking** — opening free reserves rolled forward with each year's surplus, checked against a months-of-expenditure policy target.
- **KPIs** — operating margin, staff costs as % of income (with 60–75% sector benchmark), income/cost per pupil, pupil:teacher ratio, break-even pupil numbers.
- **Automatic warnings** — deficit years, exhausted reserves, reserves below policy target, staff cost ratio above benchmark, heavy remissions, pay awards outpacing fees, falling rolls.
- **Sensitivity analysis** — one-click "what if" table: pupils ±5%, fee increase ±1pp, pay award +1pp, inflation +1pp, with impact on final-year surplus and reserves.
- **Scenarios** — save/load/compare named scenario sets (stored in browser localStorage), plus starter presets (steady state, growth, cost pressure, falling roll).
- **Exports** — landscape PDF board report (assumptions, projection, optional charts) and Excel workbook (assumptions, projection, warnings).
- Dark mode.

## Install & run

Requirements: Node.js 18+ and npm.

```bash
npm install
npm run dev        # local dev server (usually http://localhost:5173)
```

```bash
npm test           # run the calculation-engine and rendering tests
npm run build      # production build
npm run preview    # preview the production build
```

## How to use

1. Open **School setup** and set your school name, current academic year and planning horizon.
2. In **Pupils, fees & remissions**, enter the current roll, termly fee, and remission profile.
3. Enter **Other income**, **Staff costs** (known total or headcount × salary) and **Non-staff costs** (total or by category).
4. Set **Capital & reserves**: annual capital spend, opening free reserves, and your reserves policy target.
5. Fill in the **Year-by-year plan** grid — pupil numbers, fee increases, pay awards, inflation and staffing per year.
6. Review the warnings, KPIs, projection table, charts and sensitivity analysis on the right.
7. Save scenarios and compare them side by side; export to PDF or Excel for governors.

## Notes and assumptions

- Fees are billed per term (3 terms by default, configurable).
- Fee increases, pay awards and inflation compound year on year.
- Employer on-costs (NI + pension) apply as a single percentage of gross salary; 25–30% is typical with the Teachers' Pension Scheme.
- Remission headcounts are capped at pupils on roll.
- Break-even pupils assume the average net fee per pupil (i.e. remissions scale with the roll).
- This is a planning and comparison tool, not an accounting system — validate against your management accounts.

## Project structure

```
src/
  finance/          Pure calculation engine (no UI)
    types.ts        Model input/output types
    model.ts        Projection, warnings, sensitivity, defaults
    presets.ts      Starter scenarios
    format.ts       GBP/number/percent formatting
    model.test.ts   Unit tests for the engine
  components/       UI panels (assumptions, KPIs, table, charts, analysis)
  utils/            Scenario persistence, PDF/Excel export
  App.tsx           Shell wiring state to the engine and panels
```
