import { useState, useMemo, useEffect, useRef } from 'react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  Cell,
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

interface FinancialData {
  year: string
  revenue: number
  costs: number
  netPosition: number
  feeIncrease: number
  payIncrease: number
  discountAmount: number
  grossRevenue: number
  staffCosts: number
  nonStaffCosts: number
}

const theme = createTheme({
  palette: {
    mode: 'light',
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
    background: {
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
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        },
      },
    },
  },
})

function App() {
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

  useEffect(() => {
    saveScenarios(scenarios)
  }, [scenarios])

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
        'Surplus',
        'Fee %',
        'Pay %',
      ]],
      body: financialData.map((row) => ([
        row.year,
        formatCurrency(row.grossRevenue),
        formatCurrency(-row.discountAmount),
        formatCurrency(row.revenue),
        formatCurrency(row.costs),
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

  const currentStudentCount = childrenByYear[0]
  const currentFeePerTerm = feePerTermByYear[0]
  const currentTeacherSalary = teacherSalaryByYear[0]
  const currentSupportSalary = supportSalaryByYear[0]
  const currentTeacherCount = teachersByYear[0]
  const currentSupportCount = supportByYear[0]

  // Calculate financial projections
  const financialData = useMemo(() => {
    const termsPerYear = 3
    const effectiveDiscount = calculatedDiscountEffect / 100
    const grossAnnualRevenue = currentStudentCount * currentFeePerTerm * termsPerYear
    const discountAmount = grossAnnualRevenue * effectiveDiscount
    const currentAnnualRevenue = grossAnnualRevenue - discountAmount
    const currentAnnualCosts = currentAnnualRevenue - currentSurplus
    let staffCosts = useDetailedStaffCosts
      ? (currentTeacherSalary * currentTeacherCount) + (currentSupportSalary * currentSupportCount)
      : currentAnnualCosts * (staffCostShare / 100)
    let nonStaffCosts = currentAnnualCosts - staffCosts

    const projections: FinancialData[] = []

    projections.push({
      year: 'Current',
      revenue: currentAnnualRevenue,
      costs: currentAnnualCosts,
      netPosition: currentSurplus,
      feeIncrease: 0,
      payIncrease: 0,
      discountAmount: discountAmount,
      grossRevenue: grossAnnualRevenue,
      staffCosts,
      nonStaffCosts,
    })

    // Year 1
    const year1FeeIncrease = feeIncreaseByYear[0]
    const year1PayIncrease = payIncreaseByYear[0]
    const year1InflationRate = inflationByYear[0]
    const year1FeeMultiplier = 1 + year1FeeIncrease / 100
    const year1PayMultiplier = 1 + year1PayIncrease / 100
    const year1InflationMultiplier = 1 + year1InflationRate / 100

    const year1GrossRevenue = childrenByYear[0] * feePerTermByYear[0] * termsPerYear * year1FeeMultiplier
    const year1DiscountAmount = year1GrossRevenue * effectiveDiscount
    const year1Revenue = year1GrossRevenue - year1DiscountAmount
    staffCosts = useDetailedStaffCosts
      ? (
        teacherSalaryByYear[0] * teachersByYear[0]
        + supportSalaryByYear[0] * supportByYear[0]
      ) * year1PayMultiplier
      : staffCosts * year1PayMultiplier
    nonStaffCosts = nonStaffCosts * year1InflationMultiplier
    const year1Costs = staffCosts + nonStaffCosts
    const year1Net = year1Revenue - year1Costs

    projections.push({
      year: 'Year 1',
      revenue: year1Revenue,
      costs: year1Costs,
      netPosition: year1Net,
      feeIncrease: year1FeeIncrease,
      payIncrease: year1PayIncrease,
      discountAmount: year1DiscountAmount,
      grossRevenue: year1GrossRevenue,
      staffCosts,
      nonStaffCosts,
    })

    // Year 2
    const year2FeeIncrease = feeIncreaseByYear[1]
    const year2PayIncrease = payIncreaseByYear[1]
    const year2InflationRate = inflationByYear[1]
    const year2FeeMultiplier = 1 + year2FeeIncrease / 100
    const year2PayMultiplier = 1 + year2PayIncrease / 100
    const year2InflationMultiplier = 1 + year2InflationRate / 100

    const year2GrossRevenue = childrenByYear[1] * feePerTermByYear[1] * termsPerYear * year2FeeMultiplier
    const year2DiscountAmount = year2GrossRevenue * effectiveDiscount
    const year2Revenue = year2GrossRevenue - year2DiscountAmount
    staffCosts = useDetailedStaffCosts
      ? (
        teacherSalaryByYear[1] * teachersByYear[1]
        + supportSalaryByYear[1] * supportByYear[1]
      ) * year2PayMultiplier
      : staffCosts * year2PayMultiplier
    nonStaffCosts = nonStaffCosts * year2InflationMultiplier
    const year2Costs = staffCosts + nonStaffCosts
    const year2Net = year2Revenue - year2Costs

    projections.push({
      year: 'Year 2',
      revenue: year2Revenue,
      costs: year2Costs,
      netPosition: year2Net,
      feeIncrease: year2FeeIncrease,
      payIncrease: year2PayIncrease,
      discountAmount: year2DiscountAmount,
      grossRevenue: year2GrossRevenue,
      staffCosts,
      nonStaffCosts,
    })

    // Year 3
    const year3FeeIncrease = feeIncreaseByYear[2]
    const year3PayIncrease = payIncreaseByYear[2]
    const year3InflationRate = inflationByYear[2]
    const year3FeeMultiplier = 1 + year3FeeIncrease / 100
    const year3PayMultiplier = 1 + year3PayIncrease / 100
    const year3InflationMultiplier = 1 + year3InflationRate / 100

    const year3GrossRevenue = childrenByYear[2] * feePerTermByYear[2] * termsPerYear * year3FeeMultiplier
    const year3DiscountAmount = year3GrossRevenue * effectiveDiscount
    const year3Revenue = year3GrossRevenue - year3DiscountAmount
    staffCosts = useDetailedStaffCosts
      ? (
        teacherSalaryByYear[2] * teachersByYear[2]
        + supportSalaryByYear[2] * supportByYear[2]
      ) * year3PayMultiplier
      : staffCosts * year3PayMultiplier
    nonStaffCosts = nonStaffCosts * year3InflationMultiplier
    const year3Costs = staffCosts + nonStaffCosts
    const year3Net = year3Revenue - year3Costs

    projections.push({
      year: 'Year 3',
      revenue: year3Revenue,
      costs: year3Costs,
      netPosition: year3Net,
      feeIncrease: year3FeeIncrease,
      payIncrease: year3PayIncrease,
      discountAmount: year3DiscountAmount,
      grossRevenue: year3GrossRevenue,
      staffCosts,
      nonStaffCosts,
    })

    return projections
  }, [
    feeIncreaseByYear,
    feePerTermByYear,
    payIncreaseByYear,
    inflationByYear,
    childrenByYear,
    teachersByYear,
    supportByYear,
    teacherSalaryByYear,
    supportSalaryByYear,
    currentStudentCount,
    currentFeePerTerm,
    currentTeacherSalary,
    currentSupportSalary,
    currentTeacherCount,
    currentSupportCount,
    currentSurplus,
    calculatedDiscountEffect,
    staffCostShare,
    useDetailedStaffCosts,
  ])

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

  const baseCalculations = useMemo(() => {
    const termsPerYear = 3
    const effectiveDiscount = calculatedDiscountEffect / 100
    const grossAnnualRevenue = currentStudentCount * currentFeePerTerm * termsPerYear
    const discountAmount = grossAnnualRevenue * effectiveDiscount
    const currentAnnualRevenue = grossAnnualRevenue - discountAmount
    const currentAnnualCosts = currentAnnualRevenue - currentSurplus
    const staffCosts = useDetailedStaffCosts
      ? (currentTeacherSalary * currentTeacherCount) + (currentSupportSalary * currentSupportCount)
      : currentAnnualCosts * (staffCostShare / 100)
    const nonStaffCosts = currentAnnualCosts - staffCosts

    return {
      termsPerYear,
      effectiveDiscount,
      grossAnnualRevenue,
      discountAmount,
      currentAnnualRevenue,
      currentAnnualCosts,
      staffCosts,
      nonStaffCosts,
    }
  }, [
    currentFeePerTerm,
    currentStudentCount,
    calculatedDiscountEffect,
    currentSurplus,
    staffCostShare,
    useDetailedStaffCosts,
    currentTeacherSalary,
    currentSupportSalary,
    currentTeacherCount,
    currentSupportCount,
  ])

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
                                onChange={(e) => setUsePayIncreaseByYear(e.target.checked)}
                                color="primary"
                              />
                            }
                            label="Set pay increase per year"
                          />
                          {usePayIncreaseByYear ? (
                            <>
                              <Box>
                                <Typography gutterBottom>Year 1: {payIncreaseYear1}%</Typography>
                                <Slider
                                  value={payIncreaseYear1}
                                  onChange={(_, value) => setPayIncreaseYear1(value as number)}
                                  min={1}
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
                                  min={1}
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
                                  min={1}
                                  max={5}
                                  step={0.1}
                                  marks
                                  valueLabelDisplay="auto"
                                />
                              </Box>
                            </>
                          ) : (
                            <Box>
                              <Typography gutterBottom>
                                Staff Pay Increase: {payIncrease}%
                              </Typography>
                              <Slider
                                value={payIncrease}
                                onChange={(_, value) => setPayIncrease(value as number)}
                                min={1}
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
                          <Paper elevation={0} sx={{ p: 2, bgcolor: 'primary.light', color: 'white' }}>
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
                          <Button variant="outlined" onClick={handleExportPdf}>
                            Export PDF
                          </Button>
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
                          Year 3 Surplus
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
                  <Grid item xs={12} sm={6} md={3}>
                    <Card>
                      <CardContent>
                        <Typography color="textSecondary" gutterBottom variant="body2">
                          3-Year Change
                        </Typography>
                        <Typography
                          variant="h6"
                          color={
                            financialData[3].netPosition - financialData[0].netPosition >= 0
                              ? 'success.main'
                              : 'error.main'
                          }
                        >
                          {formatCurrency(
                            financialData[3].netPosition - financialData[0].netPosition
                          )}
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
                            <TableCell align="right"><strong>Surplus</strong></TableCell>
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
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="year" />
                          <YAxis tickFormatter={(value) => `£${(value / 1000).toFixed(0)}k`} />
                          <Tooltip formatter={(value) => formatTooltipValue(value)} />
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
                        Surplus Over Time
                      </Typography>
                      <Box ref={surplusChartRef}>
                        <ResponsiveContainer width="100%" height={250}>
                          <BarChart data={financialData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="year" />
                            <YAxis tickFormatter={(value) => `£${(value / 1000).toFixed(0)}k`} />
                            <Tooltip formatter={(value) => formatTooltipValue(value)} />
                            <Legend />
                            <Bar dataKey="netPosition" name="Surplus">
                              {financialData.map((entry, index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={entry.netPosition < 0 ? '#d32f2f' : '#1976d2'}
                                />
                              ))}
                            </Bar>
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
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="year" />
                            <YAxis tickFormatter={(value) => `£${(value / 1000).toFixed(0)}k`} />
                            <Tooltip formatter={(value) => formatTooltipValue(value)} />
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
                    <Paper elevation={0} sx={{ p: 2, mb: 3, bgcolor: 'grey.50' }}>
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
                      const feeIncreaseForYear = feeIncreaseByYear[index]
                      const payIncreaseForYear = payIncreaseByYear[index]
                      const inflationRate = inflationByYear[index]
                      const prevGrossRevenue =
                        index === 0 ? baseCalculations.grossAnnualRevenue : financialData[index].grossRevenue
                      const previousYear = financialData[index]
                      const staffCostsAfterPay = previousYear.staffCosts * (1 + payIncreaseForYear / 100)
                      const nonStaffCostsAfterInflation = previousYear.nonStaffCosts * (1 + inflationRate / 100)
                      const combinedCosts = staffCostsAfterPay + nonStaffCostsAfterInflation

                      return (
                        <Paper key={yearNum} elevation={1} sx={{ p: 2, mb: 2 }}>
                          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
                            Year {yearNum} Calculations
                          </Typography>
                          <Stack spacing={1.5}>
                            <Typography variant="body2">
                              <strong>Step 1:</strong> Gross Revenue = {formatCurrency(prevGrossRevenue)} × (1 +{' '}
                              {feeIncreaseForYear}%) = {formatCurrency(year.grossRevenue)}
                            </Typography>
                            <Typography variant="body2">
                              <strong>Step 2:</strong> Discount = {formatCurrency(year.grossRevenue)} ×{' '}
                              {formatNumber(calculatedDiscountEffect)}% = {formatCurrency(year.discountAmount)}
                            </Typography>
                            <Typography variant="body2">
                              <strong>Step 3:</strong> Turnover = {formatCurrency(year.grossRevenue)} -{' '}
                              {formatCurrency(year.discountAmount)} = {formatCurrency(year.revenue)}
                            </Typography>
                            <Typography variant="body2">
                              <strong>Step 4:</strong> Staff Costs = {formatCurrency(previousYear.staffCosts)} × (1 +{' '}
                              {payIncreaseForYear}%) = {formatCurrency(staffCostsAfterPay)}
                            </Typography>
                            <Typography variant="body2">
                              <strong>Step 5:</strong> Non-Staff Costs = {formatCurrency(previousYear.nonStaffCosts)} ×{' '}
                              (1 + {inflationRate}%) = {formatCurrency(nonStaffCostsAfterInflation)}
                            </Typography>
                            <Typography variant="body2">
                              <strong>Step 6:</strong> Total Costs = {formatCurrency(staffCostsAfterPay)} +{' '}
                              {formatCurrency(nonStaffCostsAfterInflation)} = {formatCurrency(combinedCosts)}
                            </Typography>
                            <Typography variant="body2">
                              <strong>Step 7:</strong> Surplus = {formatCurrency(year.revenue)} -{' '}
                              {formatCurrency(year.costs)} = {formatCurrency(year.netPosition)}
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
