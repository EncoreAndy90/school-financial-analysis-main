/**
 * Core types for the school budget planning model.
 *
 * Design principle: the user enters what they actually know — pupil numbers,
 * fees, staffing and running costs — and the model calculates the outputs
 * (surplus/deficit, reserves, ratios). Surplus is never an input.
 */

export type StaffCostMode = 'total' | 'detailed'
export type NonStaffCostMode = 'total' | 'categories'

export type NonStaffCategories = {
  premises: number
  catering: number
  teachingResources: number
  adminAndProfessional: number
  other: number
}

export type ModelInputs = {
  schoolName: string
  /** Label of the current/budget year, e.g. "2025/26". */
  firstYearLabel: string
  /** Number of future years to project (1–5). */
  projectionYears: number
  /** Number of billing terms per year (UK schools usually 3). */
  termsPerYear: number

  // ----- Income: fees -----
  /** Pupils on roll in the current year. */
  currentPupils: number
  /** Planned pupils for each projection year (length = projectionYears). */
  pupilsByYear: number[]
  /** Current headline fee per pupil per term (before remissions). */
  currentFeePerTerm: number
  /** Fee increase % applied at the start of each projection year. */
  feeIncreasePctByYear: number[]

  // ----- Income: fee remissions -----
  /** Number of staff children on roll. */
  staffChildren: number
  /** Discount % applied to staff children's fees. */
  staffChildDiscountPct: number
  /** Number of pupils receiving bursaries / scholarships / other awards. */
  bursaryPupils: number
  /** Average remission % for those bursary/scholarship pupils. */
  bursaryAvgDiscountPct: number

  // ----- Income: other -----
  /** Annual non-fee income: lettings, catering, trips, registration fees, grants. */
  otherIncomeAnnual: number
  /** Annual growth % applied to other income. */
  otherIncomeGrowthPct: number

  // ----- Expenditure: staff -----
  staffCostMode: StaffCostMode
  /** Used in 'total' mode: total annual staff cost including employer on-costs. */
  totalStaffCostAnnual: number
  /** Used in 'detailed' mode. */
  teachingStaffCurrent: number
  /** Planned teaching headcount for each projection year. */
  teachingStaffByYear: number[]
  avgTeachingSalary: number
  supportStaffCurrent: number
  supportStaffByYear: number[]
  avgSupportSalary: number
  /** Employer on-costs (National Insurance + pension) as % of gross salary. */
  onCostRatePct: number
  /** Pay award % applied at the start of each projection year. */
  payIncreasePctByYear: number[]

  // ----- Expenditure: non-staff -----
  nonStaffCostMode: NonStaffCostMode
  /** Used in 'total' mode: current-year total non-staff running costs. */
  totalNonStaffAnnual: number
  /** Used in 'categories' mode: current-year values per category. */
  nonStaffCategories: NonStaffCategories
  /** Cost inflation % applied to non-staff costs each projection year. */
  inflationPctByYear: number[]

  // ----- Capital & reserves -----
  /** Annual capital expenditure / loan repayments (held flat). */
  capitalAnnual: number
  /** Free reserves at the start of the current year. */
  openingReserves: number
  /** Reserves policy target, expressed as months of total expenditure. */
  minReservesMonths: number
}

export type YearProjection = {
  /** 0 = current year, 1..N = projection years. */
  index: number
  label: string
  pupils: number
  feePerTerm: number

  grossFeeIncome: number
  staffChildRemission: number
  bursaryRemission: number
  totalRemissions: number
  netFeeIncome: number
  otherIncome: number
  totalIncome: number

  teachingStaffCount: number
  supportStaffCount: number
  staffCosts: number
  nonStaffCosts: number
  capital: number
  totalExpenditure: number

  /** Calculated: totalIncome − totalExpenditure. */
  surplus: number
  /** Reserves at the end of the year: opening reserves + cumulative surpluses. */
  closingReserves: number

  operatingMarginPct: number
  staffCostRatioPct: number
  incomePerPupil: number
  costPerPupil: number
  pupilTeacherRatio: number | null
  /** Pupils needed for income to cover expenditure at this year's fee levels. */
  breakEvenPupils: number | null

  feeIncreasePct: number
  payIncreasePct: number
  inflationPct: number
}

export type WarningSeverity = 'error' | 'warning' | 'info'

export type ModelWarning = {
  severity: WarningSeverity
  title: string
  message: string
}

export type ProjectionResult = {
  years: YearProjection[]
  warnings: ModelWarning[]
}

export type SensitivityRow = {
  id: string
  label: string
  description: string
  finalYearSurplus: number
  surplusDelta: number
  finalYearReserves: number
  reservesDelta: number
}
