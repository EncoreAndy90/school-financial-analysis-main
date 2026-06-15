import type { ReactNode } from 'react'
import { Info } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

export const InfoLabel = ({
  label,
  tooltip,
  className,
}: {
  label: ReactNode
  tooltip: string
  className?: string
}) => (
  <span className={cn('inline-flex items-center gap-1', className)}>
    <span>{label}</span>
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          tabIndex={-1}
          aria-label="More information"
          className="inline-flex cursor-help text-muted-foreground hover:text-foreground"
        >
          <Info className="h-3.5 w-3.5" />
        </button>
      </TooltipTrigger>
      <TooltipContent>{tooltip}</TooltipContent>
    </Tooltip>
  </span>
)

export const NumberField = ({
  label,
  tooltip,
  icon,
  value,
  onChange,
  helper,
}: {
  label: string
  tooltip: string
  icon?: ReactNode
  value: number
  onChange: (value: number) => void
  helper?: string
}) => (
  <div className="space-y-1.5">
    <Label>
      <InfoLabel label={label} tooltip={tooltip} />
    </Label>
    <div className="relative">
      {icon && (
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground [&_svg]:h-4 [&_svg]:w-4">
          {icon}
        </span>
      )}
      <Input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className={icon ? 'pl-9' : undefined}
      />
    </div>
    {helper && <p className="text-xs text-muted-foreground">{helper}</p>}
  </div>
)

export const SliderField = ({
  label,
  tooltip,
  value,
  onChange,
  min,
  max,
  step,
  suffix = '%',
}: {
  label: string
  tooltip: string
  value: number
  onChange: (value: number) => void
  min: number
  max: number
  step: number
  suffix?: string
}) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between">
      <Label>
        <InfoLabel label={label} tooltip={tooltip} />
      </Label>
      <span className="text-sm font-semibold tabular-nums text-primary">
        {value}
        {suffix}
      </span>
    </div>
    <Slider
      value={[value]}
      onValueChange={([next]) => onChange(next)}
      min={min}
      max={max}
      step={step}
    />
  </div>
)

export const SwitchField = ({
  label,
  tooltip,
  checked,
  onCheckedChange,
}: {
  label: string
  tooltip: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
}) => (
  <div className="flex items-center justify-between gap-3 rounded-lg border bg-muted/40 px-3 py-2">
    <Label className="cursor-pointer">
      <InfoLabel label={label} tooltip={tooltip} />
    </Label>
    <Switch checked={checked} onCheckedChange={onCheckedChange} />
  </div>
)
