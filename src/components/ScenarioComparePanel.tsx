import { useMemo, useState } from 'react'
import {
  Card,
  CardContent,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material'
import type { ProjectionResult, YearProjection } from '../finance/types'
import { buildProjection } from '../finance/model'
import { formatCurrency, formatCurrencyDelta, formatNumber, formatPercent } from '../finance/format'
import type { Scenario } from '../utils/scenarios'

type ScenarioComparePanelProps = {
  currentResult: ProjectionResult
  scenarios: Scenario[]
}

type CompareRow = {
  id: string
  label: string
  current: string
  other: string
  delta?: string
  deltaPositive?: boolean
}

const finalYear = (result: ProjectionResult): YearProjection => result.years[result.years.length - 1]

export const ScenarioComparePanel = ({ currentResult, scenarios }: ScenarioComparePanelProps) => {
  const [compareScenarioId, setCompareScenarioId] = useState('')

  const compareScenario = scenarios.find((scenario) => scenario.id === compareScenarioId)
  const compareResult = useMemo(
    () => (compareScenario ? buildProjection(compareScenario.state) : null),
    [compareScenario],
  )

  const rows: CompareRow[] = useMemo(() => {
    if (!compareResult) {
      return []
    }

    const current = finalYear(currentResult)
    const other = finalYear(compareResult)

    return [
      {
        id: 'pupils',
        label: 'Pupils on roll',
        current: formatNumber(current.pupils),
        other: formatNumber(other.pupils),
      },
      {
        id: 'income',
        label: 'Total income',
        current: formatCurrency(current.totalIncome),
        other: formatCurrency(other.totalIncome),
        delta: formatCurrencyDelta(other.totalIncome - current.totalIncome),
        deltaPositive: other.totalIncome >= current.totalIncome,
      },
      {
        id: 'expenditure',
        label: 'Total expenditure',
        current: formatCurrency(current.totalExpenditure),
        other: formatCurrency(other.totalExpenditure),
        delta: formatCurrencyDelta(other.totalExpenditure - current.totalExpenditure),
        deltaPositive: other.totalExpenditure <= current.totalExpenditure,
      },
      {
        id: 'surplus',
        label: 'Surplus / (deficit)',
        current: formatCurrency(current.surplus),
        other: formatCurrency(other.surplus),
        delta: formatCurrencyDelta(other.surplus - current.surplus),
        deltaPositive: other.surplus >= current.surplus,
      },
      {
        id: 'reserves',
        label: 'Closing reserves',
        current: formatCurrency(current.closingReserves),
        other: formatCurrency(other.closingReserves),
        delta: formatCurrencyDelta(other.closingReserves - current.closingReserves),
        deltaPositive: other.closingReserves >= current.closingReserves,
      },
      {
        id: 'staff-ratio',
        label: 'Staff costs % of income',
        current: formatPercent(current.staffCostRatioPct),
        other: formatPercent(other.staffCostRatioPct),
      },
    ]
  }, [compareResult, currentResult])

  return (
    <Card elevation={3}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Scenario comparison
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Compare the final projected year of the plan on screen against a saved scenario.
        </Typography>
        <TextField
          select
          size="small"
          label="Compare against saved scenario"
          value={compareScenarioId}
          onChange={(e) => setCompareScenarioId(e.target.value)}
          sx={{ minWidth: 280, mb: 2 }}
        >
          <MenuItem value="">None</MenuItem>
          {scenarios.map((scenario) => (
            <MenuItem key={scenario.id} value={scenario.id}>
              {scenario.name}
            </MenuItem>
          ))}
        </TextField>
        {compareResult && compareScenario ? (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Final year</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>Current plan</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>{compareScenario.name}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>Difference</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.id} hover>
                    <TableCell>{row.label}</TableCell>
                    <TableCell align="right">{row.current}</TableCell>
                    <TableCell align="right">{row.other}</TableCell>
                    <TableCell
                      align="right"
                      sx={
                        row.delta !== undefined
                          ? { color: row.deltaPositive ? 'success.main' : 'error.main' }
                          : undefined
                      }
                    >
                      {row.delta ?? '—'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Typography variant="body2" color="text.secondary">
            {scenarios.length === 0
              ? 'Save a scenario first, then pick it here to compare.'
              : 'Pick a saved scenario to see a side-by-side comparison.'}
          </Typography>
        )}
      </CardContent>
    </Card>
  )
}
