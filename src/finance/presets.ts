import { defaultInputs, withProjectionYears } from './model'
import type { ModelInputs } from './types'

export type Preset = {
  id: string
  label: string
  description: string
  build: () => ModelInputs
}

export const presets: Preset[] = [
  {
    id: 'baseline',
    label: 'Steady state',
    description: 'Stable roll, fee increases slightly ahead of pay awards and inflation.',
    build: () => defaultInputs(),
  },
  {
    id: 'growth',
    label: 'Growth plan',
    description: 'Roll grows each year with additional teaching staff recruited to match.',
    build: () => {
      const inputs = defaultInputs()
      return withProjectionYears(
        {
          ...inputs,
          pupilsByYear: [210, 225, 240],
          feeIncreasePctByYear: [4.5, 4.5, 4.5],
          teachingStaffByYear: [36, 38, 40],
          supportStaffByYear: [26, 27, 28],
          payIncreasePctByYear: [3, 3, 3],
        },
        3,
      )
    },
  },
  {
    id: 'cost-pressure',
    label: 'Cost pressure',
    description: 'Higher pay awards and inflation with fee increases held back for affordability.',
    build: () => {
      const inputs = defaultInputs()
      return withProjectionYears(
        {
          ...inputs,
          feeIncreasePctByYear: [2.5, 2.5, 3],
          payIncreasePctByYear: [5, 4.5, 4],
          inflationPctByYear: [4.5, 4, 3.5],
          otherIncomeGrowthPct: 1,
        },
        3,
      )
    },
  },
  {
    id: 'falling-roll',
    label: 'Falling roll',
    description: 'Pupil numbers decline; tests how quickly reserves are consumed without action.',
    build: () => {
      const inputs = defaultInputs()
      return withProjectionYears(
        {
          ...inputs,
          pupilsByYear: [190, 178, 165],
          feeIncreasePctByYear: [3.5, 3.5, 3.5],
          payIncreasePctByYear: [3.5, 3.5, 3.5],
          inflationPctByYear: [3, 3, 3],
        },
        3,
      )
    },
  },
]
