import {
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material'
import type { SensitivityRow } from '../finance/types'
import { formatCurrency, formatCurrencyDelta } from '../finance/format'

type SensitivityPanelProps = {
  rows: SensitivityRow[]
  finalYearLabel: string
}

export const SensitivityPanel = ({ rows, finalYearLabel }: SensitivityPanelProps) => (
  <Card elevation={3}>
    <CardContent>
      <Typography variant="h6" gutterBottom>
        Sensitivity analysis
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        How the {finalYearLabel} outturn changes if one assumption moves against (or for) you while everything
        else stays on plan.
      </Typography>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>What if…</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>Surplus ({finalYearLabel})</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>vs plan</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>Reserves ({finalYearLabel})</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>vs plan</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id} hover>
                <TableCell>
                  <Tooltip title={row.description} arrow>
                    <span style={{ cursor: 'help' }}>{row.label}</span>
                  </Tooltip>
                </TableCell>
                <TableCell align="right" sx={{ color: row.finalYearSurplus >= 0 ? 'success.main' : 'error.main' }}>
                  {formatCurrency(row.finalYearSurplus)}
                </TableCell>
                <TableCell align="right" sx={{ color: row.surplusDelta >= 0 ? 'success.main' : 'error.main' }}>
                  {formatCurrencyDelta(row.surplusDelta)}
                </TableCell>
                <TableCell align="right" sx={{ color: row.finalYearReserves >= 0 ? 'success.main' : 'error.main' }}>
                  {formatCurrency(row.finalYearReserves)}
                </TableCell>
                <TableCell align="right" sx={{ color: row.reservesDelta >= 0 ? 'success.main' : 'error.main' }}>
                  {formatCurrencyDelta(row.reservesDelta)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </CardContent>
  </Card>
)
