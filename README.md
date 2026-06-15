# School Financial Analysis

A single-page app for modeling a school’s current financial position and producing a 3-year projection. Enter student numbers, fees, discounts, staffing costs, and inflation assumptions to see turnover, costs, and surplus across four years (current + 3).

Built with React, TypeScript, Vite, Tailwind CSS, and [shadcn/ui](https://ui.shadcn.com/) components (Radix primitives). Charts use Recharts; exports use jsPDF and ExcelJS.

## What It Does

- Calculates current-year turnover, costs, and surplus from your inputs.
- Projects three future years with per-year fee, pay, and inflation changes.
- Lets you model staff costs either as a share of costs or with detailed salaries/headcounts.
- Visualizes results in charts (turnover vs costs, surplus trend, revenue breakdown).
- Saves scenarios locally in the browser and allows load/save/delete.
- Exports to PDF (optionally with charts) and Excel.

## Install

Requirements: Node.js 18+ and npm.

```bash
npm install
```

## Run Locally

```bash
npm run dev
```

Then open the URL shown in your terminal (usually `http://localhost:5173`).

## Build For Production

```bash
npm run build
npm run preview
```

## How To Use

1. Enter your current student count and fee per term.
2. Set discounts (staff children and other discounts).
3. Choose staff cost mode:
   - Share of costs, or
   - Detailed salaries and headcount (optionally per year).
4. Set fee increases, pay increases, and inflation (single rate or per year).
5. Review results in the summary cards, tables, and charts.

## Scenarios

- Use the Scenarios section to save a set of assumptions.
- Scenarios are stored in browser localStorage (not a backend).

## Exports

- PDF: includes an assumptions snapshot and a results table; charts are optional.
- Excel: exports assumptions and results in separate worksheets.

## Tech Stack

- React 19 + TypeScript + Vite
- Tailwind CSS for styling
- shadcn/ui components (built on Radix UI) in `src/components/ui`
- Recharts for charts, jsPDF + ExcelJS for exports
- Light/dark theme via a `dark` class toggle and CSS variables

## Notes and Assumptions

- All projections assume 3 terms per year.
- “Current Annual Surplus” is interpreted as Turnover minus Costs.
- The app is for planning and comparison only; validate with your finance team.
