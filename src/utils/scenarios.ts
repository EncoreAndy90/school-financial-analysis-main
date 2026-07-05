import { defaultInputs, withProjectionYears } from '../finance/model'
import type { ModelInputs } from '../finance/types'

export type Scenario = {
  id: string
  name: string
  createdAt: string
  updatedAt: string
  version: number
  state: ModelInputs
}

const STORAGE_KEY = 'school-financial-analysis:scenarios'
const CURRENT_VERSION = 2

const safeJsonParse = <T>(value: string | null, fallback: T): T => {
  if (!value) {
    return fallback
  }

  try {
    return JSON.parse(value) as T
  } catch {
    return fallback
  }
}

/**
 * Fill any missing fields with defaults so scenarios saved by older builds of
 * v2 (or hand-edited storage) never produce undefined inputs.
 */
const normaliseState = (state: Partial<ModelInputs>): ModelInputs => {
  const merged: ModelInputs = {
    ...defaultInputs(),
    ...state,
    nonStaffCategories: {
      ...defaultInputs().nonStaffCategories,
      ...(state.nonStaffCategories ?? {}),
    },
  }
  return withProjectionYears(merged, merged.projectionYears)
}

export const loadScenarios = (): Scenario[] => {
  if (typeof window === 'undefined') {
    return []
  }

  return safeJsonParse<Scenario[]>(window.localStorage.getItem(STORAGE_KEY), [])
    .filter((scenario) => scenario && scenario.state && scenario.version === CURRENT_VERSION)
    .map((scenario) => ({ ...scenario, state: normaliseState(scenario.state) }))
}

export const saveScenarios = (scenarios: Scenario[]) => {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(scenarios))
}

export const createScenarioId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }

  return `scenario_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
}

export const createScenario = (name: string, state: ModelInputs): Scenario => {
  const now = new Date().toISOString()

  return {
    id: createScenarioId(),
    name,
    createdAt: now,
    updatedAt: now,
    version: CURRENT_VERSION,
    state,
  }
}
