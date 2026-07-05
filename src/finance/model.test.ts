import { describe, expect, it } from 'vitest'
import {
  buildProjection,
  defaultInputs,
  nextYearLabel,
  resizeYearArray,
  runSensitivity,
  totalNonStaffFromCategories,
  withProjectionYears,
} from './model'
import type { ModelInputs } from './types'

const baseInputs = (): ModelInputs => ({
  ...defaultInputs(),
  schoolName: 'Test School',
  firstYearLabel: '2025/26',
  projectionYears: 3,
  termsPerYear: 3,

  currentPupils: 100,
  pupilsByYear: [100, 100, 100],
  currentFeePerTerm: 5000,
  feeIncreasePctByYear: [0, 0, 0],

  staffChildren: 0,
  staffChildDiscountPct: 50,
  bursaryPupils: 0,
  bursaryAvgDiscountPct: 30,

  otherIncomeAnnual: 0,
  otherIncomeGrowthPct: 0,

  staffCostMode: 'total',
  totalStaffCostAnnual: 900000,
  payIncreasePctByYear: [0, 0, 0],

  nonStaffCostMode: 'total',
  totalNonStaffAnnual: 300000,
  inflationPctByYear: [0, 0, 0],

  capitalAnnual: 0,
  openingReserves: 0,
  minReservesMonths: 0,
})

describe('buildProjection: direction of the core logic', () => {
  it('calculates surplus as income minus expenditure (never an input)', () => {
    const result = buildProjection(baseInputs())
    const current = result.years[0]

    // 100 pupils x £5,000 x 3 terms = £1,500,000 income
    expect(current.totalIncome).toBe(1_500_000)
    // £900,000 staff + £300,000 non-staff = £1,200,000 expenditure
    expect(current.totalExpenditure).toBe(1_200_000)
    // Surplus is derived, not assumed
    expect(current.surplus).toBe(300_000)
  })

  it('reports a deficit when expenditure exceeds income', () => {
    const inputs = { ...baseInputs(), totalStaffCostAnnual: 1_400_000 }
    const result = buildProjection(inputs)

    expect(result.years[0].surplus).toBe(-200_000)
    expect(result.warnings.some((w) => w.severity === 'error' && w.title === 'Deficit budget')).toBe(true)
  })

  it('produces current year plus one row per projection year', () => {
    const result = buildProjection(baseInputs())
    expect(result.years).toHaveLength(4)
    expect(result.years[0].label).toContain('current')
  })
})

describe('fee income', () => {
  it('compounds fee increases year on year', () => {
    const inputs = { ...baseInputs(), feeIncreasePctByYear: [10, 10, 10] }
    const result = buildProjection(inputs)

    expect(result.years[0].feePerTerm).toBeCloseTo(5000)
    expect(result.years[1].feePerTerm).toBeCloseTo(5500)
    expect(result.years[2].feePerTerm).toBeCloseTo(6050)
    expect(result.years[3].feePerTerm).toBeCloseTo(6655)
  })

  it('applies remissions to gross fee income', () => {
    const inputs: ModelInputs = {
      ...baseInputs(),
      staffChildren: 4,
      staffChildDiscountPct: 50,
      bursaryPupils: 10,
      bursaryAvgDiscountPct: 30,
    }
    const result = buildProjection(inputs)
    const current = result.years[0]

    const annualFee = 15_000
    expect(current.staffChildRemission).toBeCloseTo(4 * annualFee * 0.5)
    expect(current.bursaryRemission).toBeCloseTo(10 * annualFee * 0.3)
    expect(current.netFeeIncome).toBeCloseTo(current.grossFeeIncome - current.totalRemissions)
  })

  it('caps remission headcounts at pupils on roll', () => {
    const inputs: ModelInputs = {
      ...baseInputs(),
      currentPupils: 10,
      pupilsByYear: [10, 10, 10],
      staffChildren: 8,
      bursaryPupils: 8, // only 2 places left after staff children
      bursaryAvgDiscountPct: 100,
      staffChildDiscountPct: 100,
    }
    const result = buildProjection(inputs)
    const current = result.years[0]

    // 8 staff children + 2 bursary pupils at 100% remission = whole roll free
    expect(current.totalRemissions).toBeCloseTo(current.grossFeeIncome)
    expect(current.netFeeIncome).toBeCloseTo(0)
  })
})

describe('expenditure', () => {
  it('builds detailed staff costs from headcount, salary and on-costs', () => {
    const inputs: ModelInputs = {
      ...baseInputs(),
      staffCostMode: 'detailed',
      teachingStaffCurrent: 10,
      teachingStaffByYear: [10, 10, 10],
      avgTeachingSalary: 40_000,
      supportStaffCurrent: 5,
      supportStaffByYear: [5, 5, 5],
      avgSupportSalary: 20_000,
      onCostRatePct: 25,
    }
    const result = buildProjection(inputs)

    // (10 x 40k + 5 x 20k) x 1.25 = 625,000
    expect(result.years[0].staffCosts).toBeCloseTo(625_000)
  })

  it('applies pay awards to salaries and inflation to non-staff costs', () => {
    const inputs: ModelInputs = {
      ...baseInputs(),
      staffCostMode: 'total',
      totalStaffCostAnnual: 1_000_000,
      payIncreasePctByYear: [5, 0, 0],
      totalNonStaffAnnual: 200_000,
      inflationPctByYear: [10, 0, 0],
    }
    const result = buildProjection(inputs)

    expect(result.years[1].staffCosts).toBeCloseTo(1_050_000)
    expect(result.years[1].nonStaffCosts).toBeCloseTo(220_000)
  })

  it('sums non-staff categories in category mode', () => {
    const inputs: ModelInputs = {
      ...baseInputs(),
      nonStaffCostMode: 'categories',
      nonStaffCategories: {
        premises: 100,
        catering: 200,
        teachingResources: 300,
        adminAndProfessional: 400,
        other: 500,
      },
    }
    expect(totalNonStaffFromCategories(inputs)).toBe(1500)
    expect(buildProjection(inputs).years[0].nonStaffCosts).toBe(1500)
  })

  it('includes capital spend in total expenditure', () => {
    const inputs = { ...baseInputs(), capitalAnnual: 50_000 }
    const result = buildProjection(inputs)
    expect(result.years[0].totalExpenditure).toBe(1_250_000)
  })
})

describe('reserves', () => {
  it('accumulates surpluses onto opening reserves', () => {
    const inputs = { ...baseInputs(), openingReserves: 100_000 }
    const result = buildProjection(inputs)

    // Each year has a £300,000 surplus
    expect(result.years[0].closingReserves).toBe(400_000)
    expect(result.years[1].closingReserves).toBe(700_000)
    expect(result.years[3].closingReserves).toBe(1_300_000)
  })

  it('warns when reserves go negative', () => {
    const inputs = {
      ...baseInputs(),
      totalStaffCostAnnual: 1_400_000,
      openingReserves: 100_000,
    }
    const result = buildProjection(inputs)
    expect(result.years[0].closingReserves).toBe(-100_000)
    expect(result.warnings.some((w) => w.title === 'Reserves exhausted')).toBe(true)
  })

  it('warns when reserves fall below the months-of-expenditure target', () => {
    const inputs = {
      ...baseInputs(),
      totalStaffCostAnnual: 1_190_000, // £10k surplus per year
      openingReserves: 0,
      minReservesMonths: 3, // target = 1,490,000 x 3/12 = 372,500
    }
    const result = buildProjection(inputs)
    expect(result.warnings.some((w) => w.title === 'Reserves below policy target')).toBe(true)
  })
})

describe('KPIs', () => {
  it('calculates staff cost ratio and operating margin against income', () => {
    const result = buildProjection(baseInputs())
    const current = result.years[0]

    expect(current.staffCostRatioPct).toBeCloseTo((900_000 / 1_500_000) * 100)
    expect(current.operatingMarginPct).toBeCloseTo((300_000 / 1_500_000) * 100)
  })

  it('computes break-even pupil numbers that cover expenditure', () => {
    const result = buildProjection(baseInputs())
    const current = result.years[0]

    // Net fee per pupil = £15,000; expenditure £1.2m; no other income
    expect(current.breakEvenPupils).toBe(80)
  })

  it('reduces break-even pupils when other income contributes', () => {
    const inputs = { ...baseInputs(), otherIncomeAnnual: 150_000 }
    const result = buildProjection(inputs)
    // (1,200,000 - 150,000) / 15,000 = 70
    expect(result.years[0].breakEvenPupils).toBe(70)
  })

  it('calculates pupil:teacher ratio in detailed staffing mode', () => {
    const inputs: ModelInputs = {
      ...baseInputs(),
      staffCostMode: 'detailed',
      teachingStaffCurrent: 10,
      teachingStaffByYear: [10, 10, 10],
    }
    const result = buildProjection(inputs)
    expect(result.years[0].pupilTeacherRatio).toBeCloseTo(10)
  })
})

describe('sensitivity analysis', () => {
  it('moves surplus in the expected direction for each driver', () => {
    const rows = runSensitivity(baseInputs())
    const byId = Object.fromEntries(rows.map((row) => [row.id, row]))

    expect(byId['pupils-up'].surplusDelta).toBeGreaterThan(0)
    expect(byId['pupils-down'].surplusDelta).toBeLessThan(0)
    expect(byId['fees-up'].surplusDelta).toBeGreaterThan(0)
    expect(byId['fees-down'].surplusDelta).toBeLessThan(0)
    expect(byId['pay-up'].surplusDelta).toBeLessThan(0)
    expect(byId['inflation-up'].surplusDelta).toBeLessThan(0)
  })
})

describe('helpers', () => {
  it('derives following academic year labels', () => {
    expect(nextYearLabel('2025/26')).toBe('2026/27')
    expect(nextYearLabel('2099/00')).toBe('2100/01')
    expect(nextYearLabel('2025-26')).toBe('2026-27')
    expect(nextYearLabel('2025')).toBe('2026')
    expect(nextYearLabel('nonsense')).toBe('')
  })

  it('resizes per-year arrays padding with the last value', () => {
    expect(resizeYearArray([1, 2], 4)).toEqual([1, 2, 2, 2])
    expect(resizeYearArray([1, 2, 3, 4], 2)).toEqual([1, 2])
    expect(resizeYearArray([], 2, 0)).toEqual([0, 0])
  })

  it('keeps per-year arrays in sync when the horizon changes', () => {
    const inputs = withProjectionYears({ ...baseInputs(), pupilsByYear: [100, 110, 120] }, 5)
    expect(inputs.pupilsByYear).toEqual([100, 110, 120, 120, 120])
    expect(inputs.feeIncreasePctByYear).toHaveLength(5)

    const shrunk = withProjectionYears(inputs, 2)
    expect(shrunk.pupilsByYear).toEqual([100, 110])
  })

  it('treats non-finite input values as zero instead of propagating NaN', () => {
    const inputs = { ...baseInputs(), otherIncomeAnnual: Number.NaN }
    const result = buildProjection(inputs)
    expect(Number.isFinite(result.years[3].surplus)).toBe(true)
  })
})
