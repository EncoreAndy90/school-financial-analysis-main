import type { RefObject } from 'react'
import { Box, Card, CardContent, Typography, useTheme } from '@mui/material'
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  LineChart,
  BarChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { ProjectionResult } from '../finance/types'
import { formatCompactCurrency, formatCurrency } from '../finance/format'

type ChartsPanelProps = {
  result: ProjectionResult
  incomeChartRef: RefObject<HTMLDivElement | null>
  reservesChartRef: RefObject<HTMLDivElement | null>
  costChartRef: RefObject<HTMLDivElement | null>
}

export const ChartsPanel = ({ result, incomeChartRef, reservesChartRef, costChartRef }: ChartsPanelProps) => {
  const theme = useTheme()
  const axisColor = theme.palette.text.secondary
  const gridColor = theme.palette.mode === 'dark' ? 'rgba(148, 163, 184, 0.25)' : 'rgba(15, 23, 42, 0.14)'
  const tooltipContentStyle = {
    backgroundColor: theme.palette.background.paper,
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: 8,
  }
  const tooltipTextStyle = { color: theme.palette.text.primary }

  const data = result.years.map((year) => ({
    label: year.label,
    income: Math.round(year.totalIncome),
    expenditure: Math.round(year.totalExpenditure),
    surplus: Math.round(year.surplus),
    reserves: Math.round(year.closingReserves),
    staffCosts: Math.round(year.staffCosts),
    nonStaffCosts: Math.round(year.nonStaffCosts),
    capital: Math.round(year.capital),
  }))

  const currencyTooltip = (value: unknown) => {
    const numeric = Array.isArray(value) ? Number(value[0]) : Number(value)
    return formatCurrency(Number.isFinite(numeric) ? numeric : 0)
  }

  return (
    <>
      <Card elevation={3}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Income vs expenditure
          </Typography>
          <Box ref={incomeChartRef}>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey="label" tick={{ fill: axisColor, fontSize: 12 }} />
                <YAxis tick={{ fill: axisColor, fontSize: 12 }} tickFormatter={formatCompactCurrency} />
                <Tooltip
                  formatter={currencyTooltip}
                  contentStyle={tooltipContentStyle}
                  labelStyle={tooltipTextStyle}
                  itemStyle={tooltipTextStyle}
                />
                <Legend />
                <Bar dataKey="income" name="Total income" fill="#2e7d32" />
                <Bar dataKey="expenditure" name="Total expenditure" fill="#d32f2f" />
                <Line type="monotone" dataKey="surplus" name="Surplus / (deficit)" stroke="#1976d2" strokeWidth={2} />
                <ReferenceLine y={0} stroke={axisColor} />
              </ComposedChart>
            </ResponsiveContainer>
          </Box>
        </CardContent>
      </Card>

      <Card elevation={3}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Free reserves
          </Typography>
          <Box ref={reservesChartRef}>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey="label" tick={{ fill: axisColor, fontSize: 12 }} />
                <YAxis tick={{ fill: axisColor, fontSize: 12 }} tickFormatter={formatCompactCurrency} />
                <Tooltip
                  formatter={currencyTooltip}
                  contentStyle={tooltipContentStyle}
                  labelStyle={tooltipTextStyle}
                  itemStyle={tooltipTextStyle}
                />
                <Legend />
                <ReferenceLine y={0} stroke="#d32f2f" strokeDasharray="4 4" label={{ value: 'Zero', fill: axisColor, fontSize: 11 }} />
                <Line type="monotone" dataKey="reserves" name="Closing reserves" stroke="#9c27b0" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        </CardContent>
      </Card>

      <Card elevation={3}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Expenditure composition
          </Typography>
          <Box ref={costChartRef}>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey="label" tick={{ fill: axisColor, fontSize: 12 }} />
                <YAxis tick={{ fill: axisColor, fontSize: 12 }} tickFormatter={formatCompactCurrency} />
                <Tooltip
                  formatter={currencyTooltip}
                  contentStyle={tooltipContentStyle}
                  labelStyle={tooltipTextStyle}
                  itemStyle={tooltipTextStyle}
                />
                <Legend />
                <Bar dataKey="staffCosts" name="Staff costs" stackId="costs" fill="#1976d2" />
                <Bar dataKey="nonStaffCosts" name="Non-staff costs" stackId="costs" fill="#ed6c02" />
                <Bar dataKey="capital" name="Capital & loans" stackId="costs" fill="#757575" />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </CardContent>
      </Card>
    </>
  )
}
