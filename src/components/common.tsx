import { useState } from 'react'
import { Box, InputAdornment, TextField, Tooltip } from '@mui/material'
import { InfoOutlined } from '@mui/icons-material'

export const LabelWithTooltip = ({ label, tooltip }: { label: string; tooltip: string }) => (
  <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
    <span>{label}</span>
    <Tooltip title={tooltip} arrow>
      <InfoOutlined sx={{ fontSize: '0.9rem', color: 'text.secondary', cursor: 'help' }} />
    </Tooltip>
  </Box>
)

type NumberFieldProps = {
  label: string
  tooltip?: string
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  prefix?: string
  suffix?: string
  helperText?: string
  size?: 'small' | 'medium'
  fullWidth?: boolean
}

/**
 * Numeric input that tolerates in-progress edits (empty field, minus sign)
 * without pushing NaN into the model, and clamps to min/max on blur.
 */
export const NumberField = ({
  label,
  tooltip,
  value,
  onChange,
  min,
  max,
  step,
  prefix,
  suffix,
  helperText,
  size = 'medium',
  fullWidth = true,
}: NumberFieldProps) => {
  const [text, setText] = useState<string>(String(value))
  const [lastPushed, setLastPushed] = useState(value)
  const [focused, setFocused] = useState(false)

  // Sync with external changes (scenario load, preset apply) while the field
  // is not being edited, using the "adjust state during render" pattern.
  if (!focused && value !== lastPushed) {
    setLastPushed(value)
    setText(String(value))
  }

  const clamp = (raw: number): number => {
    let next = raw
    if (min !== undefined) next = Math.max(min, next)
    if (max !== undefined) next = Math.min(max, next)
    return next
  }

  const handleChange = (raw: string) => {
    setText(raw)
    const parsed = Number(raw)
    if (raw.trim() !== '' && Number.isFinite(parsed)) {
      const clamped = clamp(parsed)
      setLastPushed(clamped)
      onChange(clamped)
    }
  }

  const handleBlur = () => {
    setFocused(false)
    const parsed = Number(text)
    const next = text.trim() !== '' && Number.isFinite(parsed) ? clamp(parsed) : clamp(0)
    setLastPushed(next)
    onChange(next)
    setText(String(next))
  }

  return (
    <TextField
      label={tooltip ? <LabelWithTooltip label={label} tooltip={tooltip} /> : label}
      type="number"
      value={text}
      onChange={(e) => handleChange(e.target.value)}
      onFocus={() => setFocused(true)}
      onBlur={handleBlur}
      helperText={helperText}
      size={size}
      fullWidth={fullWidth}
      inputProps={{ step }}
      InputProps={{
        startAdornment: prefix ? <InputAdornment position="start">{prefix}</InputAdornment> : undefined,
        endAdornment: suffix ? <InputAdornment position="end">{suffix}</InputAdornment> : undefined,
      }}
    />
  )
}
