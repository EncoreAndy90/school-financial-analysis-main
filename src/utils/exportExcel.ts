import ExcelJS from 'exceljs'
import type { ModelInputs, ProjectionResult } from '../finance/types'
import { totalNonStaffFromCategories } from '../finance/model'

type ExportExcelOptions = {
  inputs: ModelInputs
  result: ProjectionResult
  scenarioName: string
}

const CURRENCY_FORMAT = '£#,##0;(£#,##0)'
const PERCENT_FORMAT = '0.0%'

export const exportExcel = async ({ inputs, result, scenarioName }: ExportExcelOptions) => {
  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'School Budget Planner'
  workbook.created = new Date()

  // ----- Assumptions sheet -----
  const assumptionsSheet = workbook.addWorksheet('Assumptions')
  assumptionsSheet.mergeCells('A1', 'B1')
  assumptionsSheet.getCell('A1').value = inputs.schoolName.trim() || 'School Budget Plan'
  assumptionsSheet.getCell('A1').font = { size: 14, bold: true }

  const yearList = (values: number[]) => values.join(' / ')
  const assumptionRows: Array<[string, string | number]> = [
    ['Scenario', scenarioName.trim() || 'Unsaved plan'],
    ['Current academic year', inputs.firstYearLabel],
    ['Projection horizon (years)', inputs.projectionYears],
    ['Billing terms per year', inputs.termsPerYear],
    ['Pupils on roll (current)', inputs.currentPupils],
    ['Pupils by year', yearList(inputs.pupilsByYear)],
    ['Fee per term (current)', inputs.currentFeePerTerm],
    ['Fee increase % by year', yearList(inputs.feeIncreasePctByYear)],
    ['Staff children on roll', inputs.staffChildren],
    ['Staff child discount %', inputs.staffChildDiscountPct],
    ['Bursary / scholarship pupils', inputs.bursaryPupils],
    ['Average bursary remission %', inputs.bursaryAvgDiscountPct],
    ['Other income (annual)', inputs.otherIncomeAnnual],
    ['Other income growth %', inputs.otherIncomeGrowthPct],
    ['Staff cost mode', inputs.staffCostMode === 'detailed' ? 'Headcount × salary' : 'Known total'],
    ...(inputs.staffCostMode === 'detailed'
      ? ([
          ['Teaching staff FTE (current)', inputs.teachingStaffCurrent],
          ['Teaching staff FTE by year', yearList(inputs.teachingStaffByYear)],
          ['Average teaching salary', inputs.avgTeachingSalary],
          ['Support staff FTE (current)', inputs.supportStaffCurrent],
          ['Support staff FTE by year', yearList(inputs.supportStaffByYear)],
          ['Average support salary', inputs.avgSupportSalary],
          ['Employer on-costs %', inputs.onCostRatePct],
        ] as Array<[string, string | number]>)
      : ([['Total annual staff cost', inputs.totalStaffCostAnnual]] as Array<[string, string | number]>)),
    ['Pay award % by year', yearList(inputs.payIncreasePctByYear)],
    [
      'Non-staff costs (annual)',
      inputs.nonStaffCostMode === 'categories' ? totalNonStaffFromCategories(inputs) : inputs.totalNonStaffAnnual,
    ],
    ['Cost inflation % by year', yearList(inputs.inflationPctByYear)],
    ['Capital & loan repayments (annual)', inputs.capitalAnnual],
    ['Opening free reserves', inputs.openingReserves],
    ['Reserves target (months of expenditure)', inputs.minReservesMonths],
  ]

  assumptionRows.forEach((row) => assumptionsSheet.addRow(row))
  assumptionsSheet.columns = [{ width: 36 }, { width: 26 }]

  // ----- Projection sheet -----
  const projectionSheet = workbook.addWorksheet('Projection')
  projectionSheet.mergeCells(1, 1, 1, result.years.length + 1)
  projectionSheet.getCell('A1').value = 'Income & expenditure projection'
  projectionSheet.getCell('A1').font = { size: 14, bold: true }

  projectionSheet.addRow(['Line', ...result.years.map((y) => y.label)]).font = { bold: true }

  const currencyRow = (label: string, values: number[], bold = false) => {
    const row = projectionSheet.addRow([label, ...values])
    row.eachCell((cell, colNumber) => {
      if (colNumber > 1) {
        cell.numFmt = CURRENCY_FORMAT
      }
    })
    if (bold) {
      row.font = { bold: true }
    }
  }

  projectionSheet.addRow(['Pupils on roll', ...result.years.map((y) => Math.round(y.pupils))])
  currencyRow('Fee per term', result.years.map((y) => y.feePerTerm))
  currencyRow('Gross fee income', result.years.map((y) => y.grossFeeIncome))
  currencyRow('Fee remissions', result.years.map((y) => -y.totalRemissions))
  currencyRow('Net fee income', result.years.map((y) => y.netFeeIncome))
  currencyRow('Other income', result.years.map((y) => y.otherIncome))
  currencyRow('Total income', result.years.map((y) => y.totalIncome), true)
  currencyRow('Staff costs (incl. on-costs)', result.years.map((y) => y.staffCosts))
  currencyRow('Non-staff costs', result.years.map((y) => y.nonStaffCosts))
  currencyRow('Capital & loan repayments', result.years.map((y) => y.capital))
  currencyRow('Total expenditure', result.years.map((y) => y.totalExpenditure), true)
  currencyRow('Surplus / (deficit)', result.years.map((y) => y.surplus), true)
  currencyRow('Closing reserves', result.years.map((y) => y.closingReserves), true)

  const percentRow = (label: string, values: number[]) => {
    const row = projectionSheet.addRow([label, ...values.map((v) => v / 100)])
    row.eachCell((cell, colNumber) => {
      if (colNumber > 1) {
        cell.numFmt = PERCENT_FORMAT
      }
    })
  }

  percentRow('Staff costs % of income', result.years.map((y) => y.staffCostRatioPct))
  percentRow('Operating margin', result.years.map((y) => y.operatingMarginPct))
  projectionSheet.addRow([
    'Break-even pupils',
    ...result.years.map((y) => (y.breakEvenPupils !== null ? y.breakEvenPupils : '-')),
  ])

  projectionSheet.columns = [{ width: 30 }, ...result.years.map(() => ({ width: 18 }))]

  // ----- Warnings sheet -----
  const warningsSheet = workbook.addWorksheet('Warnings')
  warningsSheet.addRow(['Severity', 'Title', 'Detail']).font = { bold: true }
  result.warnings.forEach((warning) => {
    warningsSheet.addRow([warning.severity.toUpperCase(), warning.title, warning.message])
  })
  warningsSheet.columns = [{ width: 12 }, { width: 32 }, { width: 100 }]

  const buffer = await workbook.xlsx.writeBuffer()
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'school-budget-plan.xlsx'
  link.click()
  URL.revokeObjectURL(url)
}
