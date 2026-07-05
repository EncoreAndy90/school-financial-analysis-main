import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import type { ProjectionResult, YearProjection } from '../finance/types'
import { formatCurrency, formatNumber, formatPercent } from '../finance/format'

type RowSpec = {
  id: string
  label: string
  render: (year: YearProjection) => string
  variant?: 'section' | 'total' | 'result'
  colored?: (year: YearProjection) => boolean
}

const rows: RowSpec[] = [
  { id: 'pupils', label: 'Pupils on roll', render: (y) => formatNumber(y.pupils) },
  { id: 'fee', label: 'Fee per term', render: (y) => formatCurrency(y.feePerTerm) },
  { id: 'gross-fees', label: 'Gross fee income', render: (y) => formatCurrency(y.grossFeeIncome) },
  { id: 'remissions', label: 'Fee remissions', render: (y) => `(${formatCurrency(y.totalRemissions)})` },
  { id: 'net-fees', label: 'Net fee income', render: (y) => formatCurrency(y.netFeeIncome) },
  { id: 'other-income', label: 'Other income', render: (y) => formatCurrency(y.otherIncome) },
  { id: 'total-income', label: 'Total income', render: (y) => formatCurrency(y.totalIncome), variant: 'total' },
  { id: 'staff', label: 'Staff costs (incl. on-costs)', render: (y) => formatCurrency(y.staffCosts) },
  { id: 'non-staff', label: 'Non-staff costs', render: (y) => formatCurrency(y.nonStaffCosts) },
  { id: 'capital', label: 'Capital & loan repayments', render: (y) => formatCurrency(y.capital) },
  {
    id: 'total-expenditure',
    label: 'Total expenditure',
    render: (y) => formatCurrency(y.totalExpenditure),
    variant: 'total',
  },
  {
    id: 'surplus',
    label: 'Surplus / (deficit)',
    render: (y) => formatCurrency(y.surplus),
    variant: 'result',
    colored: (y) => y.surplus >= 0,
  },
  {
    id: 'reserves',
    label: 'Closing reserves',
    render: (y) => formatCurrency(y.closingReserves),
    variant: 'result',
    colored: (y) => y.closingReserves >= 0,
  },
  { id: 'staff-ratio', label: 'Staff costs % of income', render: (y) => formatPercent(y.staffCostRatioPct) },
  { id: 'margin', label: 'Operating margin', render: (y) => formatPercent(y.operatingMarginPct) },
  {
    id: 'break-even',
    label: 'Break-even pupils',
    render: (y) => (y.breakEvenPupils !== null ? formatNumber(y.breakEvenPupils) : '—'),
  },
  {
    id: 'ptr',
    label: 'Pupil : teacher ratio',
    render: (y) => (y.pupilTeacherRatio !== null ? `${formatNumber(y.pupilTeacherRatio)} : 1` : '—'),
  },
]

export const ProjectionTable = ({ result }: { result: ProjectionResult }) => {
  const visibleRows = rows.filter(
    (row) => row.id !== 'ptr' || result.years.some((y) => y.pupilTeacherRatio !== null),
  )

  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 700 }}>Line</TableCell>
            {result.years.map((year) => (
              <TableCell key={year.index} align="right" sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>
                {year.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {visibleRows.map((row) => (
            <TableRow
              key={row.id}
              hover
              sx={
                row.variant === 'total'
                  ? { '& td': { fontWeight: 700, borderTop: '2px solid', borderTopColor: 'divider' } }
                  : row.variant === 'result'
                    ? { '& td': { fontWeight: 700 } }
                    : undefined
              }
            >
              <TableCell>{row.label}</TableCell>
              {result.years.map((year) => (
                <TableCell
                  key={year.index}
                  align="right"
                  sx={
                    row.colored
                      ? { color: row.colored(year) ? 'success.main' : 'error.main' }
                      : undefined
                  }
                >
                  {row.render(year)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
        Surplus / (deficit) and closing reserves are calculated from your income and expenditure inputs — they
        are never entered as assumptions.
      </Typography>
    </TableContainer>
  )
}
