import type {
  ModelInputs,
  ModelWarning,
  ProjectionResult,
  SensitivityRow,
  YearProjection,
} from './types'

export const MAX_PROJECTION_YEARS = 5
export const MIN_PROJECTION_YEARS = 1

/** Benchmark band for staff costs as a share of income in independent schools. */
export const STAFF_COST_RATIO_HIGH_PCT = 75
export const STAFF_COST_RATIO_LOW_PCT = 50

const toFiniteNumber = (value: number): number =>
  Number.isFinite(value) ? value : 0

const nonNegative = (value: number): number => Math.max(0, toFiniteNumber(value))

/** Resize a per-year array, padding with the last known value. */
export const resizeYearArray = (values: number[], length: number, fallback = 0): number[] => {
  const result: number[] = []
  for (let i = 0; i < length; i += 1) {
    const candidate = values[i] ?? values[values.length - 1] ?? fallback
    result.push(toFiniteNumber(candidate))
  }
  return result
}

/**
 * Derive the label of the following academic year.
 * "2025/26" -> "2026/27", "2025-26" -> "2026-27", "2025" -> "2026".
 */
export const nextYearLabel = (label: string): string => {
  const academic = label.match(/^(\d{4})([/-])(\d{2})$/)
  if (academic) {
    const startYear = Number(academic[1]) + 1
    const endYear = (Number(academic[3]) + 1) % 100
    return `${startYear}${academic[2]}${endYear.toString().padStart(2, '0')}`
  }

  const plain = label.match(/^(\d{4})$/)
  if (plain) {
    return `${Number(plain[1]) + 1}`
  }

  return ''
}

export const yearLabels = (inputs: ModelInputs): string[] => {
  const labels: string[] = []
  let current = inputs.firstYearLabel.trim()
  for (let i = 0; i <= inputs.projectionYears; i += 1) {
    if (current) {
      labels.push(i === 0 ? `${current} (current)` : current)
      current = nextYearLabel(current)
    } else {
      labels.push(i === 0 ? 'Current year' : `Year ${i}`)
    }
  }
  return labels
}

export const totalNonStaffFromCategories = (inputs: ModelInputs): number => {
  const c = inputs.nonStaffCategories
  return (
    nonNegative(c.premises) +
    nonNegative(c.catering) +
    nonNegative(c.teachingResources) +
    nonNegative(c.adminAndProfessional) +
    nonNegative(c.other)
  )
}

const currentNonStaffCosts = (inputs: ModelInputs): number =>
  inputs.nonStaffCostMode === 'categories'
    ? totalNonStaffFromCategories(inputs)
    : nonNegative(inputs.totalNonStaffAnnual)

/**
 * Build the full multi-year projection.
 *
 * The direction of the logic matters: income and expenditure are built up from
 * user inputs, and surplus/deficit and reserves are *calculated* from them.
 */
export const buildProjection = (inputs: ModelInputs): ProjectionResult => {
  const years: YearProjection[] = []
  const labels = yearLabels(inputs)
  const projectionYears = Math.min(
    MAX_PROJECTION_YEARS,
    Math.max(MIN_PROJECTION_YEARS, Math.round(toFiniteNumber(inputs.projectionYears) || 1)),
  )
  const termsPerYear = Math.max(1, Math.round(toFiniteNumber(inputs.termsPerYear) || 3))

  const pupilsSeries = [
    nonNegative(inputs.currentPupils),
    ...resizeYearArray(inputs.pupilsByYear, projectionYears, inputs.currentPupils).map(nonNegative),
  ]
  const feeIncreases = resizeYearArray(inputs.feeIncreasePctByYear, projectionYears)
  const payIncreases = resizeYearArray(inputs.payIncreasePctByYear, projectionYears)
  const inflationRates = resizeYearArray(inputs.inflationPctByYear, projectionYears)
  const teachingHeads = [
    nonNegative(inputs.teachingStaffCurrent),
    ...resizeYearArray(inputs.teachingStaffByYear, projectionYears, inputs.teachingStaffCurrent).map(nonNegative),
  ]
  const supportHeads = [
    nonNegative(inputs.supportStaffCurrent),
    ...resizeYearArray(inputs.supportStaffByYear, projectionYears, inputs.supportStaffCurrent).map(nonNegative),
  ]

  const onCostFactor = 1 + nonNegative(inputs.onCostRatePct) / 100
  const staffDiscountRate = Math.min(100, nonNegative(inputs.staffChildDiscountPct)) / 100
  const bursaryDiscountRate = Math.min(100, nonNegative(inputs.bursaryAvgDiscountPct)) / 100

  let feePerTerm = nonNegative(inputs.currentFeePerTerm)
  let avgTeachingSalary = nonNegative(inputs.avgTeachingSalary)
  let avgSupportSalary = nonNegative(inputs.avgSupportSalary)
  let simpleStaffCost = nonNegative(inputs.totalStaffCostAnnual)
  let nonStaffCosts = currentNonStaffCosts(inputs)
  let otherIncome = nonNegative(inputs.otherIncomeAnnual)
  let reserves = toFiniteNumber(inputs.openingReserves)

  for (let index = 0; index <= projectionYears; index += 1) {
    const feeIncreasePct = index === 0 ? 0 : toFiniteNumber(feeIncreases[index - 1])
    const payIncreasePct = index === 0 ? 0 : toFiniteNumber(payIncreases[index - 1])
    const inflationPct = index === 0 ? 0 : toFiniteNumber(inflationRates[index - 1])

    if (index > 0) {
      feePerTerm *= 1 + feeIncreasePct / 100
      avgTeachingSalary *= 1 + payIncreasePct / 100
      avgSupportSalary *= 1 + payIncreasePct / 100
      simpleStaffCost *= 1 + payIncreasePct / 100
      nonStaffCosts *= 1 + inflationPct / 100
      otherIncome *= 1 + nonNegative(inputs.otherIncomeGrowthPct) / 100
    }

    const pupils = pupilsSeries[index]
    const annualFee = feePerTerm * termsPerYear
    const grossFeeIncome = pupils * annualFee

    // Remission headcounts cannot exceed pupils on roll.
    const staffChildren = Math.min(nonNegative(inputs.staffChildren), pupils)
    const bursaryPupils = Math.min(nonNegative(inputs.bursaryPupils), pupils - staffChildren)
    const staffChildRemission = staffChildren * annualFee * staffDiscountRate
    const bursaryRemission = bursaryPupils * annualFee * bursaryDiscountRate
    const totalRemissions = staffChildRemission + bursaryRemission
    const netFeeIncome = grossFeeIncome - totalRemissions
    const totalIncome = netFeeIncome + otherIncome

    const teachingStaffCount = teachingHeads[index]
    const supportStaffCount = supportHeads[index]
    const staffCosts = inputs.staffCostMode === 'detailed'
      ? (teachingStaffCount * avgTeachingSalary + supportStaffCount * avgSupportSalary) * onCostFactor
      : simpleStaffCost

    const capital = nonNegative(inputs.capitalAnnual)
    const totalExpenditure = staffCosts + nonStaffCosts + capital

    // The heart of the model: surplus is an output, never an assumption.
    const surplus = totalIncome - totalExpenditure
    reserves += surplus

    const netFeePerPupil = pupils > 0 ? netFeeIncome / pupils : annualFee
    const breakEvenPupils = netFeePerPupil > 0
      ? Math.ceil((totalExpenditure - otherIncome) / netFeePerPupil)
      : null

    years.push({
      index,
      label: labels[index],
      pupils,
      feePerTerm,
      grossFeeIncome,
      staffChildRemission,
      bursaryRemission,
      totalRemissions,
      netFeeIncome,
      otherIncome,
      totalIncome,
      teachingStaffCount,
      supportStaffCount,
      staffCosts,
      nonStaffCosts,
      capital,
      totalExpenditure,
      surplus,
      closingReserves: reserves,
      operatingMarginPct: totalIncome > 0 ? (surplus / totalIncome) * 100 : 0,
      staffCostRatioPct: totalIncome > 0 ? (staffCosts / totalIncome) * 100 : 0,
      incomePerPupil: pupils > 0 ? totalIncome / pupils : 0,
      costPerPupil: pupils > 0 ? totalExpenditure / pupils : 0,
      pupilTeacherRatio:
        inputs.staffCostMode === 'detailed' && teachingStaffCount > 0
          ? pupils / teachingStaffCount
          : null,
      breakEvenPupils,
      feeIncreasePct,
      payIncreasePct,
      inflationPct,
    })
  }

  return { years, warnings: buildWarnings(inputs, years) }
}

const listYears = (labels: string[]): string => labels.join(', ')

const buildWarnings = (inputs: ModelInputs, years: YearProjection[]): ModelWarning[] => {
  const warnings: ModelWarning[] = []

  const deficitYears = years.filter((y) => y.surplus < 0)
  if (deficitYears.length > 0) {
    warnings.push({
      severity: 'error',
      title: 'Deficit budget',
      message: `Expenditure exceeds income in: ${listYears(deficitYears.map((y) => y.label))}. Review fee levels, pupil recruitment or cost plans.`,
    })
  }

  const negativeReserves = years.filter((y) => y.closingReserves < 0)
  if (negativeReserves.length > 0) {
    warnings.push({
      severity: 'error',
      title: 'Reserves exhausted',
      message: `Free reserves fall below zero in: ${listYears(negativeReserves.map((y) => y.label))}. The school would need borrowing or emergency action before this point.`,
    })
  }

  const reservesTargetMonths = nonNegative(inputs.minReservesMonths)
  if (reservesTargetMonths > 0) {
    const belowTarget = years.filter(
      (y) => y.closingReserves >= 0 && y.closingReserves < y.totalExpenditure * (reservesTargetMonths / 12),
    )
    if (belowTarget.length > 0) {
      warnings.push({
        severity: 'warning',
        title: 'Reserves below policy target',
        message: `Closing reserves are below the ${reservesTargetMonths}-month expenditure target in: ${listYears(belowTarget.map((y) => y.label))}.`,
      })
    }
  }

  const highStaffRatio = years.filter((y) => y.staffCostRatioPct > STAFF_COST_RATIO_HIGH_PCT)
  if (highStaffRatio.length > 0) {
    warnings.push({
      severity: 'warning',
      title: 'Staff costs above benchmark',
      message: `Staff costs exceed ${STAFF_COST_RATIO_HIGH_PCT}% of income in: ${listYears(highStaffRatio.map((y) => y.label))}. Most independent schools aim for 60–75%.`,
    })
  }

  const remissionHeavy = years.filter(
    (y) => y.grossFeeIncome > 0 && y.totalRemissions / y.grossFeeIncome > 0.15,
  )
  if (remissionHeavy.length > 0) {
    warnings.push({
      severity: 'info',
      title: 'High fee remissions',
      message: `Fee remissions exceed 15% of gross fee income in: ${listYears(remissionHeavy.map((y) => y.label))}. Check bursary and discount policy affordability.`,
    })
  }

  const projected = years.slice(1)
  const payOutpacesFees = projected.filter((y) => y.payIncreasePct > y.feeIncreasePct)
  if (payOutpacesFees.length > 0) {
    warnings.push({
      severity: 'info',
      title: 'Pay awards outpace fee increases',
      message: `Pay awards are higher than fee increases in: ${listYears(payOutpacesFees.map((y) => y.label))}. Margins will compress unless offset by pupil growth or savings.`,
    })
  }

  const first = years[0]
  const last = years[years.length - 1]
  if (last.pupils < first.pupils) {
    warnings.push({
      severity: 'info',
      title: 'Falling roll',
      message: `Pupil numbers fall from ${Math.round(first.pupils)} to ${Math.round(last.pupils)} over the plan. Compare against break-even pupil numbers below.`,
    })
  }

  if (warnings.length === 0) {
    warnings.push({
      severity: 'info',
      title: 'No issues detected',
      message: 'Every projected year is in surplus and reserves stay above target under these assumptions.',
    })
  }

  return warnings
}

// ---------------------------------------------------------------------------
// Sensitivity analysis
// ---------------------------------------------------------------------------

type SensitivityScenario = {
  id: string
  label: string
  description: string
  transform: (inputs: ModelInputs) => ModelInputs
}

const scalePupils = (inputs: ModelInputs, factor: number): ModelInputs => ({
  ...inputs,
  pupilsByYear: inputs.pupilsByYear.map((n) => Math.round(n * factor)),
})

const shiftRates = (rates: number[], delta: number): number[] => rates.map((r) => r + delta)

const SENSITIVITY_SCENARIOS: SensitivityScenario[] = [
  {
    id: 'pupils-down',
    label: 'Pupils −5%',
    description: 'Projected pupil numbers fall 5% below plan in every year.',
    transform: (inputs) => scalePupils(inputs, 0.95),
  },
  {
    id: 'pupils-up',
    label: 'Pupils +5%',
    description: 'Projected pupil numbers exceed plan by 5% in every year.',
    transform: (inputs) => scalePupils(inputs, 1.05),
  },
  {
    id: 'fees-down',
    label: 'Fee increase −1pp',
    description: 'Each annual fee increase is 1 percentage point lower.',
    transform: (inputs) => ({
      ...inputs,
      feeIncreasePctByYear: shiftRates(inputs.feeIncreasePctByYear, -1),
    }),
  },
  {
    id: 'fees-up',
    label: 'Fee increase +1pp',
    description: 'Each annual fee increase is 1 percentage point higher.',
    transform: (inputs) => ({
      ...inputs,
      feeIncreasePctByYear: shiftRates(inputs.feeIncreasePctByYear, 1),
    }),
  },
  {
    id: 'pay-up',
    label: 'Pay award +1pp',
    description: 'Each annual pay award is 1 percentage point higher.',
    transform: (inputs) => ({
      ...inputs,
      payIncreasePctByYear: shiftRates(inputs.payIncreasePctByYear, 1),
    }),
  },
  {
    id: 'inflation-up',
    label: 'Inflation +1pp',
    description: 'Non-staff cost inflation is 1 percentage point higher each year.',
    transform: (inputs) => ({
      ...inputs,
      inflationPctByYear: shiftRates(inputs.inflationPctByYear, 1),
    }),
  },
]

export const runSensitivity = (inputs: ModelInputs): SensitivityRow[] => {
  const base = buildProjection(inputs)
  const baseFinal = base.years[base.years.length - 1]

  return SENSITIVITY_SCENARIOS.map((scenario) => {
    const result = buildProjection(scenario.transform(inputs))
    const final = result.years[result.years.length - 1]
    return {
      id: scenario.id,
      label: scenario.label,
      description: scenario.description,
      finalYearSurplus: final.surplus,
      surplusDelta: final.surplus - baseFinal.surplus,
      finalYearReserves: final.closingReserves,
      reservesDelta: final.closingReserves - baseFinal.closingReserves,
    }
  })
}

// ---------------------------------------------------------------------------
// Defaults
// ---------------------------------------------------------------------------

export const defaultInputs = (): ModelInputs => ({
  schoolName: '',
  firstYearLabel: '2025/26',
  projectionYears: 3,
  termsPerYear: 3,

  currentPupils: 200,
  pupilsByYear: [200, 200, 200],
  currentFeePerTerm: 7000,
  feeIncreasePctByYear: [4, 4, 4],

  staffChildren: 6,
  staffChildDiscountPct: 50,
  bursaryPupils: 10,
  bursaryAvgDiscountPct: 30,

  otherIncomeAnnual: 150000,
  otherIncomeGrowthPct: 2,

  staffCostMode: 'detailed',
  totalStaffCostAnnual: 2800000,
  teachingStaffCurrent: 35,
  teachingStaffByYear: [35, 35, 35],
  avgTeachingSalary: 45000,
  supportStaffCurrent: 25,
  supportStaffByYear: [25, 25, 25],
  avgSupportSalary: 25000,
  onCostRatePct: 27,
  payIncreasePctByYear: [3, 3, 3],

  nonStaffCostMode: 'categories',
  totalNonStaffAnnual: 1100000,
  nonStaffCategories: {
    premises: 400000,
    catering: 250000,
    teachingResources: 150000,
    adminAndProfessional: 200000,
    other: 100000,
  },
  inflationPctByYear: [2.5, 2.5, 2.5],

  capitalAnnual: 100000,
  openingReserves: 500000,
  minReservesMonths: 3,
})

/** Keep all per-year arrays in sync when the projection horizon changes. */
export const withProjectionYears = (inputs: ModelInputs, projectionYears: number): ModelInputs => {
  const clamped = Math.min(MAX_PROJECTION_YEARS, Math.max(MIN_PROJECTION_YEARS, Math.round(projectionYears)))
  return {
    ...inputs,
    projectionYears: clamped,
    pupilsByYear: resizeYearArray(inputs.pupilsByYear, clamped, inputs.currentPupils),
    feeIncreasePctByYear: resizeYearArray(inputs.feeIncreasePctByYear, clamped),
    payIncreasePctByYear: resizeYearArray(inputs.payIncreasePctByYear, clamped),
    inflationPctByYear: resizeYearArray(inputs.inflationPctByYear, clamped),
    teachingStaffByYear: resizeYearArray(inputs.teachingStaffByYear, clamped, inputs.teachingStaffCurrent),
    supportStaffByYear: resizeYearArray(inputs.supportStaffByYear, clamped, inputs.supportStaffCurrent),
  }
}
