import { Box, Card, CardContent, Typography } from '@mui/material'
import type { ProjectionResult } from '../finance/types'
import { formatCurrency, formatNumber, formatPercent } from '../finance/format'

type Kpi = {
  label: string
  value: string
  detail: string
  tone?: 'positive' | 'negative' | 'neutral'
}

export const KpiCards = ({ result }: { result: ProjectionResult }) => {
  const current = result.years[0]
  const final = result.years[result.years.length - 1]

  const kpis: Kpi[] = [
    {
      label: `Surplus / (deficit) — ${current.label}`,
      value: formatCurrency(current.surplus),
      detail: `Margin ${formatPercent(current.operatingMarginPct)} of income`,
      tone: current.surplus >= 0 ? 'positive' : 'negative',
    },
    {
      label: `Surplus / (deficit) — ${final.label}`,
      value: formatCurrency(final.surplus),
      detail: `Margin ${formatPercent(final.operatingMarginPct)} of income`,
      tone: final.surplus >= 0 ? 'positive' : 'negative',
    },
    {
      label: `Closing reserves — ${final.label}`,
      value: formatCurrency(final.closingReserves),
      detail: final.totalExpenditure > 0
        ? `${formatNumber((final.closingReserves / final.totalExpenditure) * 12)} months of expenditure`
        : '',
      tone: final.closingReserves >= 0 ? 'positive' : 'negative',
    },
    {
      label: `Staff costs % of income — ${final.label}`,
      value: formatPercent(final.staffCostRatioPct),
      detail: 'Sector benchmark 60–75%',
      tone: final.staffCostRatioPct > 75 ? 'negative' : 'neutral',
    },
    {
      label: `Break-even pupils — ${final.label}`,
      value: final.breakEvenPupils !== null ? formatNumber(final.breakEvenPupils) : '—',
      detail: `Planned roll: ${formatNumber(final.pupils)} pupils`,
      tone:
        final.breakEvenPupils !== null && final.pupils < final.breakEvenPupils
          ? 'negative'
          : 'neutral',
    },
    {
      label: `Cost per pupil — ${final.label}`,
      value: formatCurrency(final.costPerPupil),
      detail: `Income per pupil: ${formatCurrency(final.incomePerPupil)}`,
      tone: 'neutral',
    },
  ]

  return (
    <Box
      sx={{
        display: 'grid',
        gap: 2,
        gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: '1fr 1fr 1fr' },
      }}
    >
      {kpis.map((kpi) => (
        <Card key={kpi.label}>
          <CardContent>
            <Typography color="text.secondary" gutterBottom variant="body2">
              {kpi.label}
            </Typography>
            <Typography
              variant="h6"
              color={
                kpi.tone === 'positive'
                  ? 'success.main'
                  : kpi.tone === 'negative'
                    ? 'error.main'
                    : 'text.primary'
              }
            >
              {kpi.value}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {kpi.detail}
            </Typography>
          </CardContent>
        </Card>
      ))}
    </Box>
  )
}
