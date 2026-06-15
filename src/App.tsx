import { useState, useMemo, useEffect, useRef } from 'react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import {
  Settings,
  BarChart3,
  Calculator,
  Landmark,
  Users,
  GraduationCap,
  PoundSterling,
  Moon,
  Sun,
  FileDown,
  FileSpreadsheet,
  TrendingUp,
  Wallet,
  PiggyBank,
  LineChart as LineChartIcon,
} from 'lucide-react'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import html2canvas from 'html2canvas'
import ExcelJS from 'exceljs'

import {
  createScenario,
  loadScenarios,
  saveScenarios,
} from './utils/scenarios'
import type { Scenario, ScenarioState } from './utils/scenarios'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { TooltipProvider } from '@/components/ui/tooltip'
import {
  InfoLabel,
  NumberField,
  SliderField,
  SwitchField,
} from '@/components/form-fields'
import { cn } from '@/lib/utils'

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

  const isDark = themeMode === 'dark'
  const chartAxisColor = isDark ? '#94a3b8' : '#475569'
  const chartGridColor = isDark ? 'rgba(148, 163, 184, 0.25)' : 'rgba(15, 23, 42, 0.14)'
  const chartTooltipContentStyle = {
    backgroundColor: isDark ? '#111827' : '#ffffff',
    border: `1px solid ${isDark ? '#1f2937' : '#e2e8f0'}`,
    borderRadius: 8,
  }
  const chartTooltipLabelStyle = { color: isDark ? '#f1f5f9' : '#0f172a' }
  const chartTooltipItemStyle = { color: isDark ? '#f1f5f9' : '#0f172a' }

  useEffect(() => {
    saveScenarios(scenarios)
  }, [scenarios])

  useEffect(() => {
    const root = document.documentElement
    if (themeMode === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
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

  const year3 = financialData[3]
  const summaryCards = [
    {
      label: 'Current Turnover',
      value: formatCurrency(financialData[0].revenue),
      icon: <Wallet className="h-4 w-4" />,
      tone: 'neutral' as const,
    },
    {
      label: 'Year 3 Turnover',
      value: formatCurrency(year3.revenue),
      icon: <TrendingUp className="h-4 w-4" />,
      tone: 'neutral' as const,
    },
    {
      label: 'Year 3 Annual Surplus',
      value: formatCurrency(year3.annualSurplus),
      icon: <LineChartIcon className="h-4 w-4" />,
      tone: year3.annualSurplus >= 0 ? ('positive' as const) : ('negative' as const),
    },
    {
      label: 'Year 3 Cumulative Surplus',
      value: formatCurrency(year3.netPosition),
      icon: <PiggyBank className="h-4 w-4" />,
      tone: year3.netPosition >= 0 ? ('positive' as const) : ('negative' as const),
    },
  ]

  const surplusToneClass = (tone: 'neutral' | 'positive' | 'negative') =>
    tone === 'positive'
      ? 'text-success'
      : tone === 'negative'
        ? 'text-destructive'
        : 'text-foreground'

  return (
    <TooltipProvider delayDuration={200}>
      <div className="min-h-screen bg-background text-foreground">
        <header className="sticky top-0 z-40 border-b bg-card/90 backdrop-blur supports-[backdrop-filter]:bg-card/70">
          <div className="mx-auto flex max-w-screen-2xl items-center gap-3 px-4 py-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Landmark className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <h1 className="text-base font-semibold leading-tight sm:text-lg">
                School Financial Analysis
              </h1>
              <p className="hidden text-xs text-muted-foreground sm:block">
                Budgeting &amp; 3-year planning workbench
              </p>
            </div>
            <Badge variant="secondary" className="hidden gap-1 sm:inline-flex">
              <BarChart3 className="h-3.5 w-3.5" />
              3-Year Projection
            </Badge>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setThemeMode(isDark ? 'light' : 'dark')}
              aria-label="Toggle dark mode"
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          </div>
        </header>

        <main className="mx-auto max-w-screen-2xl px-4 py-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Input Panel */}
            <div className="lg:col-span-5 xl:col-span-4">
              <Card className="lg:sticky lg:top-20">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Settings className="h-5 w-5 text-primary" />
                    Parameters
                  </CardTitle>
                  <CardDescription>
                    Adjust assumptions to model turnover, costs, and surplus.
                  </CardDescription>
                </CardHeader>
                <CardContent className="max-h-[calc(100vh-12rem)] overflow-y-auto lg:max-h-[calc(100vh-14rem)]">
                  <Accordion type="multiple" className="w-full">
                    <AccordionItem value="scenarios">
                      <AccordionTrigger>
                        <InfoLabel
                          label="Scenarios"
                          tooltip="Save, load, and manage named sets of model assumptions."
                        />
                      </AccordionTrigger>
                      <AccordionContent className="space-y-3">
                        <div className="space-y-1.5">
                          <Label>
                            <InfoLabel label="Saved Scenarios" tooltip="Choose an existing saved scenario to load or delete." />
                          </Label>
                          <Select
                            value={selectedScenarioId || 'none'}
                            onValueChange={(value) => {
                              const nextId = value === 'none' ? '' : value
                              setSelectedScenarioId(nextId)
                              const scenario = scenarios.find((item) => item.id === nextId)
                              setScenarioName(scenario?.name ?? '')
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="None" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">None</SelectItem>
                              {scenarios.map((scenario) => (
                                <SelectItem key={scenario.id} value={scenario.id}>
                                  {scenario.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1.5">
                          <Label>
                            <InfoLabel label="Scenario Name" tooltip="Name used when saving this set of assumptions." />
                          </Label>
                          <Input
                            value={scenarioName}
                            onChange={(e) => setScenarioName(e.target.value)}
                          />
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleLoadScenario}
                            disabled={!selectedScenarioId}
                          >
                            Load
                          </Button>
                          <Button size="sm" onClick={() => handleSaveScenario('save')}>
                            Save
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleSaveScenario('saveAs')}>
                            Save As
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={handleDeleteScenario}
                            disabled={!selectedScenarioId}
                          >
                            Delete
                          </Button>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="presets">
                      <AccordionTrigger>
                        <InfoLabel
                          label="Presets"
                          tooltip="Quick-start templates that apply predefined assumptions."
                        />
                      </AccordionTrigger>
                      <AccordionContent className="space-y-2.5">
                        {presetOptions.map((preset) => (
                          <div key={preset.id} className="rounded-lg border p-3">
                            <div className="space-y-2">
                              <div>
                                <p className="text-sm font-medium">{preset.label}</p>
                                <p className="text-xs text-muted-foreground">{preset.description}</p>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleApplyPreset(preset.id)}
                              >
                                Apply
                              </Button>
                            </div>
                          </div>
                        ))}
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="enrollment">
                      <AccordionTrigger>
                        <InfoLabel
                          label="Enrollment"
                          tooltip="Student numbers used to calculate fee revenue."
                        />
                      </AccordionTrigger>
                      <AccordionContent className="space-y-3">
                        <SwitchField
                          label="Set students per year"
                          tooltip="Enable separate enrollment values for Year 1, Year 2, and Year 3."
                          checked={useStudentsByYear}
                          onCheckedChange={setUseStudentsByYear}
                        />
                        {useStudentsByYear ? (
                          <>
                            <NumberField
                              label="Year 1 Students"
                              tooltip="Projected number of students in Year 1."
                              icon={<Users />}
                              value={numChildrenYear1}
                              onChange={setNumChildrenYear1}
                            />
                            <NumberField
                              label="Year 2 Students"
                              tooltip="Projected number of students in Year 2."
                              icon={<Users />}
                              value={numChildrenYear2}
                              onChange={setNumChildrenYear2}
                            />
                            <NumberField
                              label="Year 3 Students"
                              tooltip="Projected number of students in Year 3."
                              icon={<Users />}
                              value={numChildrenYear3}
                              onChange={setNumChildrenYear3}
                            />
                          </>
                        ) : (
                          <NumberField
                            label="Number of Children"
                            tooltip="Single enrollment value applied across all projected years."
                            icon={<Users />}
                            value={numChildren}
                            onChange={setNumChildren}
                          />
                        )}
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="fees">
                      <AccordionTrigger>
                        <InfoLabel
                          label="Fees & Discounts"
                          tooltip="Fee levels, annual fee changes, and discount assumptions used in turnover."
                        />
                      </AccordionTrigger>
                      <AccordionContent className="space-y-3">
                        <SwitchField
                          label="Set fee per term per year"
                          tooltip="Set explicit fee values for Year 1, Year 2, and Year 3."
                          checked={useFeePerTermByYear}
                          onCheckedChange={setUseFeePerTermByYear}
                        />
                        {useFeePerTermByYear ? (
                          <>
                            <NumberField
                              label="Year 1 Fee per Term"
                              tooltip="Fee charged per term in Year 1."
                              icon={<PoundSterling />}
                              value={feePerTermYear1}
                              onChange={setFeePerTermYear1}
                            />
                            <NumberField
                              label="Year 2 Fee per Term"
                              tooltip="Fee charged per term in Year 2."
                              icon={<PoundSterling />}
                              value={feePerTermYear2}
                              onChange={setFeePerTermYear2}
                            />
                            <NumberField
                              label="Year 3 Fee per Term"
                              tooltip="Fee charged per term in Year 3."
                              icon={<PoundSterling />}
                              value={feePerTermYear3}
                              onChange={setFeePerTermYear3}
                            />
                          </>
                        ) : (
                          <NumberField
                            label="Fee per Term"
                            tooltip="Current base fee per term used to derive projected fees."
                            icon={<PoundSterling />}
                            value={feePerTerm}
                            onChange={setFeePerTerm}
                          />
                        )}

                        <SwitchField
                          label="Set fee increase per year"
                          tooltip="Apply different annual fee growth rates for each projected year."
                          checked={useFeeIncreaseByYear}
                          onCheckedChange={setUseFeeIncreaseByYear}
                        />
                        {useFeeIncreaseByYear ? (
                          <>
                            <SliderField
                              label="Year 1"
                              tooltip="Percentage fee increase applied for Year 1."
                              value={feeIncreaseYear1}
                              onChange={setFeeIncreaseYear1}
                              min={2}
                              max={6}
                              step={0.1}
                            />
                            <SliderField
                              label="Year 2"
                              tooltip="Percentage fee increase applied for Year 2."
                              value={feeIncreaseYear2}
                              onChange={setFeeIncreaseYear2}
                              min={2}
                              max={6}
                              step={0.1}
                            />
                            <SliderField
                              label="Year 3"
                              tooltip="Percentage fee increase applied for Year 3."
                              value={feeIncreaseYear3}
                              onChange={setFeeIncreaseYear3}
                              min={2}
                              max={6}
                              step={0.1}
                            />
                          </>
                        ) : (
                          <SliderField
                            label="Tuition Fee Increase"
                            tooltip="Single annual fee increase used when per-year fee increases are disabled."
                            value={feeIncrease}
                            onChange={setFeeIncrease}
                            min={2}
                            max={6}
                            step={0.1}
                          />
                        )}

                        <NumberField
                          label="Staff Children"
                          tooltip="Number of staff children receiving a fixed 50% discount."
                          icon={<GraduationCap />}
                          value={numStaffChildren}
                          onChange={(value) =>
                            setNumStaffChildren(Math.max(0, Math.min(value, currentStudentCount)))
                          }
                          helper="Staff children receive 50% discount"
                        />
                        <SliderField
                          label="Other Children Discount"
                          tooltip="Average discount rate applied to non-staff children."
                          value={otherChildrenDiscount}
                          onChange={setOtherChildrenDiscount}
                          min={0}
                          max={20}
                          step={0.5}
                        />
                        <div className="rounded-lg border bg-muted/40 p-3">
                          <p className="text-sm font-medium">
                            <InfoLabel
                              label={`Total Discount Effect (calculated): ${formatNumber(calculatedDiscountEffect)}%`}
                              tooltip="Weighted average discount rate used in revenue calculations."
                            />
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            Based on staff children at 50% discount and other children discount.
                          </p>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="staff">
                      <AccordionTrigger>
                        <InfoLabel
                          label="Staff Costs"
                          tooltip="Controls whether staffing costs are estimated by a percentage share or detailed salaries/headcount."
                        />
                      </AccordionTrigger>
                      <AccordionContent className="space-y-3">
                        <SwitchField
                          label="Use detailed staff costs"
                          tooltip="Calculate staff costs from salaries and headcount instead of using a percentage share."
                          checked={useDetailedStaffCosts}
                          onCheckedChange={setUseDetailedStaffCosts}
                        />
                        {useDetailedStaffCosts ? (
                          <>
                            <SwitchField
                              label="Set staff salaries & headcount per year"
                              tooltip="Set separate salary and headcount assumptions for each projected year."
                              checked={useStaffByYear}
                              onCheckedChange={setUseStaffByYear}
                            />
                            {useStaffByYear ? (
                              <>
                                <NumberField
                                  label="Year 1 Teacher Salary"
                                  tooltip="Average annual teacher salary in Year 1."
                                  icon={<PoundSterling />}
                                  value={avgAnnualSalaryYear1}
                                  onChange={setAvgAnnualSalaryYear1}
                                />
                                {usePayIncreaseByYear && (
                                  <SliderField
                                    label="Year 1 Pay Increase"
                                    tooltip="Salary growth rate used to derive Year 1 staff salaries."
                                    value={payIncreaseYear1}
                                    onChange={applyYear1PayIncrease}
                                    min={0}
                                    max={5}
                                    step={0.1}
                                  />
                                )}
                                <NumberField
                                  label="Year 1 Teachers"
                                  tooltip="Number of teachers in Year 1."
                                  icon={<Users />}
                                  value={numTeachersYear1}
                                  onChange={setNumTeachersYear1}
                                />
                                <NumberField
                                  label="Year 1 Support Salary"
                                  tooltip="Average annual support-staff salary in Year 1."
                                  icon={<PoundSterling />}
                                  value={avgSupportSalaryYear1}
                                  onChange={setAvgSupportSalaryYear1}
                                />
                                <NumberField
                                  label="Year 1 Support Staff"
                                  tooltip="Number of support staff in Year 1."
                                  icon={<Users />}
                                  value={numSupportYear1}
                                  onChange={setNumSupportYear1}
                                />

                                <Separator />

                                <NumberField
                                  label="Year 2 Teacher Salary"
                                  tooltip="Average annual teacher salary in Year 2."
                                  icon={<PoundSterling />}
                                  value={avgAnnualSalaryYear2}
                                  onChange={setAvgAnnualSalaryYear2}
                                />
                                {usePayIncreaseByYear && (
                                  <SliderField
                                    label="Year 2 Pay Increase"
                                    tooltip="Salary growth rate used to derive Year 2 staff salaries."
                                    value={payIncreaseYear2}
                                    onChange={applyYear2PayIncrease}
                                    min={0}
                                    max={5}
                                    step={0.1}
                                  />
                                )}
                                <NumberField
                                  label="Year 2 Teachers"
                                  tooltip="Number of teachers in Year 2."
                                  icon={<Users />}
                                  value={numTeachersYear2}
                                  onChange={setNumTeachersYear2}
                                />
                                <NumberField
                                  label="Year 2 Support Salary"
                                  tooltip="Average annual support-staff salary in Year 2."
                                  icon={<PoundSterling />}
                                  value={avgSupportSalaryYear2}
                                  onChange={setAvgSupportSalaryYear2}
                                />
                                <NumberField
                                  label="Year 2 Support Staff"
                                  tooltip="Number of support staff in Year 2."
                                  icon={<Users />}
                                  value={numSupportYear2}
                                  onChange={setNumSupportYear2}
                                />

                                <Separator />

                                <NumberField
                                  label="Year 3 Teacher Salary"
                                  tooltip="Average annual teacher salary in Year 3."
                                  icon={<PoundSterling />}
                                  value={avgAnnualSalaryYear3}
                                  onChange={setAvgAnnualSalaryYear3}
                                />
                                {usePayIncreaseByYear && (
                                  <SliderField
                                    label="Year 3 Pay Increase"
                                    tooltip="Salary growth rate used to derive Year 3 staff salaries."
                                    value={payIncreaseYear3}
                                    onChange={applyYear3PayIncrease}
                                    min={0}
                                    max={5}
                                    step={0.1}
                                  />
                                )}
                                <NumberField
                                  label="Year 3 Teachers"
                                  tooltip="Number of teachers in Year 3."
                                  icon={<Users />}
                                  value={numTeachersYear3}
                                  onChange={setNumTeachersYear3}
                                />
                                <NumberField
                                  label="Year 3 Support Salary"
                                  tooltip="Average annual support-staff salary in Year 3."
                                  icon={<PoundSterling />}
                                  value={avgSupportSalaryYear3}
                                  onChange={setAvgSupportSalaryYear3}
                                />
                                <NumberField
                                  label="Year 3 Support Staff"
                                  tooltip="Number of support staff in Year 3."
                                  icon={<Users />}
                                  value={numSupportYear3}
                                  onChange={setNumSupportYear3}
                                />
                              </>
                            ) : (
                              <>
                                <NumberField
                                  label="Average Teacher Salary"
                                  tooltip="Average annual teacher salary used across all years."
                                  icon={<PoundSterling />}
                                  value={avgAnnualSalary}
                                  onChange={setAvgAnnualSalary}
                                />
                                <NumberField
                                  label="Number of Teachers"
                                  tooltip="Teacher headcount used across all years."
                                  icon={<Users />}
                                  value={numTeachers}
                                  onChange={setNumTeachers}
                                />
                                <NumberField
                                  label="Average Support Salary"
                                  tooltip="Average annual support-staff salary used across all years."
                                  icon={<PoundSterling />}
                                  value={avgSupportSalary}
                                  onChange={setAvgSupportSalary}
                                />
                                <NumberField
                                  label="Number of Support Staff"
                                  tooltip="Support-staff headcount used across all years."
                                  icon={<Users />}
                                  value={numSupportStaff}
                                  onChange={setNumSupportStaff}
                                />
                              </>
                            )}
                          </>
                        ) : (
                          <SliderField
                            label="Staff Cost Share"
                            tooltip="Percentage of total costs attributed to staff costs when detailed mode is disabled."
                            value={staffCostShare}
                            onChange={setStaffCostShare}
                            min={50}
                            max={90}
                            step={1}
                          />
                        )}

                        <SwitchField
                          label="Set pay increase per year"
                          tooltip="Apply different staff pay growth rates for each projected year."
                          checked={usePayIncreaseByYear}
                          onCheckedChange={handleUsePayIncreaseByYearChange}
                        />
                        {usePayIncreaseByYear ? (
                          !useStaffByYear && (
                            <>
                              <SliderField
                                label="Year 1"
                                tooltip="Pay increase applied to staff costs in Year 1."
                                value={payIncreaseYear1}
                                onChange={setPayIncreaseYear1}
                                min={0}
                                max={5}
                                step={0.1}
                              />
                              <SliderField
                                label="Year 2"
                                tooltip="Pay increase applied to staff costs in Year 2."
                                value={payIncreaseYear2}
                                onChange={setPayIncreaseYear2}
                                min={0}
                                max={5}
                                step={0.1}
                              />
                              <SliderField
                                label="Year 3"
                                tooltip="Pay increase applied to staff costs in Year 3."
                                value={payIncreaseYear3}
                                onChange={setPayIncreaseYear3}
                                min={0}
                                max={5}
                                step={0.1}
                              />
                            </>
                          )
                        ) : (
                          <SliderField
                            label="Staff Pay Increase"
                            tooltip="Single annual pay increase used when per-year pay increases are disabled."
                            value={payIncrease}
                            onChange={setPayIncrease}
                            min={0}
                            max={5}
                            step={0.1}
                          />
                        )}
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="inflation">
                      <AccordionTrigger>
                        <InfoLabel
                          label="Inflation"
                          tooltip="Annual non-staff cost growth assumptions for each projected year."
                        />
                      </AccordionTrigger>
                      <AccordionContent className="space-y-3">
                        <SliderField
                          label="Year 1"
                          tooltip="Inflation rate applied to non-staff costs for Year 1."
                          value={inflationYear1}
                          onChange={setInflationYear1}
                          min={0}
                          max={10}
                          step={0.1}
                        />
                        <SliderField
                          label="Year 2"
                          tooltip="Inflation rate applied to non-staff costs for Year 2."
                          value={inflationYear2}
                          onChange={setInflationYear2}
                          min={0}
                          max={10}
                          step={0.1}
                        />
                        <SliderField
                          label="Year 3"
                          tooltip="Inflation rate applied to non-staff costs for Year 3."
                          value={inflationYear3}
                          onChange={setInflationYear3}
                          min={0}
                          max={10}
                          step={0.1}
                        />
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="current-position">
                      <AccordionTrigger>
                        <InfoLabel
                          label="Current Position"
                          tooltip="Baseline financial position used as the starting point for projections."
                        />
                      </AccordionTrigger>
                      <AccordionContent className="space-y-3">
                        <div className="rounded-lg bg-primary p-4 text-primary-foreground">
                          <p className="text-xs font-medium uppercase tracking-wide opacity-90">
                            Gross Annual Revenue
                          </p>
                          <p className="mt-1 text-xl font-semibold">
                            {formatCurrency(currentStudentCount * currentFeePerTerm * 3)}
                          </p>
                          <p className="mt-1 text-sm opacity-90">
                            Turnover:{' '}
                            {formatCurrency(
                              currentStudentCount * currentFeePerTerm * 3 * (1 - calculatedDiscountEffect / 100),
                            )}
                          </p>
                        </div>
                        <NumberField
                          label="Current Annual Surplus"
                          tooltip="Current yearly surplus amount (turnover minus costs) used as the baseline."
                          icon={<PoundSterling />}
                          value={currentSurplus}
                          onChange={setCurrentSurplus}
                          helper="Surplus = Turnover - Costs"
                        />
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="export" className="border-b-0">
                      <AccordionTrigger>
                        <InfoLabel
                          label="Export"
                          tooltip="Options that control PDF and Excel outputs."
                        />
                      </AccordionTrigger>
                      <AccordionContent className="space-y-3">
                        <SwitchField
                          label="Include charts in PDF"
                          tooltip="If enabled, chart images are added to the PDF export after the tables."
                          checked={includeChartsInExport}
                          onCheckedChange={setIncludeChartsInExport}
                        />
                        <div className="flex flex-wrap gap-2">
                          <Button variant="outline" size="sm" onClick={handleExportPdf}>
                            <FileDown className="h-4 w-4" />
                            Export PDF
                          </Button>
                          <Button variant="outline" size="sm" onClick={handleExportExcel}>
                            <FileSpreadsheet className="h-4 w-4" />
                            Export Excel
                          </Button>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>
            </div>

            {/* Results Panel */}
            <div className="space-y-6 lg:col-span-7 xl:col-span-8">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {summaryCards.map((card) => (
                  <Card key={card.label}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between text-muted-foreground">
                        <span className="text-xs font-medium">{card.label}</span>
                        {card.icon}
                      </div>
                      <p className={cn('mt-2 text-2xl font-semibold tabular-nums', surplusToneClass(card.tone))}>
                        {card.value}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Assumptions Snapshot</CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
                    {[
                      ['Discount Effect', `${formatNumber(calculatedDiscountEffect)}%`],
                      [
                        'Students',
                        useStudentsByYear
                          ? `Y1 ${formatNumber(numChildrenYear1)} / Y2 ${formatNumber(numChildrenYear2)} / Y3 ${formatNumber(numChildrenYear3)}`
                          : formatNumber(numChildren),
                      ],
                      [
                        'Fee per Term',
                        useFeePerTermByYear
                          ? `Y1 £${formatNumber(feePerTermYear1)} / Y2 £${formatNumber(feePerTermYear2)} / Y3 £${formatNumber(feePerTermYear3)}`
                          : `£${formatNumber(feePerTerm)}`,
                      ],
                      [
                        'Fee Increase',
                        useFeeIncreaseByYear
                          ? `Y1 ${formatNumber(feeIncreaseYear1)}% / Y2 ${formatNumber(feeIncreaseYear2)}% / Y3 ${formatNumber(feeIncreaseYear3)}%`
                          : `${formatNumber(feeIncrease)}%`,
                      ],
                      [
                        'Pay Increase',
                        usePayIncreaseByYear
                          ? `Y1 ${formatNumber(payIncreaseYear1)}% / Y2 ${formatNumber(payIncreaseYear2)}% / Y3 ${formatNumber(payIncreaseYear3)}%`
                          : `${formatNumber(payIncrease)}%`,
                      ],
                      [
                        'Staff Costs',
                        useDetailedStaffCosts
                          ? useStaffByYear
                            ? 'Detailed (per year salaries & headcount)'
                            : 'Detailed (salary × headcount)'
                          : `Share ${formatNumber(staffCostShare)}%`,
                      ],
                      [
                        'Inflation',
                        `Y1 ${formatNumber(inflationYear1)}% / Y2 ${formatNumber(inflationYear2)}% / Y3 ${formatNumber(inflationYear3)}%`,
                      ],
                    ].map(([term, value]) => (
                      <div key={term} className="flex justify-between gap-4 border-b border-dashed py-1 text-sm last:border-0">
                        <dt className="font-medium text-muted-foreground">{term}</dt>
                        <dd className="text-right tabular-nums">{value}</dd>
                      </div>
                    ))}
                  </dl>
                </CardContent>
              </Card>

              {/* Financial Table */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    Financial Projections
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Year</TableHead>
                        <TableHead className="text-right">Gross Revenue</TableHead>
                        <TableHead className="text-right">Discounts</TableHead>
                        <TableHead className="text-right">Turnover</TableHead>
                        <TableHead className="text-right">Costs</TableHead>
                        <TableHead className="text-right">Annual Surplus</TableHead>
                        <TableHead className="text-right">Cumulative Surplus</TableHead>
                        <TableHead className="text-center">Fee %</TableHead>
                        <TableHead className="text-center">Pay %</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {financialData.map((row, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-semibold">{row.year}</TableCell>
                          <TableCell className="text-right tabular-nums">{formatCurrency(row.grossRevenue)}</TableCell>
                          <TableCell className="text-right tabular-nums text-destructive">
                            {formatCurrency(-row.discountAmount)}
                          </TableCell>
                          <TableCell className="text-right tabular-nums">{formatCurrency(row.revenue)}</TableCell>
                          <TableCell className="text-right tabular-nums">{formatCurrency(row.costs)}</TableCell>
                          <TableCell
                            className={cn(
                              'text-right font-semibold tabular-nums',
                              row.annualSurplus >= 0 ? 'text-success' : 'text-destructive',
                            )}
                          >
                            {formatCurrency(row.annualSurplus)}
                          </TableCell>
                          <TableCell
                            className={cn(
                              'text-right font-semibold tabular-nums',
                              row.netPosition >= 0 ? 'text-success' : 'text-destructive',
                            )}
                          >
                            {formatCurrency(row.netPosition)}
                          </TableCell>
                          <TableCell className="text-center">
                            {row.feeIncrease > 0 ? (
                              <Badge>{row.feeIncrease}%</Badge>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            {row.payIncrease > 0 ? (
                              <Badge variant="secondary">{row.payIncrease}%</Badge>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Charts */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Turnover vs Costs Over Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <div ref={turnoverChartRef}>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={financialData}>
                        <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} />
                        <XAxis dataKey="year" tick={{ fill: chartAxisColor }} />
                        <YAxis tick={{ fill: chartAxisColor }} tickFormatter={(value) => `£${(value / 1000).toFixed(0)}k`} />
                        <RechartsTooltip
                          formatter={(value) => formatTooltipValue(value)}
                          contentStyle={chartTooltipContentStyle}
                          labelStyle={chartTooltipLabelStyle}
                          itemStyle={chartTooltipItemStyle}
                        />
                        <Legend />
                        <Line type="monotone" dataKey="revenue" stroke="#16a34a" strokeWidth={2} name="Turnover" />
                        <Line type="monotone" dataKey="costs" stroke="#dc2626" strokeWidth={2} name="Costs" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Surplus Over Time (Annual vs Cumulative)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div ref={surplusChartRef}>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={financialData}>
                        <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} />
                        <XAxis dataKey="year" tick={{ fill: chartAxisColor }} />
                        <YAxis tick={{ fill: chartAxisColor }} tickFormatter={(value) => `£${(value / 1000).toFixed(0)}k`} />
                        <RechartsTooltip
                          formatter={(value) => formatTooltipValue(value)}
                          contentStyle={chartTooltipContentStyle}
                          labelStyle={chartTooltipLabelStyle}
                          itemStyle={chartTooltipItemStyle}
                        />
                        <Legend />
                        <Bar dataKey="annualSurplus" name="Annual Surplus" fill="#2563eb" />
                        <Bar dataKey="netPosition" name="Cumulative Surplus" fill="#9333ea" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Revenue Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div ref={breakdownChartRef}>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={financialData}>
                        <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} />
                        <XAxis dataKey="year" tick={{ fill: chartAxisColor }} />
                        <YAxis tick={{ fill: chartAxisColor }} tickFormatter={(value) => `£${(value / 1000).toFixed(0)}k`} />
                        <RechartsTooltip
                          formatter={(value) => formatTooltipValue(value)}
                          contentStyle={chartTooltipContentStyle}
                          labelStyle={chartTooltipLabelStyle}
                          itemStyle={chartTooltipItemStyle}
                        />
                        <Legend />
                        <Bar dataKey="revenue" fill="#16a34a" name="Turnover" />
                        <Bar dataKey="costs" fill="#dc2626" name="Costs" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Manual Calculations */}
              <Card>
                <CardContent className="pt-6">
                  <Accordion type="single" collapsible defaultValue="manual">
                    <AccordionItem value="manual" className="border-b-0">
                      <AccordionTrigger className="py-0">
                        <span className="flex items-center gap-2 text-lg font-semibold">
                          <Calculator className="h-5 w-5 text-primary" />
                          Manual Calculations
                        </span>
                      </AccordionTrigger>
                      <AccordionContent className="pt-4">
                        <div className="mb-4 rounded-lg bg-muted/60 p-4">
                          <p className="mb-2 font-semibold">Base Calculations</p>
                          <div className="space-y-1 text-sm">
                            <p>
                              <strong>Gross Annual Revenue:</strong> {formatNumber(currentStudentCount)} × £
                              {formatNumber(currentFeePerTerm)} × 3 = {formatCurrency(baseCalculations.grossAnnualRevenue)}
                            </p>
                            <p>
                              <strong>Discount Amount:</strong> {formatCurrency(baseCalculations.grossAnnualRevenue)} ×{' '}
                              {formatNumber(calculatedDiscountEffect)}% = {formatCurrency(baseCalculations.discountAmount)}
                            </p>
                            <p>
                              <strong>Current Turnover:</strong> {formatCurrency(baseCalculations.grossAnnualRevenue)} -{' '}
                              {formatCurrency(baseCalculations.discountAmount)} ={' '}
                              {formatCurrency(baseCalculations.currentAnnualRevenue)}
                            </p>
                            <p>
                              <strong>Current Costs:</strong> {formatCurrency(baseCalculations.currentAnnualRevenue)} -{' '}
                              {formatCurrency(currentSurplus)} = {formatCurrency(baseCalculations.currentAnnualCosts)}
                            </p>
                            {useDetailedStaffCosts ? (
                              <>
                                <p>
                                  <strong>Staff Costs:</strong> ({formatNumber(currentTeacherCount)} ×{' '}
                                  {formatCurrency(currentTeacherSalary)}) + ({formatNumber(currentSupportCount)} ×{' '}
                                  {formatCurrency(currentSupportSalary)}) = {formatCurrency(baseCalculations.staffCosts)}
                                </p>
                                <p>
                                  <strong>Non-Staff Costs:</strong> {formatCurrency(baseCalculations.currentAnnualCosts)} -{' '}
                                  {formatCurrency(baseCalculations.staffCosts)} ={' '}
                                  {formatCurrency(baseCalculations.nonStaffCosts)}
                                </p>
                              </>
                            ) : (
                              <>
                                <p>
                                  <strong>Staff Costs:</strong> {formatCurrency(baseCalculations.currentAnnualCosts)} ×{' '}
                                  {formatNumber(staffCostShare)}% = {formatCurrency(baseCalculations.staffCosts)}
                                </p>
                                <p>
                                  <strong>Non-Staff Costs:</strong> {formatCurrency(baseCalculations.currentAnnualCosts)} ×{' '}
                                  {formatNumber(100 - staffCostShare)}% = {formatCurrency(baseCalculations.nonStaffCosts)}
                                </p>
                              </>
                            )}
                          </div>
                        </div>

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
                            <div key={yearNum} className="mb-3 rounded-lg border p-4">
                              <p className="mb-2 font-semibold text-primary">Year {yearNum} Calculations</p>
                              <div className="space-y-1.5 text-sm">
                                <p>
                                  <strong>Step 1:</strong> Gross Revenue = {formatNumber(studentsForYear)} × £
                                  {formatNumber(feePerTermForYear)} × 3 = {formatCurrency(year.grossRevenue)}
                                </p>
                                <p>
                                  <strong>Step 2:</strong> Fee Change = £{formatNumber(previousFeePerTermForYear)} → £
                                  {formatNumber(feePerTermForYear)} ({formatNumber(feeIncreaseForYear)}%)
                                </p>
                                <p>
                                  <strong>Step 3:</strong> Discount = {formatCurrency(year.grossRevenue)} ×{' '}
                                  {formatNumber(calculatedDiscountEffect)}% = {formatCurrency(year.discountAmount)}
                                </p>
                                <p>
                                  <strong>Step 4:</strong> Turnover = {formatCurrency(year.grossRevenue)} -{' '}
                                  {formatCurrency(year.discountAmount)} = {formatCurrency(year.revenue)}
                                </p>
                                {usesDetailedInputsForStaff ? (
                                  <p>
                                    <strong>Step 5:</strong> Staff Costs = ({formatNumber(teachersByYear[index])} ×{' '}
                                    {formatCurrency(teacherSalaryByYear[index])}) + ({formatNumber(supportByYear[index])} ×{' '}
                                    {formatCurrency(supportSalaryByYear[index])}) = {formatCurrency(staffCostsAfterPay)}
                                  </p>
                                ) : (
                                  <p>
                                    <strong>Step 5:</strong> Staff Costs = {formatCurrency(previousYear.staffCosts)} × (1 +{' '}
                                    {formatNumber(payIncreaseForYear)}%) = {formatCurrency(staffCostsAfterPay)}
                                  </p>
                                )}
                                <p>
                                  <strong>Step 6:</strong> Non-Staff Costs = {formatCurrency(previousYear.nonStaffCosts)} ×{' '}
                                  (1 + {inflationRate}%) = {formatCurrency(nonStaffCostsAfterInflation)}
                                </p>
                                <p>
                                  <strong>Step 7:</strong> Total Costs = {formatCurrency(staffCostsAfterPay)} +{' '}
                                  {formatCurrency(nonStaffCostsAfterInflation)} = {formatCurrency(combinedCosts)}
                                </p>
                                <p>
                                  <strong>Step 8:</strong> Annual Surplus = {formatCurrency(year.revenue)} -{' '}
                                  {formatCurrency(year.costs)} = {formatCurrency(year.annualSurplus)}
                                </p>
                                <p>
                                  <strong>Step 9:</strong> Cumulative Surplus = Previous Surplus + Annual Surplus ={' '}
                                  {formatCurrency(previousYear.netPosition)} + {formatCurrency(year.annualSurplus)} ={' '}
                                  {formatCurrency(year.netPosition)}
                                </p>
                              </div>
                            </div>
                          )
                        })}
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </TooltipProvider>
  )
}

export default App
