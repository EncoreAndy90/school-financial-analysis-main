import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import html2canvas from 'html2canvas'
import type { ModelInputs, ProjectionResult } from '../finance/types'
import { totalNonStaffFromCategories } from '../finance/model'
import { formatCurrency, formatNumber, formatPercent } from '../finance/format'

type ChartCapture = {
  title: string
  element: HTMLElement | null
}

type ExportPdfOptions = {
  inputs: ModelInputs
  result: ProjectionResult
  scenarioName: string
  charts: ChartCapture[]
  includeCharts: boolean
}

export const exportPdf = async ({ inputs, result, scenarioName, charts, includeCharts }: ExportPdfOptions) => {
  const doc = new jsPDF({ orientation: 'landscape' })
  const schoolName = inputs.schoolName.trim() || 'School Budget Plan'
  const title = scenarioName.trim() ? `${schoolName} — ${scenarioName.trim()}` : schoolName
  const exportDate = new Date().toLocaleDateString('en-GB')

  doc.setFontSize(16)
  doc.text(title, 14, 16)
  doc.setFontSize(10)
  doc.text(`Exported: ${exportDate}`, 14, 22)

  const projected = result.years.slice(1)
  const nonStaffTotal = inputs.nonStaffCostMode === 'categories'
    ? totalNonStaffFromCategories(inputs)
    : inputs.totalNonStaffAnnual

  const assumptions = [
    `Current year: ${inputs.firstYearLabel} · Horizon: ${inputs.projectionYears} year(s) · ${inputs.termsPerYear} terms per year`,
    `Pupils: current ${formatNumber(inputs.currentPupils)}, plan ${inputs.pupilsByYear.map((n) => formatNumber(n)).join(' / ')}`,
    `Fee per term: ${formatCurrency(inputs.currentFeePerTerm)} · increases ${inputs.feeIncreasePctByYear.map((r) => formatPercent(r)).join(' / ')}`,
    `Remissions: ${formatNumber(inputs.staffChildren)} staff children at ${formatPercent(inputs.staffChildDiscountPct, 0)}, ${formatNumber(inputs.bursaryPupils)} bursary pupils at ${formatPercent(inputs.bursaryAvgDiscountPct, 0)} average`,
    `Other income: ${formatCurrency(inputs.otherIncomeAnnual)} growing ${formatPercent(inputs.otherIncomeGrowthPct)} a year`,
    inputs.staffCostMode === 'detailed'
      ? `Staff: ${formatNumber(inputs.teachingStaffCurrent)} teaching at ${formatCurrency(inputs.avgTeachingSalary)}, ${formatNumber(inputs.supportStaffCurrent)} support at ${formatCurrency(inputs.avgSupportSalary)}, on-costs ${formatPercent(inputs.onCostRatePct, 0)}`
      : `Staff: total cost ${formatCurrency(inputs.totalStaffCostAnnual)}`,
    `Pay awards: ${inputs.payIncreasePctByYear.map((r) => formatPercent(r)).join(' / ')}`,
    `Non-staff costs: ${formatCurrency(nonStaffTotal)} · inflation ${inputs.inflationPctByYear.map((r) => formatPercent(r)).join(' / ')}`,
    `Capital & loans: ${formatCurrency(inputs.capitalAnnual)} a year · Opening reserves: ${formatCurrency(inputs.openingReserves)}`,
  ]

  doc.setFontSize(12)
  doc.text('Assumptions', 14, 32)
  doc.setFontSize(9)
  assumptions.forEach((line, index) => {
    doc.text(line, 14, 38 + index * 5)
  })

  const tableStartY = 38 + assumptions.length * 5 + 4
  autoTable(doc, {
    startY: tableStartY,
    head: [['Line', ...result.years.map((y) => y.label)]],
    body: [
      ['Pupils on roll', ...result.years.map((y) => formatNumber(y.pupils))],
      ['Gross fee income', ...result.years.map((y) => formatCurrency(y.grossFeeIncome))],
      ['Fee remissions', ...result.years.map((y) => `(${formatCurrency(y.totalRemissions)})`)],
      ['Other income', ...result.years.map((y) => formatCurrency(y.otherIncome))],
      ['Total income', ...result.years.map((y) => formatCurrency(y.totalIncome))],
      ['Staff costs', ...result.years.map((y) => formatCurrency(y.staffCosts))],
      ['Non-staff costs', ...result.years.map((y) => formatCurrency(y.nonStaffCosts))],
      ['Capital & loans', ...result.years.map((y) => formatCurrency(y.capital))],
      ['Total expenditure', ...result.years.map((y) => formatCurrency(y.totalExpenditure))],
      ['Surplus / (deficit)', ...result.years.map((y) => formatCurrency(y.surplus))],
      ['Closing reserves', ...result.years.map((y) => formatCurrency(y.closingReserves))],
      ['Staff costs % of income', ...result.years.map((y) => formatPercent(y.staffCostRatioPct))],
      ['Break-even pupils', ...result.years.map((y) => (y.breakEvenPupils !== null ? formatNumber(y.breakEvenPupils) : '-'))],
    ],
    styles: { fontSize: 8 },
    headStyles: { fillColor: [25, 118, 210] },
  })

  let currentY = (doc as unknown as { lastAutoTable?: { finalY?: number } }).lastAutoTable?.finalY ?? tableStartY

  const deficits = projected.filter((y) => y.surplus < 0)
  doc.setFontSize(9)
  doc.text(
    deficits.length > 0
      ? `Note: deficit projected in ${deficits.map((y) => y.label).join(', ')}.`
      : 'All projected years are in surplus under these assumptions.',
    14,
    currentY + 6,
  )
  currentY += 10

  if (includeCharts) {
    for (const chart of charts) {
      if (!chart.element) {
        continue
      }

      const canvas = await html2canvas(chart.element, { backgroundColor: '#ffffff', scale: 2 })
      const imageData = canvas.toDataURL('image/png')
      const pageWidth = doc.internal.pageSize.getWidth()
      const margin = 14
      const maxWidth = Math.min(pageWidth - margin * 2, 180)
      const imageHeight = (canvas.height * maxWidth) / canvas.width
      const neededSpace = imageHeight + 12

      if (currentY + neededSpace > doc.internal.pageSize.getHeight() - margin) {
        doc.addPage()
        currentY = margin
      }

      doc.setFontSize(12)
      doc.text(chart.title, margin, currentY + 6)
      doc.addImage(imageData, 'PNG', margin, currentY + 10, maxWidth, imageHeight)
      currentY += imageHeight + 18
    }
  }

  doc.save('school-budget-plan.pdf')
}
