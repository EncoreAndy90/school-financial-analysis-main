import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Divider,
  FormControlLabel,
  MenuItem,
  Paper,
  Stack,
  Switch,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material'
import { ExpandMore } from '@mui/icons-material'
import type { ModelInputs, NonStaffCategories } from '../finance/types'
import { totalNonStaffFromCategories, withProjectionYears, yearLabels } from '../finance/model'
import { presets } from '../finance/presets'
import { formatCurrency } from '../finance/format'
import type { Scenario } from '../utils/scenarios'
import { LabelWithTooltip, NumberField } from './common'
import { YearGrid, type YearGridRow } from './YearGrid'

type AssumptionsPanelProps = {
  inputs: ModelInputs
  update: (patch: Partial<ModelInputs>) => void
  replaceInputs: (next: ModelInputs) => void
  scenarios: Scenario[]
  scenarioName: string
  setScenarioName: (name: string) => void
  selectedScenarioId: string
  setSelectedScenarioId: (id: string) => void
  onLoadScenario: () => void
  onSaveScenario: (mode: 'save' | 'saveAs') => void
  onDeleteScenario: () => void
  includeChartsInExport: boolean
  setIncludeChartsInExport: (value: boolean) => void
  onExportPdf: () => void
  onExportExcel: () => void
}

const setYearValue = (values: number[], index: number, value: number): number[] => {
  const next = [...values]
  next[index] = value
  return next
}

export const AssumptionsPanel = ({
  inputs,
  update,
  replaceInputs,
  scenarios,
  scenarioName,
  setScenarioName,
  selectedScenarioId,
  setSelectedScenarioId,
  onLoadScenario,
  onSaveScenario,
  onDeleteScenario,
  includeChartsInExport,
  setIncludeChartsInExport,
  onExportPdf,
  onExportExcel,
}: AssumptionsPanelProps) => {
  const projectedYearLabels = yearLabels(inputs).slice(1)

  const updateCategory = (key: keyof NonStaffCategories, value: number) => {
    update({ nonStaffCategories: { ...inputs.nonStaffCategories, [key]: value } })
  }

  const fillYears = (value: number) => inputs.pupilsByYear.map(() => value)

  const planningRows: YearGridRow[] = [
    {
      id: 'pupils',
      label: 'Pupils on roll',
      tooltip: 'Planned pupil numbers for each projected year.',
      values: inputs.pupilsByYear,
      onChange: (i, v) => update({ pupilsByYear: setYearValue(inputs.pupilsByYear, i, v) }),
      onFill: (v) => update({ pupilsByYear: fillYears(v) }),
      min: 0,
      step: 1,
    },
    {
      id: 'fee-increase',
      label: 'Fee increase %',
      tooltip: 'Fee increase applied at the start of each year. Can be 0 (freeze) or negative (cut).',
      values: inputs.feeIncreasePctByYear,
      onChange: (i, v) => update({ feeIncreasePctByYear: setYearValue(inputs.feeIncreasePctByYear, i, v) }),
      onFill: (v) => update({ feeIncreasePctByYear: fillYears(v) }),
      step: 0.5,
    },
    {
      id: 'pay-increase',
      label: 'Pay award %',
      tooltip: 'Annual pay award applied to all staff salaries. Can be 0 or negative.',
      values: inputs.payIncreasePctByYear,
      onChange: (i, v) => update({ payIncreasePctByYear: setYearValue(inputs.payIncreasePctByYear, i, v) }),
      onFill: (v) => update({ payIncreasePctByYear: fillYears(v) }),
      step: 0.5,
    },
    {
      id: 'inflation',
      label: 'Cost inflation %',
      tooltip: 'Inflation applied to non-staff running costs each year.',
      values: inputs.inflationPctByYear,
      onChange: (i, v) => update({ inflationPctByYear: setYearValue(inputs.inflationPctByYear, i, v) }),
      onFill: (v) => update({ inflationPctByYear: fillYears(v) }),
      step: 0.5,
    },
    ...(inputs.staffCostMode === 'detailed'
      ? [
          {
            id: 'teaching-staff',
            label: 'Teaching staff (FTE)',
            tooltip: 'Planned teaching headcount for each projected year.',
            values: inputs.teachingStaffByYear,
            onChange: (i: number, v: number) =>
              update({ teachingStaffByYear: setYearValue(inputs.teachingStaffByYear, i, v) }),
            onFill: (v: number) => update({ teachingStaffByYear: fillYears(v) }),
            min: 0,
            step: 0.5,
          },
          {
            id: 'support-staff',
            label: 'Support staff (FTE)',
            tooltip: 'Planned support-staff headcount for each projected year.',
            values: inputs.supportStaffByYear,
            onChange: (i: number, v: number) =>
              update({ supportStaffByYear: setYearValue(inputs.supportStaffByYear, i, v) }),
            onFill: (v: number) => update({ supportStaffByYear: fillYears(v) }),
            min: 0,
            step: 0.5,
          },
        ]
      : []),
  ]

  return (
    <Stack spacing={2}>
      <Accordion defaultExpanded={false}>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <LabelWithTooltip
            label="Scenarios & presets"
            tooltip="Save, load and manage named sets of assumptions, or start from a template."
          />
        </AccordionSummary>
        <AccordionDetails>
          <Stack spacing={2}>
            <TextField
              select
              size="small"
              label="Saved scenarios"
              value={selectedScenarioId}
              onChange={(e) => {
                const nextId = e.target.value
                setSelectedScenarioId(nextId)
                const scenario = scenarios.find((item) => item.id === nextId)
                setScenarioName(scenario?.name ?? '')
              }}
              fullWidth
            >
              <MenuItem value="">None</MenuItem>
              {scenarios.map((scenario) => (
                <MenuItem key={scenario.id} value={scenario.id}>
                  {scenario.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              size="small"
              label="Scenario name"
              value={scenarioName}
              onChange={(e) => setScenarioName(e.target.value)}
              fullWidth
            />
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Button variant="outlined" size="small" onClick={onLoadScenario} disabled={!selectedScenarioId}>
                Load
              </Button>
              <Button variant="contained" size="small" onClick={() => onSaveScenario('save')}>
                Save
              </Button>
              <Button variant="outlined" size="small" onClick={() => onSaveScenario('saveAs')}>
                Save as
              </Button>
              <Button
                variant="text"
                size="small"
                color="error"
                onClick={onDeleteScenario}
                disabled={!selectedScenarioId}
              >
                Delete
              </Button>
            </Stack>
            <Divider />
            <Typography variant="subtitle2">Presets</Typography>
            {presets.map((preset) => (
              <Paper key={preset.id} variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
                <Stack spacing={1}>
                  <Box>
                    <Typography variant="subtitle2">{preset.label}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {preset.description}
                    </Typography>
                  </Box>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => {
                      replaceInputs(preset.build())
                      setSelectedScenarioId('')
                      setScenarioName(preset.label)
                    }}
                  >
                    Apply
                  </Button>
                </Stack>
              </Paper>
            ))}
          </Stack>
        </AccordionDetails>
      </Accordion>

      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <LabelWithTooltip
            label="School setup"
            tooltip="Basic settings: school name, academic year, planning horizon and billing terms."
          />
        </AccordionSummary>
        <AccordionDetails>
          <Stack spacing={2}>
            <TextField
              size="small"
              label="School name"
              value={inputs.schoolName}
              onChange={(e) => update({ schoolName: e.target.value })}
              fullWidth
            />
            <TextField
              size="small"
              label={<LabelWithTooltip label="Current academic year" tooltip='Label of the current budget year, e.g. "2025/26". Future years are labelled automatically.' />}
              value={inputs.firstYearLabel}
              onChange={(e) => update({ firstYearLabel: e.target.value })}
              fullWidth
            />
            <TextField
              select
              size="small"
              label={<LabelWithTooltip label="Projection horizon" tooltip="How many future years to project beyond the current year." />}
              value={inputs.projectionYears}
              onChange={(e) => replaceInputs(withProjectionYears(inputs, Number(e.target.value)))}
              fullWidth
            >
              {[1, 2, 3, 4, 5].map((years) => (
                <MenuItem key={years} value={years}>
                  {years} year{years > 1 ? 's' : ''}
                </MenuItem>
              ))}
            </TextField>
            <NumberField
              label="Billing terms per year"
              tooltip="Number of times the termly fee is billed each year (3 for a standard UK school year)."
              value={inputs.termsPerYear}
              onChange={(v) => update({ termsPerYear: v })}
              min={1}
              max={12}
              step={1}
              size="small"
            />
          </Stack>
        </AccordionDetails>
      </Accordion>

      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <LabelWithTooltip
            label="Pupils, fees & remissions"
            tooltip="Current roll, headline fee and fee remissions (discounts, bursaries and scholarships)."
          />
        </AccordionSummary>
        <AccordionDetails>
          <Stack spacing={2}>
            <NumberField
              label="Pupils on roll (current year)"
              tooltip="Total pupils currently on roll."
              value={inputs.currentPupils}
              onChange={(v) => update({ currentPupils: v })}
              min={0}
              step={1}
              size="small"
            />
            <NumberField
              label="Fee per pupil per term"
              tooltip="Current headline termly fee before any discounts or remissions."
              value={inputs.currentFeePerTerm}
              onChange={(v) => update({ currentFeePerTerm: v })}
              min={0}
              prefix="£"
              size="small"
            />
            <Divider textAlign="left">
              <Typography variant="caption" color="text.secondary">
                Fee remissions
              </Typography>
            </Divider>
            <NumberField
              label="Staff children on roll"
              tooltip="Number of pupils who are children of staff."
              value={inputs.staffChildren}
              onChange={(v) => update({ staffChildren: v })}
              min={0}
              step={1}
              size="small"
            />
            <NumberField
              label="Staff child discount"
              tooltip="Fee discount applied to staff children."
              value={inputs.staffChildDiscountPct}
              onChange={(v) => update({ staffChildDiscountPct: v })}
              min={0}
              max={100}
              suffix="%"
              size="small"
            />
            <NumberField
              label="Bursary / scholarship pupils"
              tooltip="Number of pupils receiving means-tested bursaries, scholarships or other awards."
              value={inputs.bursaryPupils}
              onChange={(v) => update({ bursaryPupils: v })}
              min={0}
              step={1}
              size="small"
            />
            <NumberField
              label="Average bursary remission"
              tooltip="Average percentage of the fee remitted for bursary and scholarship pupils."
              value={inputs.bursaryAvgDiscountPct}
              onChange={(v) => update({ bursaryAvgDiscountPct: v })}
              min={0}
              max={100}
              suffix="%"
              size="small"
            />
          </Stack>
        </AccordionDetails>
      </Accordion>

      <Accordion defaultExpanded={false}>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <LabelWithTooltip
            label="Other income"
            tooltip="Non-fee income: lettings, catering, trips, registration fees, grants and donations."
          />
        </AccordionSummary>
        <AccordionDetails>
          <Stack spacing={2}>
            <NumberField
              label="Other income (annual)"
              tooltip="Total annual non-fee income in the current year."
              value={inputs.otherIncomeAnnual}
              onChange={(v) => update({ otherIncomeAnnual: v })}
              min={0}
              prefix="£"
              size="small"
            />
            <NumberField
              label="Other income growth"
              tooltip="Expected annual growth in non-fee income."
              value={inputs.otherIncomeGrowthPct}
              onChange={(v) => update({ otherIncomeGrowthPct: v })}
              suffix="%"
              step={0.5}
              size="small"
            />
          </Stack>
        </AccordionDetails>
      </Accordion>

      <Accordion defaultExpanded={false}>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <LabelWithTooltip
            label="Staff costs"
            tooltip="Your largest cost. Enter a known total, or build it from headcount, salaries and employer on-costs."
          />
        </AccordionSummary>
        <AccordionDetails>
          <Stack spacing={2}>
            <ToggleButtonGroup
              value={inputs.staffCostMode}
              exclusive
              size="small"
              fullWidth
              onChange={(_, value) => value && update({ staffCostMode: value })}
            >
              <ToggleButton value="detailed">Headcount × salary</ToggleButton>
              <ToggleButton value="total">Known total</ToggleButton>
            </ToggleButtonGroup>
            {inputs.staffCostMode === 'total' ? (
              <NumberField
                label="Total annual staff cost"
                tooltip="Total staff cost including employer NI and pension contributions, from your accounts or budget."
                value={inputs.totalStaffCostAnnual}
                onChange={(v) => update({ totalStaffCostAnnual: v })}
                min={0}
                prefix="£"
                size="small"
                helperText="Grown each year by the pay award %."
              />
            ) : (
              <>
                <NumberField
                  label="Teaching staff (FTE, current)"
                  tooltip="Full-time-equivalent teaching staff this year."
                  value={inputs.teachingStaffCurrent}
                  onChange={(v) => update({ teachingStaffCurrent: v })}
                  min={0}
                  step={0.5}
                  size="small"
                />
                <NumberField
                  label="Average teaching salary"
                  tooltip="Average gross annual salary per teaching FTE (before on-costs)."
                  value={inputs.avgTeachingSalary}
                  onChange={(v) => update({ avgTeachingSalary: v })}
                  min={0}
                  prefix="£"
                  size="small"
                />
                <NumberField
                  label="Support staff (FTE, current)"
                  tooltip="Full-time-equivalent support and operational staff this year."
                  value={inputs.supportStaffCurrent}
                  onChange={(v) => update({ supportStaffCurrent: v })}
                  min={0}
                  step={0.5}
                  size="small"
                />
                <NumberField
                  label="Average support salary"
                  tooltip="Average gross annual salary per support FTE (before on-costs)."
                  value={inputs.avgSupportSalary}
                  onChange={(v) => update({ avgSupportSalary: v })}
                  min={0}
                  prefix="£"
                  size="small"
                />
                <NumberField
                  label="Employer on-costs"
                  tooltip="Employer National Insurance plus pension contributions as a percentage of gross salary. Typically 25–30% with the Teachers' Pension Scheme."
                  value={inputs.onCostRatePct}
                  onChange={(v) => update({ onCostRatePct: v })}
                  min={0}
                  max={100}
                  suffix="%"
                  size="small"
                />
              </>
            )}
          </Stack>
        </AccordionDetails>
      </Accordion>

      <Accordion defaultExpanded={false}>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <LabelWithTooltip
            label="Non-staff costs"
            tooltip="Running costs other than staff: premises, catering, teaching resources, admin and other."
          />
        </AccordionSummary>
        <AccordionDetails>
          <Stack spacing={2}>
            <ToggleButtonGroup
              value={inputs.nonStaffCostMode}
              exclusive
              size="small"
              fullWidth
              onChange={(_, value) => value && update({ nonStaffCostMode: value })}
            >
              <ToggleButton value="categories">By category</ToggleButton>
              <ToggleButton value="total">Known total</ToggleButton>
            </ToggleButtonGroup>
            {inputs.nonStaffCostMode === 'total' ? (
              <NumberField
                label="Total non-staff costs (annual)"
                tooltip="Total annual running costs excluding staff, from your accounts or budget."
                value={inputs.totalNonStaffAnnual}
                onChange={(v) => update({ totalNonStaffAnnual: v })}
                min={0}
                prefix="£"
                size="small"
              />
            ) : (
              <>
                <NumberField
                  label="Premises & maintenance"
                  tooltip="Buildings, utilities, cleaning, grounds and routine maintenance."
                  value={inputs.nonStaffCategories.premises}
                  onChange={(v) => updateCategory('premises', v)}
                  min={0}
                  prefix="£"
                  size="small"
                />
                <NumberField
                  label="Catering"
                  tooltip="Catering costs (in-house or contracted)."
                  value={inputs.nonStaffCategories.catering}
                  onChange={(v) => updateCategory('catering', v)}
                  min={0}
                  prefix="£"
                  size="small"
                />
                <NumberField
                  label="Teaching resources"
                  tooltip="Books, equipment, ICT, sports and departmental budgets."
                  value={inputs.nonStaffCategories.teachingResources}
                  onChange={(v) => updateCategory('teachingResources', v)}
                  min={0}
                  prefix="£"
                  size="small"
                />
                <NumberField
                  label="Admin & professional fees"
                  tooltip="Insurance, audit, legal, marketing, software and office costs."
                  value={inputs.nonStaffCategories.adminAndProfessional}
                  onChange={(v) => updateCategory('adminAndProfessional', v)}
                  min={0}
                  prefix="£"
                  size="small"
                />
                <NumberField
                  label="Other running costs"
                  tooltip="Anything not covered by the categories above."
                  value={inputs.nonStaffCategories.other}
                  onChange={(v) => updateCategory('other', v)}
                  min={0}
                  prefix="£"
                  size="small"
                />
                <Typography variant="body2" color="text.secondary">
                  Category total: {formatCurrency(totalNonStaffFromCategories(inputs))}
                </Typography>
              </>
            )}
          </Stack>
        </AccordionDetails>
      </Accordion>

      <Accordion defaultExpanded={false}>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <LabelWithTooltip
            label="Capital & reserves"
            tooltip="Capital spending plans and the reserves position the projection starts from."
          />
        </AccordionSummary>
        <AccordionDetails>
          <Stack spacing={2}>
            <NumberField
              label="Capital spend / loan repayments (annual)"
              tooltip="Planned annual capital expenditure and loan repayments, held flat across the projection."
              value={inputs.capitalAnnual}
              onChange={(v) => update({ capitalAnnual: v })}
              min={0}
              prefix="£"
              size="small"
            />
            <NumberField
              label="Opening free reserves"
              tooltip="Unrestricted reserves (cash you could draw on) at the start of the current year. Can be negative."
              value={inputs.openingReserves}
              onChange={(v) => update({ openingReserves: v })}
              prefix="£"
              size="small"
            />
            <NumberField
              label="Reserves policy target"
              tooltip="Minimum reserves your policy requires, expressed as months of total expenditure. Set 0 to disable the check."
              value={inputs.minReservesMonths}
              onChange={(v) => update({ minReservesMonths: v })}
              min={0}
              max={24}
              step={0.5}
              suffix="months"
              size="small"
            />
          </Stack>
        </AccordionDetails>
      </Accordion>

      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <LabelWithTooltip
            label="Year-by-year plan"
            tooltip="Per-year planning assumptions. Use the copy button to fill a value across all years."
          />
        </AccordionSummary>
        <AccordionDetails sx={{ px: 1 }}>
          <YearGrid yearLabels={projectedYearLabels} rows={planningRows} />
        </AccordionDetails>
      </Accordion>

      <Accordion defaultExpanded={false}>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <LabelWithTooltip label="Export" tooltip="Download the plan as a PDF board report or Excel workbook." />
        </AccordionSummary>
        <AccordionDetails>
          <Stack spacing={2}>
            <FormControlLabel
              control={
                <Switch
                  checked={includeChartsInExport}
                  onChange={(e) => setIncludeChartsInExport(e.target.checked)}
                  color="primary"
                />
              }
              label={<LabelWithTooltip label="Include charts in PDF" tooltip="Adds images of the charts after the tables in the PDF export." />}
            />
            <Stack direction="row" spacing={1}>
              <Button variant="outlined" size="small" onClick={onExportPdf}>
                Export PDF
              </Button>
              <Button variant="outlined" size="small" onClick={onExportExcel}>
                Export Excel
              </Button>
            </Stack>
          </Stack>
        </AccordionDetails>
      </Accordion>
    </Stack>
  )
}
