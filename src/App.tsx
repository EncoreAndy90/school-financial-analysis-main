import { useEffect, useMemo, useRef, useState } from 'react'
import {
  AppBar,
  Box,
  Card,
  CardContent,
  Chip,
  Container,
  CssBaseline,
  Stack,
  Switch,
  ThemeProvider,
  Toolbar,
  Typography,
  createTheme,
} from '@mui/material'
import { AccountBalance, Assessment, DarkMode, LightMode } from '@mui/icons-material'
import './App.css'
import { buildProjection, defaultInputs, runSensitivity } from './finance/model'
import type { ModelInputs } from './finance/types'
import { createScenario, loadScenarios, saveScenarios } from './utils/scenarios'
import type { Scenario } from './utils/scenarios'
import { exportPdf } from './utils/exportPdf'
import { exportExcel } from './utils/exportExcel'
import { AssumptionsPanel } from './components/AssumptionsPanel'
import { KpiCards } from './components/KpiCards'
import { WarningsPanel } from './components/WarningsPanel'
import { ProjectionTable } from './components/ProjectionTable'
import { ChartsPanel } from './components/ChartsPanel'
import { SensitivityPanel } from './components/SensitivityPanel'
import { ScenarioComparePanel } from './components/ScenarioComparePanel'

type ThemeMode = 'light' | 'dark'

const THEME_MODE_STORAGE_KEY = 'school-financial-analysis-theme-mode'

const getInitialThemeMode = (): ThemeMode => {
  if (typeof window === 'undefined') {
    return 'light'
  }

  const storedThemeMode = window.localStorage.getItem(THEME_MODE_STORAGE_KEY)
  if (storedThemeMode === 'light' || storedThemeMode === 'dark') {
    return storedThemeMode
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function App() {
  const [themeMode, setThemeMode] = useState<ThemeMode>(getInitialThemeMode)
  const [inputs, setInputs] = useState<ModelInputs>(defaultInputs)
  const [scenarios, setScenarios] = useState<Scenario[]>(() => loadScenarios())
  const [scenarioName, setScenarioName] = useState('')
  const [selectedScenarioId, setSelectedScenarioId] = useState('')
  const [includeChartsInExport, setIncludeChartsInExport] = useState(true)

  const incomeChartRef = useRef<HTMLDivElement | null>(null)
  const reservesChartRef = useRef<HTMLDivElement | null>(null)
  const costChartRef = useRef<HTMLDivElement | null>(null)

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: themeMode,
          primary: { main: '#1976d2', light: '#42a5f5', dark: '#1565c0' },
          secondary: { main: '#9c27b0', light: '#ba68c8', dark: '#7b1fa2' },
          success: { main: '#2e7d32', light: '#4caf50' },
          error: { main: '#d32f2f', light: '#ef5350' },
          background:
            themeMode === 'dark'
              ? { default: '#0f172a', paper: '#111827' }
              : { default: '#f5f5f5', paper: '#ffffff' },
        },
        typography: {
          fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
          h4: { fontWeight: 600 },
          h5: { fontWeight: 600 },
          h6: { fontWeight: 600 },
        },
        shape: { borderRadius: 12 },
        components: {
          MuiCard: {
            styleOverrides: {
              root: {
                boxShadow:
                  themeMode === 'dark' ? '0 4px 14px rgba(0,0,0,0.45)' : '0 2px 8px rgba(0,0,0,0.1)',
              },
            },
          },
        },
      }),
    [themeMode],
  )

  useEffect(() => {
    saveScenarios(scenarios)
  }, [scenarios])

  useEffect(() => {
    window.localStorage.setItem(THEME_MODE_STORAGE_KEY, themeMode)
  }, [themeMode])

  const result = useMemo(() => buildProjection(inputs), [inputs])
  const sensitivity = useMemo(() => runSensitivity(inputs), [inputs])
  const finalYearLabel = result.years[result.years.length - 1].label

  const update = (patch: Partial<ModelInputs>) => {
    setInputs((previous) => ({ ...previous, ...patch }))
  }

  const handleLoadScenario = () => {
    const scenario = scenarios.find((item) => item.id === selectedScenarioId)
    if (!scenario) {
      return
    }

    setInputs(scenario.state)
    setScenarioName(scenario.name)
  }

  const handleSaveScenario = (mode: 'save' | 'saveAs') => {
    const selectedScenario = scenarios.find((item) => item.id === selectedScenarioId)
    const fallbackName = selectedScenario?.name || `Scenario ${scenarios.length + 1}`
    const nextName = scenarioName.trim() || fallbackName

    if (mode === 'save' && selectedScenario) {
      setScenarios(
        scenarios.map((item) =>
          item.id === selectedScenarioId
            ? { ...item, name: nextName, updatedAt: new Date().toISOString(), state: inputs }
            : item,
        ),
      )
      setScenarioName(nextName)
      return
    }

    const newScenario = createScenario(nextName, inputs)
    setScenarios([...scenarios, newScenario])
    setSelectedScenarioId(newScenario.id)
    setScenarioName(nextName)
  }

  const handleDeleteScenario = () => {
    if (!selectedScenarioId) {
      return
    }

    const scenarioToDelete = scenarios.find((item) => item.id === selectedScenarioId)
    setScenarios(scenarios.filter((item) => item.id !== selectedScenarioId))
    setSelectedScenarioId('')
    if (scenarioName === scenarioToDelete?.name) {
      setScenarioName('')
    }
  }

  const handleExportPdf = () => {
    void exportPdf({
      inputs,
      result,
      scenarioName,
      includeCharts: includeChartsInExport,
      charts: [
        { title: 'Income vs expenditure', element: incomeChartRef.current },
        { title: 'Free reserves', element: reservesChartRef.current },
        { title: 'Expenditure composition', element: costChartRef.current },
      ],
    })
  }

  const handleExportExcel = () => {
    void exportExcel({ inputs, result, scenarioName })
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ flexGrow: 1, minHeight: '100vh', bgcolor: 'background.default' }}>
        <AppBar position="static" elevation={2}>
          <Toolbar>
            <AccountBalance sx={{ mr: 2 }} />
            <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
              {inputs.schoolName.trim() ? `${inputs.schoolName.trim()} — Budget Planner` : 'School Budget Planner'}
            </Typography>
            <Chip
              label={`${inputs.projectionYears}-Year Plan`}
              color="secondary"
              size="small"
              icon={<Assessment />}
            />
            <Stack direction="row" alignItems="center" spacing={1} sx={{ ml: 2 }}>
              <LightMode fontSize="small" />
              <Switch
                checked={themeMode === 'dark'}
                onChange={(e) => setThemeMode(e.target.checked ? 'dark' : 'light')}
                inputProps={{ 'aria-label': 'Toggle dark mode' }}
              />
              <DarkMode fontSize="small" />
            </Stack>
          </Toolbar>
        </AppBar>

        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
          <Box
            sx={{
              display: 'grid',
              gap: 3,
              gridTemplateColumns: { xs: '1fr', md: 'minmax(340px, 5fr) 7fr' },
              alignItems: 'start',
            }}
          >
            <AssumptionsPanel
              inputs={inputs}
              update={update}
              replaceInputs={setInputs}
              scenarios={scenarios}
              scenarioName={scenarioName}
              setScenarioName={setScenarioName}
              selectedScenarioId={selectedScenarioId}
              setSelectedScenarioId={setSelectedScenarioId}
              onLoadScenario={handleLoadScenario}
              onSaveScenario={handleSaveScenario}
              onDeleteScenario={handleDeleteScenario}
              includeChartsInExport={includeChartsInExport}
              setIncludeChartsInExport={setIncludeChartsInExport}
              onExportPdf={handleExportPdf}
              onExportExcel={handleExportExcel}
            />

            <Stack spacing={3}>
              <WarningsPanel warnings={result.warnings} />
              <KpiCards result={result} />
              <Card elevation={3}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Assessment sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h5" component="h2">
                      Income & expenditure projection
                    </Typography>
                  </Box>
                  <ProjectionTable result={result} />
                </CardContent>
              </Card>
              <ChartsPanel
                result={result}
                incomeChartRef={incomeChartRef}
                reservesChartRef={reservesChartRef}
                costChartRef={costChartRef}
              />
              <SensitivityPanel rows={sensitivity} finalYearLabel={finalYearLabel} />
              <ScenarioComparePanel currentResult={result} scenarios={scenarios} />
            </Stack>
          </Box>
        </Container>
      </Box>
    </ThemeProvider>
  )
}

export default App
