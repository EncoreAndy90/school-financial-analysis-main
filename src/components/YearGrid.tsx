import { useState } from 'react'
import {
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
} from '@mui/material'
import { ContentCopy } from '@mui/icons-material'
import { LabelWithTooltip } from './common'

export type YearGridRow = {
  id: string
  label: string
  tooltip: string
  values: number[]
  onChange: (yearIndex: number, value: number) => void
  /** Replace the whole row with one value (used by the copy-across button). */
  onFill: (value: number) => void
  step?: number
  min?: number
}

type YearGridProps = {
  yearLabels: string[]
  rows: YearGridRow[]
}

type GridCellProps = {
  value: number
  onCommit: (value: number) => void
  min?: number
  step?: number
  ariaLabel: string
}

/** Compact numeric cell that tolerates in-progress edits without pushing NaN. */
const GridCell = ({ value, onCommit, min, step, ariaLabel }: GridCellProps) => {
  const [text, setText] = useState(String(value))
  const [lastPushed, setLastPushed] = useState(value)
  const [focused, setFocused] = useState(false)

  if (!focused && value !== lastPushed) {
    setLastPushed(value)
    setText(String(value))
  }

  const clamp = (raw: number) => (min !== undefined ? Math.max(min, raw) : raw)

  const commit = (raw: string) => {
    const parsed = Number(raw)
    if (raw.trim() !== '' && Number.isFinite(parsed)) {
      const next = clamp(parsed)
      setLastPushed(next)
      onCommit(next)
    }
  }

  return (
    <TextField
      type="number"
      size="small"
      value={text}
      onChange={(e) => {
        setText(e.target.value)
        commit(e.target.value)
      }}
      onFocus={() => setFocused(true)}
      onBlur={() => {
        setFocused(false)
        const parsed = Number(text)
        const next = text.trim() !== '' && Number.isFinite(parsed) ? clamp(parsed) : clamp(0)
        setLastPushed(next)
        onCommit(next)
        setText(String(next))
      }}
      inputProps={{
        step,
        style: { textAlign: 'right', paddingRight: 6, paddingLeft: 6 },
        'aria-label': ariaLabel,
      }}
      sx={{ width: 88 }}
    />
  )
}

/**
 * Compact assumptions grid: one row per planning driver, one column per
 * projected year, plus a "copy first year across" shortcut per row.
 */
export const YearGrid = ({ yearLabels, rows }: YearGridProps) => (
  <TableContainer>
    <Table size="small" sx={{ '& td, & th': { px: 0.5, py: 0.75, border: 0 } }}>
      <TableHead>
        <TableRow>
          <TableCell sx={{ minWidth: 120 }} />
          {yearLabels.map((label) => (
            <TableCell key={label} align="center" sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>
              {label}
            </TableCell>
          ))}
          <TableCell />
        </TableRow>
      </TableHead>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.id}>
            <TableCell sx={{ whiteSpace: 'nowrap' }}>
              <LabelWithTooltip label={row.label} tooltip={row.tooltip} />
            </TableCell>
            {row.values.map((value, yearIndex) => (
              <TableCell key={yearIndex} align="center">
                <GridCell
                  value={value}
                  onCommit={(next) => row.onChange(yearIndex, next)}
                  min={row.min}
                  step={row.step}
                  ariaLabel={`${row.label} ${yearLabels[yearIndex]}`}
                />
              </TableCell>
            ))}
            <TableCell>
              <Tooltip title="Copy the first year's value to every year" arrow>
                <IconButton
                  size="small"
                  aria-label={`Copy ${row.label} across all years`}
                  onClick={() => row.onFill(row.values[0] ?? 0)}
                >
                  <ContentCopy fontSize="inherit" />
                </IconButton>
              </Tooltip>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
)
