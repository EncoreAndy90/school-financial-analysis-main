import { useState, useMemo, useEffect, useRef } from 'react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  Container,
  Card,
  CardContent,
  Typography,
  TextField,
  Slider,
  Box,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  MenuItem,
  AppBar,
  Toolbar,
  Stack,
  InputAdornment,
  Switch,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material'
import Grid from '@mui/material/GridLegacy'
import {
  Settings,
  Assessment,
  Calculate,
  AccountBalance,
  People,
  School,
  AttachMoney,
  ExpandMore,
  DarkMode,
  LightMode,
} from '@mui/icons-material'
import './App.css'
import {
  createScenario,
  loadScenarios,
  saveScenarios,
} from './utils/scenarios'
import type { Scenario, ScenarioState } from './utils/scenarios'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import html2canvas from 'html2canvas'
import ExcelJS from 'exceljs'

interface FinancialData {
  year: string
  revenue: number
  costs: number
  annualSurplus: number
  netPosition: number
  feeIncrease: number
  payIncrease: number
  discountAmount: number
  grossRevenue: number
  staffCosts: number
  nonStaffCosts: number
}

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
  // Input states
  const [numChildren, setNumChildren] = useState(200)
  const [useStudentsByYear, setUseStudentsByYear] = useState(false)
  const [numChildrenYear1, setNumChildrenYear1] = useState(200)
  const [numChildrenYear2, setNumChildrenYear2] = useState(200)
  const [numChildrenYear3, setNumChildrenYear3] = useState(200)
  const [feePerTerm, setFeePerTerm] = useState(7000)
  const [useFeePerTermByYear, setUseFeePerTermByYear] = useState(false)
  const [feePerTermYear1, setFeePerTermYear1] = useState(7000)
  const [feePerTermYear2, setFeePerTermYear2] = useState(7000)
  const [feePerTermYear3, setFeePerTermYear3] = useState(7000)
  const [useFeeIncreaseByYear, setUseFeeIncreaseByYear] = useState(false)
  const [feeIncrease, setFeeIncrease] = useState(3)
  const [feeIncreaseYear1, setFeeIncreaseYear1] = useState(3)
  const [feeIncreaseYear2, setFeeIncreaseYear2] = useState(3)
  const [feeIncreaseYear3, setFeeIncreaseYear3] = useState(3)
  const [usePayIncreaseByYear, setUsePayIncreaseByYear] = useState(false)
  const [payIncrease, setPayIncrease] = useState(2)
  const [payIncreaseYear1, setPayIncreaseYear1] = useState(2)
  const [payIncreaseYear2, setPayIncreaseYear2] = useState(2)
  const [payIncreaseYear3, setPayIncreaseYear3] = useState(2)
  const [currentSurplus, setCurrentSurplus] = useState(100000)
  const [numStaffChildren, setNumStaffChildren] = useState(0)
  const [otherChildrenDiscount, setOtherChildrenDiscount] = useState(15)
  const [staffCostShare, setStaffCostShare] = useState(70)
  const [useDetailedStaffCosts, setUseDetailedStaffCosts] = useState(false)
  const [useStaffByYear, setUseStaffByYear] = useState(false)
  const [avgAnnualSalary, setAvgAnnualSalary] = useState(35000)
  const [avgAnnualSalaryYear1, setAvgAnnualSalaryYear1] = useState(35000)
  const [avgAnnualSalaryYear2, setAvgAnnualSalaryYear2] = useState(35000)
  const [avgAnnualSalaryYear3, setAvgAnnualSalaryYear3] = useState(35000)
  const [numTeachers, setNumTeachers] = useState(50)
  const [numTeachersYear1, setNumTeachersYear1] = useState(50)
  const [numTeachersYear2, setNumTeachersYear2] = useState(50)
  const [numTeachersYear3, setNumTeachersYear3] = useState(50)
  const [avgSupportSalary, setAvgSupportSalary] = useState(25000)
  const [avgSupportSalaryYear1, setAvgSupportSalaryYear1] = useState(25000)
  const [avgSupportSalaryYear2, setAvgSupportSalaryYear2] = useState(25000)
  const [avgSupportSalaryYear3, setAvgSupportSalaryYear3] = useState(25000)
  const [numSupportStaff, setNumSupportStaff] = useState(20)
  const [numSupportYear1, setNumSupportYear1] = useState(20)
  const [numSupportYear2, setNumSupportYear2] = useState(20)
  const [numSupportYear3, setNumSupportYear3] = useState(20)
  const [inflationYear1, setInflationYear1] = useState(2.5)
  const [inflationYear2, setInflationYear2] = useState(2.3)
  const [inflationYear3, setInflationYear3] = useState(2.2)
  const [scenarioName, setScenarioName] = useState('')
  const [scenarios, setScenarios] = useState<Scenario[]>(() => loadScenarios())
  const [selectedScenarioId, setSelectedScenarioId] = useState('')
  const [includeChartsInExport, setIncludeChartsInExport] = useState(true)
  const turnoverChartRef = useRef<HTMLDivElement | null>(null)
  const surplusChartRef = useRef<HTMLDivElement | null>(null)
  const breakdownChartRef = useRef<HTMLDivElement | null>(null)

  const theme = useMemo(
    () => createTheme({
      palette: {
        mode: themeMode,
        primary: {
          main: '#1976d2',
          light: '#42a5f5',
          dark: '#1565c0',
        },
        secondary: {
          main: '#9c27b0',
          light: '#ba68c8',
          dark: '#7b1fa2',
        },
        success: {
          main: '#2e7d32',
          light: '#4caf50',
        },
        error: {
          main: '#d32f2f',
          light: '#ef5350',
        },
        background: themeMode === 'dark'
          ? {
              default: '#0f172a',
              paper: '#111827',
            }
          : {
              default: '#f5f5f5',
              paper: '#ffffff',
            },
      },
      typography: {
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
        h4: {
          fontWeight: 600,
        },
        h5: {
          fontWeight: 600,
        },
        h6: {
          fontWeight: 600,
        },
      },
      shape: {
        borderRadius: 12,
      },
      components: {
        MuiCard: {
          styleOverrides: {
            root: {
              boxShadow: themeMode === 'dark'
                ? '0 4px 14px rgba(0,0,0,0.45)'
                : '0 2px 8px rgba(0,0,0,0.1)',
            },
          },
        },
      },
    }),
    [themeMode],
  )

  const chartAxisColor = theme.palette.text.secondary
  const chartGridColor = theme.palette.mode === 'dark' ? 'rgba(148, 163, 184, 0.25)' : 'rgba(15, 23, 42, 0.14)'
  const chartTooltipContentStyle = {
    backgroundColor: theme.palette.background.paper,
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: 8,
  }
  const chartTooltipLabelStyle = { color: theme.palette.text.primary }
  const chartTooltipItemStyle = { color: theme.palette.text.primary }

  useEffect(() => {
    saveScenarios(scenarios)
  }, [scenarios])

  useEffect(() => {
    window.localStorage.setItem(THEME_MODE_STORAGE_KEY, themeMode)
  }, [themeMode])

  const calculatedDiscountEffect = useMemo(() => {
    const totalChildren = useStudentsByYear ? numChildrenYear1 : numChildren
    const numOtherChildren = Math.max(0, totalChildren - numStaffChildren)
    const staffChildrenDiscount = numStaffChildren * 0.5
    const otherChildrenDiscountAmount = numOtherChildren * (otherChildrenDiscount / 100)

    return totalChildren > 0
      ? ((staffChildrenDiscount + otherChildrenDiscountAmount) / totalChildren) * 100
      : 0
  }, [useStudentsByYear, numChildren, numChildrenYear1, numStaffChildren, otherChildrenDiscount])

  const feeIncreaseByYear = useMemo(() => {
    return useFeeIncreaseByYear
      ? [feeIncreaseYear1, feeIncreaseYear2, feeIncreaseYear3]
      : [feeIncrease, feeIncrease, feeIncrease]
  }, [useFeeIncreaseByYear, feeIncrease, feeIncreaseYear1, feeIncreaseYear2, feeIncreaseYear3])

  const feePerTermByYear = useMemo(() => {
    return useFeePerTermByYear
      ? [feePerTermYear1, feePerTermYear2, feePerTermYear3]
      : [feePerTerm, feePerTerm, feePerTerm]
  }, [useFeePerTermByYear, feePerTerm, feePerTermYear1, feePerTermYear2, feePerTermYear3])

  const projectedFeePerTermByYear = useMemo(() => {
    if (useFeePerTermByYear) {
      return [feePerTermYear1, feePerTermYear2, feePerTermYear3]
    }

    const year1 = feePerTerm * (1 + feeIncreaseByYear[0] / 100)
    const year2 = year1 * (1 + feeIncreaseByYear[1] / 100)
    const year3 = year2 * (1 + feeIncreaseByYear[2] / 100)

    return [year1, year2, year3]
  }, [useFeePerTermByYear, feePerTerm, feePerTermYear1, feePerTermYear2, feePerTermYear3, feeIncreaseByYear])

  const payIncreaseByYear = useMemo(() => {
    return usePayIncreaseByYear
      ? [payIncreaseYear1, payIncreaseYear2, payIncreaseYear3]
      : [payIncrease, payIncrease, payIncrease]
  }, [usePayIncreaseByYear, payIncrease, payIncreaseYear1, payIncreaseYear2, payIncreaseYear3])

  const inflationByYear = useMemo(() => {
    return [inflationYear1, inflationYear2, inflationYear3]
  }, [inflationYear1, inflationYear2, inflationYear3])

  const childrenByYear = useMemo(() => {
    return useStudentsByYear
      ? [numChildrenYear1, numChildrenYear2, numChildrenYear3]
      : [numChildren, numChildren, numChildren]
  }, [useStudentsByYear, numChildren, numChildrenYear1, numChildrenYear2, numChildrenYear3])

  const teachersByYear = useMemo(() => {
    return useStaffByYear
      ? [numTeachersYear1, numTeachersYear2, numTeachersYear3]
      : [numTeachers, numTeachers, numTeachers]
  }, [useStaffByYear, numTeachers, numTeachersYear1, numTeachersYear2, numTeachersYear3])

  const supportByYear = useMemo(() => {
    return useStaffByYear
      ? [numSupportYear1, numSupportYear2, numSupportYear3]
      : [numSupportStaff, numSupportStaff, numSupportStaff]
  }, [useStaffByYear, numSupportStaff, numSupportYear1, numSupportYear2, numSupportYear3])

  const teacherSalaryByYear = useMemo(() => {
    return useStaffByYear
      ? [avgAnnualSalaryYear1, avgAnnualSalaryYear2, avgAnnualSalaryYear3]
      : [avgAnnualSalary, avgAnnualSalary, avgAnnualSalary]
  }, [useStaffByYear, avgAnnualSalary, avgAnnualSalaryYear1, avgAnnualSalaryYear2, avgAnnualSalaryYear3])

  const supportSalaryByYear = useMemo(() => {
    return useStaffByYear
      ? [avgSupportSalaryYear1, avgSupportSalaryYear2, avgSupportSalaryYear3]
      : [avgSupportSalary, avgSupportSalary, avgSupportSalary]
  }, [useStaffByYear, avgSupportSalary, avgSupportSalaryYear1, avgSupportSalaryYear2, avgSupportSalaryYear3])

  const roundSalary = (value: number) => Math.round(value)

  const applyYear1PayIncrease = (value: number) => {
    setPayIncreaseYear1(value)

    if (!useStaffByYear) {
      return
    }

    const year1Teacher = roundSalary(avgAnnualSalary * (1 + value / 100))
    const year1Support = roundSalary(avgSupportSalary * (1 + value / 100))
    const year2Teacher = roundSalary(year1Teacher * (1 + payIncreaseYear2 / 100))
    const year2Support = roundSalary(year1Support * (1 + payIncreaseYear2 / 100))
    const year3Teacher = roundSalary(year2Teacher * (1 + payIncreaseYear3 / 100))
    const year3Support = roundSalary(year2Support * (1 + payIncreaseYear3 / 100))

    setAvgAnnualSalaryYear1(year1Teacher)
    setAvgSupportSalaryYear1(year1Support)
    setAvgAnnualSalaryYear2(year2Teacher)
    setAvgSupportSalaryYear2(year2Support)
    setAvgAnnualSalaryYear3(year3Teacher)
    setAvgSupportSalaryYear3(year3Support)
  }

  const applyYear2PayIncrease = (value: number) => {
    setPayIncreaseYear2(value)

    if (!useStaffByYear) {
      return
    }

    const year2Teacher = roundSalary(avgAnnualSalaryYear1 * (1 + value / 100))
    const year2Support = roundSalary(avgSupportSalaryYear1 * (1 + value / 100))
    const year3Teacher = roundSalary(year2Teacher * (1 + payIncreaseYear3 / 100))
    const year3Support = roundSalary(year2Support * (1 + payIncreaseYear3 / 100))

    setAvgAnnualSalaryYear2(year2Teacher)
    setAvgSupportSalaryYear2(year2Support)
    setAvgAnnualSalaryYear3(year3Teacher)
    setAvgSupportSalaryYear3(year3Support)
  }

  const applyYear3PayIncrease = (value: number) => {
    setPayIncreaseYear3(value)

    if (!useStaffByYear) {
      return
    }

    const year3Teacher = roundSalary(avgAnnualSalaryYear2 * (1 + value / 100))
    const year3Support = roundSalary(avgSupportSalaryYear2 * (1 + value / 100))

    setAvgAnnualSalaryYear3(year3Teacher)
    setAvgSupportSalaryYear3(year3Support)
  }

  const handleUsePayIncreaseByYearChange = (checked: boolean) => {
    setUsePayIncreaseByYear(checked)

    if (!checked || !useStaffByYear) {
      return
    }

    const year1Teacher = roundSalary(avgAnnualSalary * (1 + payIncreaseYear1 / 100))
    const year1Support = roundSalary(avgSupportSalary * (1 + payIncreaseYear1 / 100))
    const year2Teacher = roundSalary(year1Teacher * (1 + payIncreaseYear2 / 100))
    const year2Support = roundSalary(year1Support * (1 + payIncreaseYear2 / 100))
    const year3Teacher = roundSalary(year2Teacher * (1 + payIncreaseYear3 / 100))
    const year3Support = roundSalary(year2Support * (1 + payIncreaseYear3 / 100))

    setAvgAnnualSalaryYear1(year1Teacher)
    setAvgSupportSalaryYear1(year1Support)
    setAvgAnnualSalaryYear2(year2Teacher)
    setAvgSupportSalaryYear2(year2Support)
    setAvgAnnualSalaryYear3(year3Teacher)
    setAvgSupportSalaryYear3(year3Support)
  }

  const buildScenarioState = (): ScenarioState => ({
    numChildren,
    useStudentsByYear,
    numChildrenYear1,
    numChildrenYear2,
    numChildrenYear3,
    feePerTerm,
    useFeePerTermByYear,
    feePerTermYear1,
    feePerTermYear2,
    feePerTermYear3,
    useFeeIncreaseByYear,
    feeIncrease,
    feeIncreaseYear1,
    feeIncreaseYear2,
    feeIncreaseYear3,
    usePayIncreaseByYear,
    payIncrease,
    payIncreaseYear1,
    payIncreaseYear2,
    payIncreaseYear3,
    currentSurplus,
    numStaffChildren,
    otherChildrenDiscount,
    staffCostShare,
    useDetailedStaffCosts,
    useStaffByYear,
    avgAnnualSalary,
    avgAnnualSalaryYear1,
    avgAnnualSalaryYear2,
    avgAnnualSalaryYear3,
    numTeachers,
    numTeachersYear1,
    numTeachersYear2,
    numTeachersYear3,
    avgSupportSalary,
    avgSupportSalaryYear1,
    avgSupportSalaryYear2,
    avgSupportSalaryYear3,
    numSupportStaff,
    numSupportYear1,
    numSupportYear2,
    numSupportYear3,
    inflationYear1,
    inflationYear2,
    inflationYear3,
  })

  const applyScenarioState = (state: ScenarioState) => {
    setNumChildren(state.numChildren)
    setUseStudentsByYear(state.useStudentsByYear)
    setNumChildrenYear1(state.numChildrenYear1)
    setNumChildrenYear2(state.numChildrenYear2)
    setNumChildrenYear3(state.numChildrenYear3)
    setFeePerTerm(state.feePerTerm)
    setUseFeePerTermByYear(state.useFeePerTermByYear)
    setFeePerTermYear1(state.feePerTermYear1)
    setFeePerTermYear2(state.feePerTermYear2)
    setFeePerTermYear3(state.feePerTermYear3)
    setUseFeeIncreaseByYear(state.useFeeIncreaseByYear)
    setFeeIncrease(state.feeIncrease)
    setFeeIncreaseYear1(state.feeIncreaseYear1)
    setFeeIncreaseYear2(state.feeIncreaseYear2)
    setFeeIncreaseYear3(state.feeIncreaseYear3)
    setUsePayIncreaseByYear(state.usePayIncreaseByYear)
    setPayIncrease(state.payIncrease)
    setPayIncreaseYear1(state.payIncreaseYear1)
    setPayIncreaseYear2(state.payIncreaseYear2)
    setPayIncreaseYear3(state.payIncreaseYear3)
    setCurrentSurplus(state.currentSurplus)
    setNumStaffChildren(state.numStaffChildren)
    setOtherChildrenDiscount(state.otherChildrenDiscount)
    setStaffCostShare(state.staffCostShare)
    setUseDetailedStaffCosts(state.useDetailedStaffCosts)
    setUseStaffByYear(state.useStaffByYear)
    setAvgAnnualSalary(state.avgAnnualSalary)
    setAvgAnnualSalaryYear1(state.avgAnnualSalaryYear1)
    setAvgAnnualSalaryYear2(state.avgAnnualSalaryYear2)
    setAvgAnnualSalaryYear3(state.avgAnnualSalaryYear3)
    setNumTeachers(state.numTeachers)
    setNumTeachersYear1(state.numTeachersYear1)
    setNumTeachersYear2(state.numTeachersYear2)
    setNumTeachersYear3(state.numTeachersYear3)
    setAvgSupportSalary(state.avgSupportSalary)
    setAvgSupportSalaryYear1(state.avgSupportSalaryYear1)
    setAvgSupportSalaryYear2(state.avgSupportSalaryYear2)
    setAvgSupportSalaryYear3(state.avgSupportSalaryYear3)
    setNumSupportStaff(state.numSupportStaff)
    setNumSupportYear1(state.numSupportYear1)
    setNumSupportYear2(state.numSupportYear2)
    setNumSupportYear3(state.numSupportYear3)
    setInflationYear1(state.inflationYear1)
    setInflationYear2(state.inflationYear2)
    setInflationYear3(state.inflationYear3)
  }

  const presetOptions: Array<{
    id: string
    label: string
    description: string
    overrides: Partial<ScenarioState>
  }> = [
    {
      id: 'baseline',
      label: 'Baseline',
      description: 'Steady enrollment with moderate increases.',
      overrides: {
        useStudentsByYear: false,
        numChildren: 200,
        useFeePerTermByYear: false,
        feePerTerm: 7000,
        useFeeIncreaseByYear: false,
        feeIncrease: 3,
        usePayIncreaseByYear: false,
        payIncrease: 2,
        currentSurplus: 100000,
        numStaffChildren: 0,
        otherChildrenDiscount: 15,
        useDetailedStaffCosts: false,
        staffCostShare: 70,
        inflationYear1: 2.5,
        inflationYear2: 2.3,
        inflationYear3: 2.2,
      },
    },
    {
      id: 'growth',
      label: 'Growth',
      description: 'Enrollment and fee growth with controlled costs.',
      overrides: {
        useStudentsByYear: true,
        numChildrenYear1: 220,
        numChildrenYear2: 235,
        numChildrenYear3: 250,
        useFeePerTermByYear: true,
        feePerTermYear1: 7200,
        feePerTermYear2: 7550,
        feePerTermYear3: 7900,
        useFeeIncreaseByYear: true,
        feeIncreaseYear1: 4.5,
        feeIncreaseYear2: 4.5,
        feeIncreaseYear3: 4.5,
        usePayIncreaseByYear: true,
        payIncreaseYear1: 2.5,
        payIncreaseYear2: 2.7,
        payIncreaseYear3: 2.9,
        currentSurplus: 120000,
        numStaffChildren: 4,
        otherChildrenDiscount: 12,
        useDetailedStaffCosts: true,
        useStaffByYear: true,
        numTeachersYear1: 52,
        numTeachersYear2: 54,
        numTeachersYear3: 56,
        numSupportYear1: 22,
        numSupportYear2: 23,
        numSupportYear3: 24,
        avgAnnualSalaryYear1: 36000,
        avgAnnualSalaryYear2: 37100,
        avgAnnualSalaryYear3: 38200,
        avgSupportSalaryYear1: 26000,
        avgSupportSalaryYear2: 26800,
        avgSupportSalaryYear3: 27600,
        inflationYear1: 2.4,
        inflationYear2: 2.3,
        inflationYear3: 2.2,
      },
    },
    {
      id: 'cost-pressure',
      label: 'Cost Pressure',
      description: 'Higher inflation and pay pressure with tighter surplus.',
      overrides: {
        useStudentsByYear: true,
        numChildrenYear1: 200,
        numChildrenYear2: 198,
        numChildrenYear3: 195,
        useFeePerTermByYear: false,
        feePerTerm: 7000,
        useFeeIncreaseByYear: true,
        feeIncreaseYear1: 2.2,
        feeIncreaseYear2: 2.3,
        feeIncreaseYear3: 2.5,
        usePayIncreaseByYear: true,
        payIncreaseYear1: 4.2,
        payIncreaseYear2: 4.0,
        payIncreaseYear3: 3.8,
        currentSurplus: 45000,
        numStaffChildren: 8,
        otherChildrenDiscount: 16,
        useDetailedStaffCosts: false,
        staffCostShare: 78,
        inflationYear1: 5.2,
        inflationYear2: 4.8,
        inflationYear3: 4.2,
      },
    },
    {
      id: 'expansion',
      label: 'Expansion',
      description: 'Fast enrollment growth with additional staff hiring.',
      overrides: {
        useStudentsByYear: true,
        numChildrenYear1: 210,
        numChildrenYear2: 240,
        numChildrenYear3: 270,
        useFeePerTermByYear: true,
        feePerTermYear1: 7000,
        feePerTermYear2: 7350,
        feePerTermYear3: 7700,
        useFeeIncreaseByYear: true,
        feeIncreaseYear1: 4.2,
        feeIncreaseYear2: 4.6,
        feeIncreaseYear3: 5.0,
        usePayIncreaseByYear: true,
        payIncreaseYear1: 2.8,
        payIncreaseYear2: 3.0,
        payIncreaseYear3: 3.2,
        currentSurplus: 90000,
        numStaffChildren: 3,
        otherChildrenDiscount: 11,
        useDetailedStaffCosts: true,
        useStaffByYear: true,
        numTeachersYear1: 54,
        numTeachersYear2: 60,
        numTeachersYear3: 66,
        numSupportYear1: 23,
        numSupportYear2: 26,
        numSupportYear3: 30,
        avgAnnualSalaryYear1: 35500,
        avgAnnualSalaryYear2: 36600,
        avgAnnualSalaryYear3: 37700,
        avgSupportSalaryYear1: 25500,
        avgSupportSalaryYear2: 26200,
        avgSupportSalaryYear3: 27000,
        inflationYear1: 3.0,
        inflationYear2: 2.8,
        inflationYear3: 2.6,
      },
    },
  ]

  const handleApplyPreset = (presetId: string) => {
    const preset = presetOptions.find((item) => item.id === presetId)
    if (!preset) {
      return
    }

    const baseState = buildScenarioState()
    applyScenarioState({
      ...baseState,
      ...preset.overrides,
    })
    setSelectedScenarioId('')
    setScenarioName(preset.label)
  }

  const handleLoadScenario = () => {
    if (!selectedScenarioId) {
      return
    }

    const scenario = scenarios.find((item) => item.id === selectedScenarioId)
    if (!scenario) {
      return
    }

    applyScenarioState(scenario.state)
    setScenarioName(scenario.name)
  }

  const handleSaveScenario = (mode: 'save' | 'saveAs') => {
    const selectedScenario = scenarios.find((item) => item.id === selectedScenarioId)
    const fallbackName = selectedScenario?.name || `Scenario ${scenarios.length + 1}`
    const nextName = scenarioName.trim() || fallbackName
    const nextState = buildScenarioState()

    if (mode === 'save' && selectedScenario) {
      const updatedScenarios = scenarios.map((item) =>
        item.id === selectedScenarioId
          ? {
            ...item,
            name: nextName,
            updatedAt: new Date().toISOString(),
            state: nextState,
          }
          : item
      )
      setScenarios(updatedScenarios)
      setScenarioName(nextName)
      return
    }

    const newScenario = createScenario(nextName, nextState)
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

  const handleExportPdf = async () => {
    const doc = new jsPDF()
    const title = scenarioName.trim() ? `Scenario: ${scenarioName.trim()}` : 'School Financial Analysis'
    const exportDate = new Date().toLocaleDateString('en-GB')

    doc.setFontSize(16)
    doc.text(title, 14, 18)
    doc.setFontSize(10)
    doc.text(`Exported: ${exportDate}`, 14, 24)

    const assumptions = [
      `Discount Effect: ${formatNumber(calculatedDiscountEffect)}%`,
      `Students: ${
        useStudentsByYear
          ? `Y1 ${formatNumber(numChildrenYear1)} / Y2 ${formatNumber(numChildrenYear2)} / Y3 ${formatNumber(numChildrenYear3)}`
          : formatNumber(numChildren)
      }`,
      `Fee per Term: ${
        useFeePerTermByYear
          ? `Y1 £${formatNumber(feePerTermYear1)} / Y2 £${formatNumber(feePerTermYear2)} / Y3 £${formatNumber(feePerTermYear3)}`
          : `£${formatNumber(feePerTerm)}`
      }`,
      `Fee Increase: ${
        useFeeIncreaseByYear
          ? `Y1 ${formatNumber(feeIncreaseYear1)}% / Y2 ${formatNumber(feeIncreaseYear2)}% / Y3 ${formatNumber(feeIncreaseYear3)}%`
          : `${formatNumber(feeIncrease)}%`
      }`,
      `Pay Increase: ${
        usePayIncreaseByYear
          ? `Y1 ${formatNumber(payIncreaseYear1)}% / Y2 ${formatNumber(payIncreaseYear2)}% / Y3 ${formatNumber(payIncreaseYear3)}%`
          : `${formatNumber(payIncrease)}%`
      }`,
      `Staff Costs: ${
        useDetailedStaffCosts
          ? (useStaffByYear ? 'Detailed (per year salaries & headcount)' : 'Detailed (salary × headcount)')
          : `Share ${formatNumber(staffCostShare)}%`
      }`,
      `Inflation: Y1 ${formatNumber(inflationYear1)}% / Y2 ${formatNumber(inflationYear2)}% / Y3 ${formatNumber(inflationYear3)}%`,
    ]

    doc.setFontSize(12)
    doc.text('Assumptions Snapshot', 14, 34)
    doc.setFontSize(10)
    assumptions.forEach((line, index) => {
      doc.text(line, 14, 40 + index * 5)
    })

    const tableStartY = 40 + assumptions.length * 5 + 4
    autoTable(doc, {
      startY: tableStartY,
      head: [[
        'Year',
        'Gross Revenue',
        'Discounts',
        'Turnover',
        'Costs',
        'Annual Surplus',
        'Cumulative Surplus',
        'Fee %',
        'Pay %',
      ]],
      body: financialData.map((row) => ([
        row.year,
        formatCurrency(row.grossRevenue),
        formatCurrency(-row.discountAmount),
        formatCurrency(row.revenue),
        formatCurrency(row.costs),
        formatCurrency(row.annualSurplus),
        formatCurrency(row.netPosition),
        row.feeIncrease ? `${row.feeIncrease}%` : '-',
        row.payIncrease ? `${row.payIncrease}%` : '-',
      ])),
      styles: { fontSize: 9 },
      headStyles: { fillColor: [25, 118, 210] },
    })

    if (includeChartsInExport) {
      const chartRefs = [
        { ref: turnoverChartRef, title: 'Turnover vs Costs' },
        { ref: surplusChartRef, title: 'Surplus Over Time' },
        { ref: breakdownChartRef, title: 'Revenue Breakdown' },
      ]

      let currentY = (doc as unknown as { lastAutoTable?: { finalY?: number } }).lastAutoTable?.finalY ?? tableStartY
      for (const chart of chartRefs) {
        if (!chart.ref.current) {
          continue
        }

        const canvas = await html2canvas(chart.ref.current, { backgroundColor: '#ffffff', scale: 2 })
        const imageData = canvas.toDataURL('image/png')
        const pageWidth = doc.internal.pageSize.getWidth()
        const margin = 14
        const maxWidth = pageWidth - margin * 2
        const imageHeight = (canvas.height * maxWidth) / canvas.width
        const neededSpace = imageHeight + 12

        if (currentY + neededSpace > doc.internal.pageSize.getHeight() - margin) {
          doc.addPage()
          currentY = margin
        }

        doc.setFontSize(12)
        doc.text(chart.title, margin, currentY + 6)
        doc.addImage(imageData, 'PNG', margin, currentY + 10, maxWidth, imageHeight)
        currentY += imageHeight + 18
      }
    }

    doc.save('school-financial-analysis.pdf')
  }

  const handleExportExcel = async () => {
    const workbook = new ExcelJS.Workbook()
    workbook.creator = 'School Financial Analysis'
    workbook.created = new Date()

    const assumptionsSheet = workbook.addWorksheet('Assumptions')
    assumptionsSheet.mergeCells('A1', 'B1')
    assumptionsSheet.getCell('A1').value = 'Assumptions'
    assumptionsSheet.getCell('A1').font = { size: 14, bold: true }

    const assumptionsRows: Array<[string, string | number]> = [
      ['Discount Effect (%)', calculatedDiscountEffect],
      ['Students Input Mode', useStudentsByYear ? 'Per year' : 'Single value'],
      ['Students (Year 1)', childrenByYear[0]],
      ['Students (Year 2)', childrenByYear[1]],
      ['Students (Year 3)', childrenByYear[2]],
      ['Fee Input Mode', useFeePerTermByYear ? 'Explicit per year' : 'Compounded from base fee'],
      ['Fee per Term (Current)', currentFeePerTerm],
      ['Fee per Term (Year 1)', projectedFeePerTermByYear[0]],
      ['Fee per Term (Year 2)', projectedFeePerTermByYear[1]],
      ['Fee per Term (Year 3)', projectedFeePerTermByYear[2]],
      ['Fee Increase Applied (Year 1 %)', financialData[1].feeIncrease],
      ['Fee Increase Applied (Year 2 %)', financialData[2].feeIncrease],
      ['Fee Increase Applied (Year 3 %)', financialData[3].feeIncrease],
      ['Pay Increase Applied (Year 1 %)', usesDetailedStaffByYear ? 0 : payIncreaseByYear[0]],
      ['Pay Increase Applied (Year 2 %)', usesDetailedStaffByYear ? 0 : payIncreaseByYear[1]],
      ['Pay Increase Applied (Year 3 %)', usesDetailedStaffByYear ? 0 : payIncreaseByYear[2]],
      ['Inflation (Year 1 %)', inflationYear1],
      ['Inflation (Year 2 %)', inflationYear2],
      ['Inflation (Year 3 %)', inflationYear3],
      ['Staff Costs Mode', usesDetailedStaffByYear ? 'Detailed (per year)' : useDetailedStaffCosts ? 'Detailed' : 'Share'],
      ['Staff Cost Share (%)', staffCostShare],
      ['Teacher Salary (Year 1)', avgAnnualSalaryYear1],
      ['Teacher Salary (Year 2)', avgAnnualSalaryYear2],
      ['Teacher Salary (Year 3)', avgAnnualSalaryYear3],
      ['Support Salary (Year 1)', avgSupportSalaryYear1],
      ['Support Salary (Year 2)', avgSupportSalaryYear2],
      ['Support Salary (Year 3)', avgSupportSalaryYear3],
      ['Teachers (Year 1)', numTeachersYear1],
      ['Teachers (Year 2)', numTeachersYear2],
      ['Teachers (Year 3)', numTeachersYear3],
      ['Support Staff (Year 1)', numSupportYear1],
      ['Support Staff (Year 2)', numSupportYear2],
      ['Support Staff (Year 3)', numSupportYear3],
      ['Current Annual Surplus', currentSurplus],
      ['Scenario Name', scenarioName.trim() || ''],
    ]

    assumptionsRows.forEach((row, index) => {
      const excelRow = assumptionsSheet.addRow(row)
      if (index === 0) {
        excelRow.getCell(1).font = { bold: true }
      }
    })
    assumptionsSheet.columns = [{ width: 30 }, { width: 28 }]

    const analysisSheet = workbook.addWorksheet('Yearly Analysis')
    analysisSheet.mergeCells('A1', 'E1')
    analysisSheet.getCell('A1').value = 'Yearly Analysis'
    analysisSheet.getCell('A1').font = { size: 14, bold: true }

    analysisSheet.addRow(['Metric', 'Current', 'Year 1', 'Year 2', 'Year 3']).font = { bold: true }

    const current = financialData[0]
    const year1 = financialData[1]
    const year2 = financialData[2]
    const year3 = financialData[3]

    const metrics = [
      {
        label: 'Gross Revenue',
        type: 'currency',
        values: [current.grossRevenue, year1.grossRevenue, year2.grossRevenue, year3.grossRevenue],
      },
      {
        label: 'Discounts',
        type: 'currency',
        values: [-current.discountAmount, -year1.discountAmount, -year2.discountAmount, -year3.discountAmount],
      },
      {
        label: 'Turnover',
        type: 'currency',
        values: [current.revenue, year1.revenue, year2.revenue, year3.revenue],
      },
      {
        label: 'Costs',
        type: 'currency',
        values: [current.costs, year1.costs, year2.costs, year3.costs],
      },
      {
        label: 'Annual Surplus',
        type: 'currency',
        values: [current.annualSurplus, year1.annualSurplus, year2.annualSurplus, year3.annualSurplus],
      },
      {
        label: 'Cumulative Surplus',
        type: 'currency',
        values: [current.netPosition, year1.netPosition, year2.netPosition, year3.netPosition],
      },
      {
        label: 'Fee Increase',
        type: 'percent',
        values: [current.feeIncrease, year1.feeIncrease, year2.feeIncrease, year3.feeIncrease],
      },
      {
        label: 'Pay Increase',
        type: 'percent',
        values: [current.payIncrease, year1.payIncrease, year2.payIncrease, year3.payIncrease],
      },
    ]

    metrics.forEach((metric) => {
      const values = metric.type === 'percent'
        ? metric.values.map((value) => value / 100)
        : metric.values
      const row = analysisSheet.addRow([metric.label, ...values])
      for (let i = 2; i <= 5; i += 1) {
        row.getCell(i).numFmt = metric.type === 'percent' ? '0.0%' : '£#,##0'
      }
    })

    analysisSheet.columns = [
      { width: 22 },
      { width: 18 },
      { width: 18 },
      { width: 18 },
      { width: 18 },
    ]

    const buffer = await workbook.xlsx.writeBuffer()
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'school-financial-analysis.xlsx'
    link.click()
    URL.revokeObjectURL(url)
  }

  const currentStudentCount = childrenByYear[0]
  const currentFeePerTerm = feePerTermByYear[0]
  const currentTeacherSalary = teacherSalaryByYear[0]
  const currentSupportSalary = supportSalaryByYear[0]
  const currentTeacherCount = teachersByYear[0]
  const currentSupportCount = supportByYear[0]

  const termsPerYear = 3
  const projectionYears = ['Year 1', 'Year 2', 'Year 3']
  const effectiveDiscount = calculatedDiscountEffect / 100
  const grossAnnualRevenue = currentStudentCount * currentFeePerTerm * termsPerYear
  const discountAmount = grossAnnualRevenue * effectiveDiscount
  const currentAnnualRevenue = grossAnnualRevenue - discountAmount
  const currentAnnualCosts = currentAnnualRevenue - currentSurplus
  const currentStaffCosts = useDetailedStaffCosts
    ? (currentTeacherSalary * currentTeacherCount) + (currentSupportSalary * currentSupportCount)
    : currentAnnualCosts * (staffCostShare / 100)
  const currentNonStaffCosts = currentAnnualCosts - currentStaffCosts

  const currentData: FinancialData = {
    year: 'Current',
    revenue: currentAnnualRevenue,
    costs: currentAnnualCosts,
    annualSurplus: currentSurplus,
    netPosition: currentSurplus,
    feeIncrease: 0,
    payIncrease: 0,
    discountAmount,
    grossRevenue: grossAnnualRevenue,
    staffCosts: currentStaffCosts,
    nonStaffCosts: currentNonStaffCosts,
  }

  const calculateRateChange = (previousValue: number, nextValue: number) => {
    if (previousValue <= 0) {
      return 0
    }

    return ((nextValue - previousValue) / previousValue) * 100
  }

  const usesDetailedStaffByYear = useDetailedStaffCosts && useStaffByYear
  const yearlyProjectionData: FinancialData[] = []
  let previousData = currentData
  let previousFeePerTerm = currentFeePerTerm

  for (let index = 0; index < projectionYears.length; index += 1) {
    const grossRevenueForYear = childrenByYear[index] * projectedFeePerTermByYear[index] * termsPerYear
    const discountAmountForYear = grossRevenueForYear * effectiveDiscount
    const revenueForYear = grossRevenueForYear - discountAmountForYear
    const detailedStaffCostsForYear =
      (teacherSalaryByYear[index] * teachersByYear[index]) +
      (supportSalaryByYear[index] * supportByYear[index])
    const staffCostsForYear = usesDetailedStaffByYear
      ? detailedStaffCostsForYear
      : previousData.staffCosts * (1 + payIncreaseByYear[index] / 100)
    const nonStaffCostsForYear = previousData.nonStaffCosts * (1 + inflationByYear[index] / 100)
    const costsForYear = staffCostsForYear + nonStaffCostsForYear
    const annualSurplusForYear = revenueForYear - costsForYear
    const netPositionForYear = previousData.netPosition + annualSurplusForYear
    const row: FinancialData = {
      year: projectionYears[index],
      revenue: revenueForYear,
      costs: costsForYear,
      annualSurplus: annualSurplusForYear,
      netPosition: netPositionForYear,
      feeIncrease: calculateRateChange(previousFeePerTerm, projectedFeePerTermByYear[index]),
      payIncrease: usesDetailedStaffByYear ? 0 : payIncreaseByYear[index],
      discountAmount: discountAmountForYear,
      grossRevenue: grossRevenueForYear,
      staffCosts: staffCostsForYear,
      nonStaffCosts: nonStaffCostsForYear,
    }

    yearlyProjectionData.push(row)
    previousData = row
    previousFeePerTerm = projectedFeePerTermByYear[index]
  }

  // Calculate financial projections
  const financialData: FinancialData[] = [currentData, ...yearlyProjectionData]

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const formatTooltipValue = (value: unknown) => {
    const normalizedValue = Array.isArray(value) ? value[0] : value

    if (typeof normalizedValue === 'number') {
      return formatCurrency(normalizedValue)
    }

    if (typeof normalizedValue === 'string') {
      const numericValue = Number(normalizedValue)
      return Number.isFinite(numericValue) ? formatCurrency(numericValue) : formatCurrency(0)
    }

    return formatCurrency(0)
  }

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-GB', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(value)
  }

  const baseCalculations = {
    termsPerYear: 3,
    effectiveDiscount: calculatedDiscountEffect / 100,
    grossAnnualRevenue,
    discountAmount,
    currentAnnualRevenue,
    currentAnnualCosts,
    staffCosts: currentStaffCosts,
    nonStaffCosts: currentNonStaffCosts,
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ flexGrow: 1, minHeight: '100vh', bgcolor: 'background.default' }}>
        <AppBar position="static" elevation={2}>
          <Toolbar>
            <AccountBalance sx={{ mr: 2 }} />
            <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
              School Financial Analysis
            </Typography>
            <Chip
              label="3-Year Projection"
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
          <Grid container spacing={3} alignItems="stretch">
            {/* Input Panel */}
            <Grid item xs={12} md={4}>
              <Card elevation={3} sx={{ height: '100%' }}>
                <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Settings sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h5" component="h2">
                      Parameters
                    </Typography>
                  </Box>

                  <Stack spacing={3}>
                    <Accordion defaultExpanded={false}>
                      <AccordionSummary expandIcon={<ExpandMore />}>
                        <Typography>Scenarios</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Stack spacing={2}>
                          <TextField
                            select
                            label="Saved Scenarios"
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
                            label="Scenario Name"
                            value={scenarioName}
                            onChange={(e) => setScenarioName(e.target.value)}
                            fullWidth
                          />
                          <Stack direction="row" spacing={1} flexWrap="wrap">
                            <Button
                              variant="outlined"
                              onClick={handleLoadScenario}
                              disabled={!selectedScenarioId}
                            >
                              Load
                            </Button>
                            <Button
                              variant="contained"
                              onClick={() => handleSaveScenario('save')}
                            >
                              Save
                            </Button>
                            <Button
                              variant="outlined"
                              onClick={() => handleSaveScenario('saveAs')}
                            >
                              Save As
                            </Button>
                            <Button
                              variant="text"
                              color="error"
                              onClick={handleDeleteScenario}
                              disabled={!selectedScenarioId}
                            >
                              Delete
                            </Button>
                          </Stack>
                        </Stack>
                      </AccordionDetails>
                    </Accordion>

                    <Accordion defaultExpanded={false}>
                      <AccordionSummary expandIcon={<ExpandMore />}>
                        <Typography>Presets</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Stack spacing={1.5}>
                          {presetOptions.map((preset) => (
                            <Paper
                              key={preset.id}
                              variant="outlined"
                              sx={{ p: 1.5, borderRadius: 2 }}
                            >
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
                                  onClick={() => handleApplyPreset(preset.id)}
                                >
                                  Apply
                                </Button>
                              </Stack>
                            </Paper>
                          ))}
                        </Stack>
                      </AccordionDetails>
                    </Accordion>

                    <Accordion defaultExpanded={false}>
                      <AccordionSummary expandIcon={<ExpandMore />}>
                        <Typography>Enrollment</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Stack spacing={2}>
                          <FormControlLabel
                            control={
                              <Switch
                                checked={useStudentsByYear}
                                onChange={(e) => setUseStudentsByYear(e.target.checked)}
                                color="primary"
                              />
                            }
                            label="Set students per year"
                          />
                          {useStudentsByYear ? (
                            <>
                              <TextField
                                label="Year 1 Students"
                                type="number"
                                value={numChildrenYear1}
                                onChange={(e) => setNumChildrenYear1(Number(e.target.value))}
                                fullWidth
                                InputProps={{
                                  startAdornment: (
                                    <InputAdornment position="start">
                                      <People />
                                    </InputAdornment>
                                  ),
                                }}
                              />
                              <TextField
                                label="Year 2 Students"
                                type="number"
                                value={numChildrenYear2}
                                onChange={(e) => setNumChildrenYear2(Number(e.target.value))}
                                fullWidth
                                InputProps={{
                                  startAdornment: (
                                    <InputAdornment position="start">
                                      <People />
                                    </InputAdornment>
                                  ),
                                }}
                              />
                              <TextField
                                label="Year 3 Students"
                                type="number"
                                value={numChildrenYear3}
                                onChange={(e) => setNumChildrenYear3(Number(e.target.value))}
                                fullWidth
                                InputProps={{
                                  startAdornment: (
                                    <InputAdornment position="start">
                                      <People />
                                    </InputAdornment>
                                  ),
                                }}
                              />
                            </>
                          ) : (
                            <TextField
                              label="Number of Children"
                              type="number"
                              value={numChildren}
                              onChange={(e) => setNumChildren(Number(e.target.value))}
                              fullWidth
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <People />
                                  </InputAdornment>
                                ),
                              }}
                            />
                          )}
                        </Stack>
                      </AccordionDetails>
                    </Accordion>


                    <Accordion defaultExpanded={false}>
                      <AccordionSummary expandIcon={<ExpandMore />}>
                        <Typography>Fees & Discounts</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Stack spacing={2}>
                          <FormControlLabel
                            control={
                              <Switch
                                checked={useFeePerTermByYear}
                                onChange={(e) => setUseFeePerTermByYear(e.target.checked)}
                                color="primary"
                              />
                            }
                            label="Set fee per term per year"
                          />
                          {useFeePerTermByYear ? (
                            <>
                              <TextField
                                label="Year 1 Fee per Term"
                                type="number"
                                value={feePerTermYear1}
                                onChange={(e) => setFeePerTermYear1(Number(e.target.value))}
                                fullWidth
                                InputProps={{
                                  startAdornment: (
                                    <InputAdornment position="start">
                                      <AttachMoney />
                                    </InputAdornment>
                                  ),
                                }}
                              />
                              <TextField
                                label="Year 2 Fee per Term"
                                type="number"
                                value={feePerTermYear2}
                                onChange={(e) => setFeePerTermYear2(Number(e.target.value))}
                                fullWidth
                                InputProps={{
                                  startAdornment: (
                                    <InputAdornment position="start">
                                      <AttachMoney />
                                    </InputAdornment>
                                  ),
                                }}
                              />
                              <TextField
                                label="Year 3 Fee per Term"
                                type="number"
                                value={feePerTermYear3}
                                onChange={(e) => setFeePerTermYear3(Number(e.target.value))}
                                fullWidth
                                InputProps={{
                                  startAdornment: (
                                    <InputAdornment position="start">
                                      <AttachMoney />
                                    </InputAdornment>
                                  ),
                                }}
                              />
                            </>
                          ) : (
                            <TextField
                              label="Fee per Term"
                              type="number"
                              value={feePerTerm}
                              onChange={(e) => setFeePerTerm(Number(e.target.value))}
                              fullWidth
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <AttachMoney />
                                  </InputAdornment>
                                ),
                              }}
                            />
                          )}
                          <FormControlLabel
                            control={
                              <Switch
                                checked={useFeeIncreaseByYear}
                                onChange={(e) => setUseFeeIncreaseByYear(e.target.checked)}
                                color="primary"
                              />
                            }
                            label="Set fee increase per year"
                          />
                          {useFeeIncreaseByYear ? (
                            <>
                              <Box>
                                <Typography gutterBottom>Year 1: {feeIncreaseYear1}%</Typography>
                                <Slider
                                  value={feeIncreaseYear1}
                                  onChange={(_, value) => setFeeIncreaseYear1(value as number)}
                                  min={2}
                                  max={6}
                                  step={0.1}
                                  marks
                                  valueLabelDisplay="auto"
                                />
                              </Box>
                              <Box>
                                <Typography gutterBottom>Year 2: {feeIncreaseYear2}%</Typography>
                                <Slider
                                  value={feeIncreaseYear2}
                                  onChange={(_, value) => setFeeIncreaseYear2(value as number)}
                                  min={2}
                                  max={6}
                                  step={0.1}
                                  marks
                                  valueLabelDisplay="auto"
                                />
                              </Box>
                              <Box>
                                <Typography gutterBottom>Year 3: {feeIncreaseYear3}%</Typography>
                                <Slider
                                  value={feeIncreaseYear3}
                                  onChange={(_, value) => setFeeIncreaseYear3(value as number)}
                                  min={2}
                                  max={6}
                                  step={0.1}
                                  marks
                                  valueLabelDisplay="auto"
                                />
                              </Box>
                            </>
                          ) : (
                            <Box>
                              <Typography gutterBottom>
                                Tuition Fee Increase: {feeIncrease}%
                              </Typography>
                              <Slider
                                value={feeIncrease}
                                onChange={(_, value) => setFeeIncrease(value as number)}
                                min={2}
                                max={6}
                                step={0.1}
                                marks
                                valueLabelDisplay="auto"
                              />
                            </Box>
                          )}

                          <TextField
                            label="Staff Children"
                            type="number"
                            value={numStaffChildren}
                            onChange={(e) =>
                              setNumStaffChildren(Math.max(0, Math.min(Number(e.target.value), currentStudentCount)))
                            }
                            fullWidth
                            helperText="Staff children receive 50% discount"
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <School />
                                </InputAdornment>
                              ),
                            }}
                          />
                          <Box>
                            <Typography gutterBottom>
                              Other Children Discount: {otherChildrenDiscount}%
                            </Typography>
                            <Slider
                              value={otherChildrenDiscount}
                              onChange={(_, value) => setOtherChildrenDiscount(value as number)}
                              min={0}
                              max={20}
                              step={0.5}
                              marks
                              valueLabelDisplay="auto"
                            />
                          </Box>
                          <Box>
                            <Typography gutterBottom>
                              Total Discount Effect (calculated): {formatNumber(calculatedDiscountEffect)}%
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              Based on staff children at 50% discount and other children discount.
                            </Typography>
                          </Box>
                        </Stack>
                      </AccordionDetails>
                    </Accordion>

                    <Accordion defaultExpanded={false}>
                      <AccordionSummary expandIcon={<ExpandMore />}>
                        <Typography>Staff Costs</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Stack spacing={2}>
                          <FormControlLabel
                            control={
                              <Switch
                                checked={useDetailedStaffCosts}
                                onChange={(e) => setUseDetailedStaffCosts(e.target.checked)}
                                color="primary"
                              />
                            }
                            label="Use detailed staff costs"
                          />
                          {useDetailedStaffCosts ? (
                            <>
                              <FormControlLabel
                                control={
                                  <Switch
                                    checked={useStaffByYear}
                                    onChange={(e) => setUseStaffByYear(e.target.checked)}
                                    color="primary"
                                  />
                                }
                                label="Set staff salaries & headcount per year"
                              />
                              {useStaffByYear ? (
                                <>
                                  <TextField
                                    label="Year 1 Teacher Salary"
                                    type="number"
                                    value={avgAnnualSalaryYear1}
                                    onChange={(e) => setAvgAnnualSalaryYear1(Number(e.target.value))}
                                    fullWidth
                                    InputProps={{
                                      startAdornment: (
                                        <InputAdornment position="start">
                                          <AttachMoney />
                                        </InputAdornment>
                                      ),
                                    }}
                                  />
                                  {usePayIncreaseByYear && (
                                    <Box>
                                      <Typography gutterBottom>
                                        Year 1 Pay Increase: {payIncreaseYear1}%
                                      </Typography>
                                      <Slider
                                        value={payIncreaseYear1}
                                        onChange={(_, value) => applyYear1PayIncrease(value as number)}
                                        min={0}
                                        max={5}
                                        step={0.1}
                                        marks
                                        valueLabelDisplay="auto"
                                      />
                                    </Box>
                                  )}
                                  <TextField
                                    label="Year 1 Teachers"
                                    type="number"
                                    value={numTeachersYear1}
                                    onChange={(e) => setNumTeachersYear1(Number(e.target.value))}
                                    fullWidth
                                    InputProps={{
                                      startAdornment: (
                                        <InputAdornment position="start">
                                          <People />
                                        </InputAdornment>
                                      ),
                                    }}
                                  />
                                  <TextField
                                    label="Year 1 Support Salary"
                                    type="number"
                                    value={avgSupportSalaryYear1}
                                    onChange={(e) => setAvgSupportSalaryYear1(Number(e.target.value))}
                                    fullWidth
                                    InputProps={{
                                      startAdornment: (
                                        <InputAdornment position="start">
                                          <AttachMoney />
                                        </InputAdornment>
                                      ),
                                    }}
                                  />
                                  <TextField
                                    label="Year 1 Support Staff"
                                    type="number"
                                    value={numSupportYear1}
                                    onChange={(e) => setNumSupportYear1(Number(e.target.value))}
                                    fullWidth
                                    InputProps={{
                                      startAdornment: (
                                        <InputAdornment position="start">
                                          <People />
                                        </InputAdornment>
                                      ),
                                    }}
                                  />

                                  <TextField
                                    label="Year 2 Teacher Salary"
                                    type="number"
                                    value={avgAnnualSalaryYear2}
                                    onChange={(e) => setAvgAnnualSalaryYear2(Number(e.target.value))}
                                    fullWidth
                                    InputProps={{
                                      startAdornment: (
                                        <InputAdornment position="start">
                                          <AttachMoney />
                                        </InputAdornment>
                                      ),
                                    }}
                                  />
                                  {usePayIncreaseByYear && (
                                    <Box>
                                      <Typography gutterBottom>
                                        Year 2 Pay Increase: {payIncreaseYear2}%
                                      </Typography>
                                      <Slider
                                        value={payIncreaseYear2}
                                        onChange={(_, value) => applyYear2PayIncrease(value as number)}
                                        min={0}
                                        max={5}
                                        step={0.1}
                                        marks
                                        valueLabelDisplay="auto"
                                      />
                                    </Box>
                                  )}
                                  <TextField
                                    label="Year 2 Teachers"
                                    type="number"
                                    value={numTeachersYear2}
                                    onChange={(e) => setNumTeachersYear2(Number(e.target.value))}
                                    fullWidth
                                    InputProps={{
                                      startAdornment: (
                                        <InputAdornment position="start">
                                          <People />
                                        </InputAdornment>
                                      ),
                                    }}
                                  />
                                  <TextField
                                    label="Year 2 Support Salary"
                                    type="number"
                                    value={avgSupportSalaryYear2}
                                    onChange={(e) => setAvgSupportSalaryYear2(Number(e.target.value))}
                                    fullWidth
                                    InputProps={{
                                      startAdornment: (
                                        <InputAdornment position="start">
                                          <AttachMoney />
                                        </InputAdornment>
                                      ),
                                    }}
                                  />
                                  <TextField
                                    label="Year 2 Support Staff"
                                    type="number"
                                    value={numSupportYear2}
                                    onChange={(e) => setNumSupportYear2(Number(e.target.value))}
                                    fullWidth
                                    InputProps={{
                                      startAdornment: (
                                        <InputAdornment position="start">
                                          <People />
                                        </InputAdornment>
                                      ),
                                    }}
                                  />

                                  <TextField
                                    label="Year 3 Teacher Salary"
                                    type="number"
                                    value={avgAnnualSalaryYear3}
                                    onChange={(e) => setAvgAnnualSalaryYear3(Number(e.target.value))}
                                    fullWidth
                                    InputProps={{
                                      startAdornment: (
                                        <InputAdornment position="start">
                                          <AttachMoney />
                                        </InputAdornment>
                                      ),
                                    }}
                                  />
                                  {usePayIncreaseByYear && (
                                    <Box>
                                      <Typography gutterBottom>
                                        Year 3 Pay Increase: {payIncreaseYear3}%
                                      </Typography>
                                      <Slider
                                        value={payIncreaseYear3}
                                        onChange={(_, value) => applyYear3PayIncrease(value as number)}
                                        min={0}
                                        max={5}
                                        step={0.1}
                                        marks
                                        valueLabelDisplay="auto"
                                      />
                                    </Box>
                                  )}
                                  <TextField
                                    label="Year 3 Teachers"
                                    type="number"
                                    value={numTeachersYear3}
                                    onChange={(e) => setNumTeachersYear3(Number(e.target.value))}
                                    fullWidth
                                    InputProps={{
                                      startAdornment: (
                                        <InputAdornment position="start">
                                          <People />
                                        </InputAdornment>
                                      ),
                                    }}
                                  />
                                  <TextField
                                    label="Year 3 Support Salary"
                                    type="number"
                                    value={avgSupportSalaryYear3}
                                    onChange={(e) => setAvgSupportSalaryYear3(Number(e.target.value))}
                                    fullWidth
                                    InputProps={{
                                      startAdornment: (
                                        <InputAdornment position="start">
                                          <AttachMoney />
                                        </InputAdornment>
                                      ),
                                    }}
                                  />
                                  <TextField
                                    label="Year 3 Support Staff"
                                    type="number"
                                    value={numSupportYear3}
                                    onChange={(e) => setNumSupportYear3(Number(e.target.value))}
                                    fullWidth
                                    InputProps={{
                                      startAdornment: (
                                        <InputAdornment position="start">
                                          <People />
                                        </InputAdornment>
                                      ),
                                    }}
                                  />
                                </>
                              ) : (
                                <>
                                  <TextField
                                    label="Average Teacher Salary"
                                    type="number"
                                    value={avgAnnualSalary}
                                    onChange={(e) => setAvgAnnualSalary(Number(e.target.value))}
                                    fullWidth
                                    InputProps={{
                                      startAdornment: (
                                        <InputAdornment position="start">
                                          <AttachMoney />
                                        </InputAdornment>
                                      ),
                                    }}
                                  />
                                  <TextField
                                    label="Number of Teachers"
                                    type="number"
                                    value={numTeachers}
                                    onChange={(e) => setNumTeachers(Number(e.target.value))}
                                    fullWidth
                                    InputProps={{
                                      startAdornment: (
                                        <InputAdornment position="start">
                                          <People />
                                        </InputAdornment>
                                      ),
                                    }}
                                  />
                                  <TextField
                                    label="Average Support Salary"
                                    type="number"
                                    value={avgSupportSalary}
                                    onChange={(e) => setAvgSupportSalary(Number(e.target.value))}
                                    fullWidth
                                    InputProps={{
                                      startAdornment: (
                                        <InputAdornment position="start">
                                          <AttachMoney />
                                        </InputAdornment>
                                      ),
                                    }}
                                  />
                                  <TextField
                                    label="Number of Support Staff"
                                    type="number"
                                    value={numSupportStaff}
                                    onChange={(e) => setNumSupportStaff(Number(e.target.value))}
                                    fullWidth
                                    InputProps={{
                                      startAdornment: (
                                        <InputAdornment position="start">
                                          <People />
                                        </InputAdornment>
                                      ),
                                    }}
                                  />
                                </>
                              )}
                            </>
                          ) : (
                            <Box>
                              <Typography gutterBottom>
                                Staff Cost Share: {formatNumber(staffCostShare)}%
                              </Typography>
                              <Slider
                                value={staffCostShare}
                                onChange={(_, value) => setStaffCostShare(value as number)}
                                min={50}
                                max={90}
                                step={1}
                                marks
                                valueLabelDisplay="auto"
                              />
                            </Box>
                          )}
                          <FormControlLabel
                            control={
                              <Switch
                                checked={usePayIncreaseByYear}
                                onChange={(e) => handleUsePayIncreaseByYearChange(e.target.checked)}
                                color="primary"
                              />
                            }
                            label="Set pay increase per year"
                          />
                          {usePayIncreaseByYear ? (
                            <>
                              {!useStaffByYear && (
                                <>
                                  <Box>
                                    <Typography gutterBottom>Year 1: {payIncreaseYear1}%</Typography>
                                    <Slider
                                      value={payIncreaseYear1}
                                      onChange={(_, value) => setPayIncreaseYear1(value as number)}
                                      min={0}
                                      max={5}
                                      step={0.1}
                                      marks
                                      valueLabelDisplay="auto"
                                    />
                                  </Box>
                                  <Box>
                                    <Typography gutterBottom>Year 2: {payIncreaseYear2}%</Typography>
                                    <Slider
                                      value={payIncreaseYear2}
                                      onChange={(_, value) => setPayIncreaseYear2(value as number)}
                                      min={0}
                                      max={5}
                                      step={0.1}
                                      marks
                                      valueLabelDisplay="auto"
                                    />
                                  </Box>
                                  <Box>
                                    <Typography gutterBottom>Year 3: {payIncreaseYear3}%</Typography>
                                    <Slider
                                      value={payIncreaseYear3}
                                      onChange={(_, value) => setPayIncreaseYear3(value as number)}
                                      min={0}
                                      max={5}
                                      step={0.1}
                                      marks
                                      valueLabelDisplay="auto"
                                    />
                                  </Box>
                                </>
                              )}
                            </>
                          ) : (
                            <Box>
                              <Typography gutterBottom>
                                Staff Pay Increase: {payIncrease}%
                              </Typography>
                              <Slider
                                value={payIncrease}
                                onChange={(_, value) => setPayIncrease(value as number)}
                                min={0}
                                max={5}
                                step={0.1}
                                marks
                                valueLabelDisplay="auto"
                              />
                            </Box>
                          )}
                        </Stack>
                      </AccordionDetails>
                    </Accordion>

                    <Accordion defaultExpanded={false}>
                      <AccordionSummary expandIcon={<ExpandMore />}>
                        <Typography>Inflation</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Stack spacing={2}>
                          <Box>
                            <Typography gutterBottom>Year 1: {inflationYear1}%</Typography>
                            <Slider
                              value={inflationYear1}
                              onChange={(_, value) => setInflationYear1(value as number)}
                              min={0}
                              max={10}
                              step={0.1}
                              valueLabelDisplay="auto"
                            />
                          </Box>

                          <Box>
                            <Typography gutterBottom>Year 2: {inflationYear2}%</Typography>
                            <Slider
                              value={inflationYear2}
                              onChange={(_, value) => setInflationYear2(value as number)}
                              min={0}
                              max={10}
                              step={0.1}
                              valueLabelDisplay="auto"
                            />
                          </Box>

                          <Box>
                            <Typography gutterBottom>Year 3: {inflationYear3}%</Typography>
                            <Slider
                              value={inflationYear3}
                              onChange={(_, value) => setInflationYear3(value as number)}
                              min={0}
                              max={10}
                              step={0.1}
                              valueLabelDisplay="auto"
                            />
                          </Box>
                        </Stack>
                      </AccordionDetails>
                    </Accordion>

                    <Accordion defaultExpanded={false}>
                      <AccordionSummary expandIcon={<ExpandMore />}>
                        <Typography>Current Position</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Stack spacing={2}>
                          <Paper elevation={0} sx={{ p: 2, bgcolor: 'primary.main', color: 'primary.contrastText' }}>
                            <Typography variant="subtitle2" gutterBottom>
                              Gross Annual Revenue
                            </Typography>
                            <Typography variant="h6">
                              {formatCurrency(currentStudentCount * currentFeePerTerm * 3)}
                            </Typography>
                            <Typography variant="body2" sx={{ mt: 1, opacity: 0.9 }}>
                              Turnover: {formatCurrency(
                                (currentStudentCount * currentFeePerTerm * 3) * (1 - calculatedDiscountEffect / 100)
                              )}
                            </Typography>
                          </Paper>
                          <TextField
                            label="Current Annual Surplus"
                            type="number"
                            value={currentSurplus}
                            onChange={(e) => setCurrentSurplus(Number(e.target.value))}
                            fullWidth
                            helperText="Surplus = Turnover - Costs"
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <AttachMoney />
                                </InputAdornment>
                              ),
                            }}
                          />
                        </Stack>
                      </AccordionDetails>
                    </Accordion>

                    <Accordion defaultExpanded={false}>
                      <AccordionSummary expandIcon={<ExpandMore />}>
                        <Typography>Export</Typography>
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
                            label="Include charts in PDF"
                          />
                          <Stack direction="row" spacing={1} flexWrap="wrap">
                            <Button variant="outlined" onClick={handleExportPdf}>
                              Export PDF
                            </Button>
                            <Button variant="outlined" onClick={handleExportExcel}>
                              Export Excel
                            </Button>
                          </Stack>
                        </Stack>
                      </AccordionDetails>
                    </Accordion>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            {/* Results Panel */}
            <Grid item xs={12} md={8}>
              <Stack spacing={3}>
                {/* Summary Cards */}
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card>
                      <CardContent>
                        <Typography color="textSecondary" gutterBottom variant="body2">
                          Current Turnover
                        </Typography>
                        <Typography variant="h6">
                          {formatCurrency(financialData[0].revenue)}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card>
                      <CardContent>
                        <Typography color="textSecondary" gutterBottom variant="body2">
                          Year 3 Turnover
                        </Typography>
                        <Typography variant="h6">
                          {formatCurrency(financialData[3].revenue)}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card>
                      <CardContent>
                        <Typography color="textSecondary" gutterBottom variant="body2">
                          Year 3 Annual Surplus
                        </Typography>
                        <Typography
                          variant="h6"
                          color={financialData[3].annualSurplus >= 0 ? 'success.main' : 'error.main'}
                        >
                          {formatCurrency(financialData[3].annualSurplus)}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card>
                      <CardContent>
                        <Typography color="textSecondary" gutterBottom variant="body2">
                          Year 3 Cumulative Surplus
                        </Typography>
                        <Typography
                          variant="h6"
                          color={financialData[3].netPosition >= 0 ? 'success.main' : 'error.main'}
                        >
                          {formatCurrency(financialData[3].netPosition)}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>

                <Card elevation={3}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Assumptions Snapshot
                    </Typography>
                    <Stack spacing={1}>
                      <Typography variant="body2">
                        <strong>Discount Effect:</strong> {formatNumber(calculatedDiscountEffect)}%
                      </Typography>
                      <Typography variant="body2">
                        <strong>Students:</strong>{' '}
                        {useStudentsByYear
                          ? `Y1 ${formatNumber(numChildrenYear1)} / Y2 ${formatNumber(numChildrenYear2)} / Y3 ${formatNumber(numChildrenYear3)}`
                          : formatNumber(numChildren)}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Fee per Term:</strong>{' '}
                        {useFeePerTermByYear
                          ? `Y1 £${formatNumber(feePerTermYear1)} / Y2 £${formatNumber(feePerTermYear2)} / Y3 £${formatNumber(feePerTermYear3)}`
                          : `£${formatNumber(feePerTerm)}`}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Fee Increase:</strong>{' '}
                        {useFeeIncreaseByYear
                          ? `Y1 ${formatNumber(feeIncreaseYear1)}% / Y2 ${formatNumber(feeIncreaseYear2)}% / Y3 ${formatNumber(feeIncreaseYear3)}%`
                          : `${formatNumber(feeIncrease)}%`}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Pay Increase:</strong>{' '}
                        {usePayIncreaseByYear
                          ? `Y1 ${formatNumber(payIncreaseYear1)}% / Y2 ${formatNumber(payIncreaseYear2)}% / Y3 ${formatNumber(payIncreaseYear3)}%`
                          : `${formatNumber(payIncrease)}%`}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Staff Costs:</strong>{' '}
                        {useDetailedStaffCosts
                          ? useStaffByYear
                            ? `Detailed (per year salaries & headcount)`
                            : `Detailed (salary × headcount)`
                          : `Share ${formatNumber(staffCostShare)}%`}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Inflation:</strong>{' '}
                        {`Y1 ${formatNumber(inflationYear1)}% / Y2 ${formatNumber(inflationYear2)}% / Y3 ${formatNumber(inflationYear3)}%`}
                      </Typography>
                    </Stack>
                  </CardContent>
                </Card>

                {/* Financial Table */}
                <Card elevation={3}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Assessment sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h5" component="h2">
                      Financial Projections
                    </Typography>
                  </Box>
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell><strong>Year</strong></TableCell>
                            <TableCell align="right"><strong>Gross Revenue</strong></TableCell>
                            <TableCell align="right"><strong>Discounts</strong></TableCell>
                            <TableCell align="right"><strong>Turnover</strong></TableCell>
                            <TableCell align="right"><strong>Costs</strong></TableCell>
                            <TableCell align="right"><strong>Annual Surplus</strong></TableCell>
                            <TableCell align="right"><strong>Cumulative Surplus</strong></TableCell>
                            <TableCell align="center"><strong>Fee %</strong></TableCell>
                            <TableCell align="center"><strong>Pay %</strong></TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {financialData.map((row, index) => (
                            <TableRow key={index} hover>
                              <TableCell><strong>{row.year}</strong></TableCell>
                              <TableCell align="right">{formatCurrency(row.grossRevenue)}</TableCell>
                              <TableCell align="right" sx={{ color: 'error.main' }}>
                                {formatCurrency(-row.discountAmount)}
                              </TableCell>
                              <TableCell align="right">{formatCurrency(row.revenue)}</TableCell>
                              <TableCell align="right">{formatCurrency(row.costs)}</TableCell>
                              <TableCell
                                align="right"
                                sx={{
                                  color: row.annualSurplus >= 0 ? 'success.main' : 'error.main',
                                  fontWeight: 600,
                                }}
                              >
                                {formatCurrency(row.annualSurplus)}
                              </TableCell>
                              <TableCell
                                align="right"
                                sx={{
                                  color: row.netPosition >= 0 ? 'success.main' : 'error.main',
                                  fontWeight: 600,
                                }}
                              >
                                {formatCurrency(row.netPosition)}
                              </TableCell>
                              <TableCell align="center">
                                {row.feeIncrease > 0 ? (
                                  <Chip label={`${row.feeIncrease}%`} size="small" color="primary" />
                                ) : (
                                  '-'
                                )}
                              </TableCell>
                              <TableCell align="center">
                                {row.payIncrease > 0 ? (
                                  <Chip label={`${row.payIncrease}%`} size="small" color="secondary" />
                                ) : (
                                  '-'
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </CardContent>
                </Card>

                {/* Charts */}
                <Stack spacing={2}>
                  <Card elevation={3}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Turnover vs Costs Over Time
                      </Typography>
                      <Box ref={turnoverChartRef}>
                        <ResponsiveContainer width="100%" height={300}>
                          <LineChart data={financialData}>
                            <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} />
                            <XAxis dataKey="year" tick={{ fill: chartAxisColor }} />
                            <YAxis tick={{ fill: chartAxisColor }} tickFormatter={(value) => `£${(value / 1000).toFixed(0)}k`} />
                            <Tooltip
                              formatter={(value) => formatTooltipValue(value)}
                              contentStyle={chartTooltipContentStyle}
                              labelStyle={chartTooltipLabelStyle}
                              itemStyle={chartTooltipItemStyle}
                            />
                            <Legend />
                            <Line
                              type="monotone"
                              dataKey="revenue"
                              stroke="#2e7d32"
                              strokeWidth={2}
                              name="Turnover"
                            />
                            <Line
                              type="monotone"
                              dataKey="costs"
                              stroke="#d32f2f"
                              strokeWidth={2}
                              name="Costs"
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </Box>
                    </CardContent>
                  </Card>

                  <Card elevation={3}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Surplus Over Time (Annual vs Cumulative)
                      </Typography>
                      <Box ref={surplusChartRef}>
                        <ResponsiveContainer width="100%" height={250}>
                          <BarChart data={financialData}>
                            <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} />
                            <XAxis dataKey="year" tick={{ fill: chartAxisColor }} />
                            <YAxis tick={{ fill: chartAxisColor }} tickFormatter={(value) => `£${(value / 1000).toFixed(0)}k`} />
                            <Tooltip
                              formatter={(value) => formatTooltipValue(value)}
                              contentStyle={chartTooltipContentStyle}
                              labelStyle={chartTooltipLabelStyle}
                              itemStyle={chartTooltipItemStyle}
                            />
                            <Legend />
                            <Bar dataKey="annualSurplus" name="Annual Surplus" fill="#1976d2" />
                            <Bar dataKey="netPosition" name="Cumulative Surplus" fill="#9c27b0" />
                          </BarChart>
                        </ResponsiveContainer>
                      </Box>
                    </CardContent>
                  </Card>

                  <Card elevation={3}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Revenue Breakdown
                      </Typography>
                      <Box ref={breakdownChartRef}>
                        <ResponsiveContainer width="100%" height={250}>
                          <BarChart data={financialData}>
                            <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} />
                            <XAxis dataKey="year" tick={{ fill: chartAxisColor }} />
                            <YAxis tick={{ fill: chartAxisColor }} tickFormatter={(value) => `£${(value / 1000).toFixed(0)}k`} />
                            <Tooltip
                              formatter={(value) => formatTooltipValue(value)}
                              contentStyle={chartTooltipContentStyle}
                              labelStyle={chartTooltipLabelStyle}
                              itemStyle={chartTooltipItemStyle}
                            />
                            <Legend />
                            <Bar dataKey="revenue" fill="#2e7d32" name="Turnover" />
                            <Bar dataKey="costs" fill="#d32f2f" name="Costs" />
                          </BarChart>
                        </ResponsiveContainer>
                      </Box>
                    </CardContent>
                  </Card>
                </Stack>

                {/* Manual Calculations */}
                <Accordion defaultExpanded>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Calculate sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography variant="h5" component="h2">
                        Manual Calculations
                      </Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Paper elevation={0} sx={{ p: 2, mb: 3, bgcolor: 'action.hover' }}>
                      <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                        Base Calculations
                      </Typography>
                      <Stack spacing={1}>
                        <Typography variant="body2">
                          <strong>Gross Annual Revenue:</strong> {formatNumber(currentStudentCount)} × £{formatNumber(currentFeePerTerm)} × 3 ={' '}
                          {formatCurrency(baseCalculations.grossAnnualRevenue)}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Discount Amount:</strong> {formatCurrency(baseCalculations.grossAnnualRevenue)} ×{' '}
                          {formatNumber(calculatedDiscountEffect)}% = {formatCurrency(baseCalculations.discountAmount)}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Current Turnover:</strong> {formatCurrency(baseCalculations.grossAnnualRevenue)} -{' '}
                          {formatCurrency(baseCalculations.discountAmount)} ={' '}
                          {formatCurrency(baseCalculations.currentAnnualRevenue)}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Current Costs:</strong> {formatCurrency(baseCalculations.currentAnnualRevenue)} -{' '}
                          {formatCurrency(currentSurplus)} = {formatCurrency(baseCalculations.currentAnnualCosts)}
                        </Typography>
                        {useDetailedStaffCosts ? (
                          <>
                            <Typography variant="body2">
                              <strong>Staff Costs:</strong> ({formatNumber(currentTeacherCount)} ×{' '}
                              {formatCurrency(currentTeacherSalary)}) + ({formatNumber(currentSupportCount)} ×{' '}
                              {formatCurrency(currentSupportSalary)}) = {formatCurrency(baseCalculations.staffCosts)}
                            </Typography>
                            <Typography variant="body2">
                              <strong>Non-Staff Costs:</strong> {formatCurrency(baseCalculations.currentAnnualCosts)} -{' '}
                              {formatCurrency(baseCalculations.staffCosts)} ={' '}
                              {formatCurrency(baseCalculations.nonStaffCosts)}
                            </Typography>
                          </>
                        ) : (
                          <>
                            <Typography variant="body2">
                              <strong>Staff Costs:</strong> {formatCurrency(baseCalculations.currentAnnualCosts)} ×{' '}
                              {formatNumber(staffCostShare)}% = {formatCurrency(baseCalculations.staffCosts)}
                            </Typography>
                            <Typography variant="body2">
                              <strong>Non-Staff Costs:</strong> {formatCurrency(baseCalculations.currentAnnualCosts)} ×{' '}
                              {formatNumber(100 - staffCostShare)}% ={' '}
                              {formatCurrency(baseCalculations.nonStaffCosts)}
                            </Typography>
                          </>
                        )}
                      </Stack>
                    </Paper>

                    {financialData.slice(1).map((year, index) => {
                      const yearNum = index + 1
                      const studentsForYear = childrenByYear[index]
                      const feePerTermForYear = projectedFeePerTermByYear[index]
                      const previousFeePerTermForYear = index === 0
                        ? currentFeePerTerm
                        : projectedFeePerTermByYear[index - 1]
                      const feeIncreaseForYear = previousFeePerTermForYear > 0
                        ? ((feePerTermForYear - previousFeePerTermForYear) / previousFeePerTermForYear) * 100
                        : 0
                      const payIncreaseForYear = payIncreaseByYear[index]
                      const inflationRate = inflationByYear[index]
                      const previousYear = financialData[index]
                      const usesDetailedInputsForStaff = useDetailedStaffCosts && useStaffByYear
                      const detailedStaffCostsForYear =
                        (teacherSalaryByYear[index] * teachersByYear[index]) +
                        (supportSalaryByYear[index] * supportByYear[index])
                      const staffCostsAfterPay = usesDetailedInputsForStaff
                        ? detailedStaffCostsForYear
                        : previousYear.staffCosts * (1 + payIncreaseForYear / 100)
                      const nonStaffCostsAfterInflation = previousYear.nonStaffCosts * (1 + inflationRate / 100)
                      const combinedCosts = staffCostsAfterPay + nonStaffCostsAfterInflation

                      return (
                        <Paper key={yearNum} elevation={1} sx={{ p: 2, mb: 2 }}>
                          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
                            Year {yearNum} Calculations
                          </Typography>
                          <Stack spacing={1.5}>
                            <Typography variant="body2">
                              <strong>Step 1:</strong> Gross Revenue = {formatNumber(studentsForYear)} ×{' '}
                              £{formatNumber(feePerTermForYear)} × 3 = {formatCurrency(year.grossRevenue)}
                            </Typography>
                            <Typography variant="body2">
                              <strong>Step 2:</strong> Fee Change = £{formatNumber(previousFeePerTermForYear)} →{' '}
                              £{formatNumber(feePerTermForYear)} ({formatNumber(feeIncreaseForYear)}%)
                            </Typography>
                            <Typography variant="body2">
                              <strong>Step 3:</strong> Discount = {formatCurrency(year.grossRevenue)} ×{' '}
                              {formatNumber(calculatedDiscountEffect)}% = {formatCurrency(year.discountAmount)}
                            </Typography>
                            <Typography variant="body2">
                              <strong>Step 4:</strong> Turnover = {formatCurrency(year.grossRevenue)} -{' '}
                              {formatCurrency(year.discountAmount)} = {formatCurrency(year.revenue)}
                            </Typography>
                            {usesDetailedInputsForStaff ? (
                              <Typography variant="body2">
                                <strong>Step 5:</strong> Staff Costs = ({formatNumber(teachersByYear[index])} ×{' '}
                                {formatCurrency(teacherSalaryByYear[index])}) + ({formatNumber(supportByYear[index])} ×{' '}
                                {formatCurrency(supportSalaryByYear[index])}) = {formatCurrency(staffCostsAfterPay)}
                              </Typography>
                            ) : (
                              <Typography variant="body2">
                                <strong>Step 5:</strong> Staff Costs = {formatCurrency(previousYear.staffCosts)} × (1 +{' '}
                                {formatNumber(payIncreaseForYear)}%) = {formatCurrency(staffCostsAfterPay)}
                              </Typography>
                            )}
                            <Typography variant="body2">
                              <strong>Step 6:</strong> Non-Staff Costs = {formatCurrency(previousYear.nonStaffCosts)} ×{' '}
                              (1 + {inflationRate}%) = {formatCurrency(nonStaffCostsAfterInflation)}
                            </Typography>
                            <Typography variant="body2">
                              <strong>Step 7:</strong> Total Costs = {formatCurrency(staffCostsAfterPay)} +{' '}
                              {formatCurrency(nonStaffCostsAfterInflation)} = {formatCurrency(combinedCosts)}
                            </Typography>
                            <Typography variant="body2">
                              <strong>Step 8:</strong> Annual Surplus = {formatCurrency(year.revenue)} -{' '}
                              {formatCurrency(year.costs)} = {formatCurrency(year.annualSurplus)}
                            </Typography>
                            <Typography variant="body2">
                              <strong>Step 9:</strong> Cumulative Surplus = Previous Surplus + Annual Surplus ={' '}
                              {formatCurrency(previousYear.netPosition)} + {formatCurrency(year.annualSurplus)} ={' '}
                              {formatCurrency(year.netPosition)}
                            </Typography>
                          </Stack>
                        </Paper>
                      )
                    })}
                  </AccordionDetails>
                </Accordion>
              </Stack>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </ThemeProvider>
  )
}

export default App
