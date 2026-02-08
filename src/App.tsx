import { useState, useMemo } from 'react'
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  AppBar,
  Toolbar,
  Divider,
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
  const [feePerTerm, setFeePerTerm] = useState(7000)
  const [feeIncrease, setFeeIncrease] = useState(3)
  const [feeIncreaseYear1, setFeeIncreaseYear1] = useState(3)
  const [feeIncreaseYear2, setFeeIncreaseYear2] = useState(3)
  const [feeIncreaseYear3, setFeeIncreaseYear3] = useState(3)
  const [payIncrease, setPayIncrease] = useState(2)
  const [payIncreaseYear1, setPayIncreaseYear1] = useState(2)
  const [payIncreaseYear2, setPayIncreaseYear2] = useState(2)
  const [payIncreaseYear3, setPayIncreaseYear3] = useState(2)
  const [currentSurplus, setCurrentSurplus] = useState(100000)
  const [numStaffChildren, setNumStaffChildren] = useState(0)
  const [otherChildrenDiscount, setOtherChildrenDiscount] = useState(15)
  const [staffCostShare, setStaffCostShare] = useState(70)
  const [useYearBreakdown, setUseYearBreakdown] = useState(false)
  const [inflationBase, setInflationBase] = useState(2.5)
  const [inflationYear1, setInflationYear1] = useState(2.5)
  const [inflationYear2, setInflationYear2] = useState(2.3)
  const [inflationYear3, setInflationYear3] = useState(2.2)

  const calculatedDiscountEffect = useMemo(() => {
    const numOtherChildren = Math.max(0, numChildren - numStaffChildren)
    const staffChildrenDiscount = numStaffChildren * 0.5
    const otherChildrenDiscountAmount = numOtherChildren * (otherChildrenDiscount / 100)

    return numChildren > 0
      ? ((staffChildrenDiscount + otherChildrenDiscountAmount) / numChildren) * 100
      : 0
  }, [numChildren, numStaffChildren, otherChildrenDiscount])

  const feeIncreaseByYear = useMemo(() => {
    return useYearBreakdown
      ? [feeIncreaseYear1, feeIncreaseYear2, feeIncreaseYear3]
      : [feeIncrease, feeIncrease, feeIncrease]
  }, [useYearBreakdown, feeIncrease, feeIncreaseYear1, feeIncreaseYear2, feeIncreaseYear3])

  const payIncreaseByYear = useMemo(() => {
    return useYearBreakdown
      ? [payIncreaseYear1, payIncreaseYear2, payIncreaseYear3]
      : [payIncrease, payIncrease, payIncrease]
  }, [useYearBreakdown, payIncrease, payIncreaseYear1, payIncreaseYear2, payIncreaseYear3])

  const inflationByYear = useMemo(() => {
    return useYearBreakdown
      ? [inflationYear1, inflationYear2, inflationYear3]
      : [inflationBase, inflationBase, inflationBase]
  }, [useYearBreakdown, inflationBase, inflationYear1, inflationYear2, inflationYear3])

  // Calculate financial projections
  const financialData = useMemo(() => {
    const termsPerYear = 3
    const effectiveDiscount = calculatedDiscountEffect / 100
    const grossAnnualRevenue = numChildren * feePerTerm * termsPerYear
    const discountAmount = grossAnnualRevenue * effectiveDiscount
    const currentAnnualRevenue = grossAnnualRevenue - discountAmount
    const currentAnnualCosts = currentAnnualRevenue - currentSurplus
    let staffCosts = currentAnnualCosts * (staffCostShare / 100)
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

    const year1GrossRevenue = grossAnnualRevenue * year1FeeMultiplier
    const year1DiscountAmount = year1GrossRevenue * effectiveDiscount
    const year1Revenue = year1GrossRevenue - year1DiscountAmount
    staffCosts = staffCosts * year1PayMultiplier
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

    const year2GrossRevenue = year1GrossRevenue * year2FeeMultiplier
    const year2DiscountAmount = year2GrossRevenue * effectiveDiscount
    const year2Revenue = year2GrossRevenue - year2DiscountAmount
    staffCosts = staffCosts * year2PayMultiplier
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

    const year3GrossRevenue = year2GrossRevenue * year3FeeMultiplier
    const year3DiscountAmount = year3GrossRevenue * effectiveDiscount
    const year3Revenue = year3GrossRevenue - year3DiscountAmount
    staffCosts = staffCosts * year3PayMultiplier
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
    numChildren,
    feePerTerm,
    feeIncreaseByYear,
    payIncreaseByYear,
    currentSurplus,
    calculatedDiscountEffect,
    staffCostShare,
    inflationByYear,
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
    const grossAnnualRevenue = numChildren * feePerTerm * termsPerYear
    const discountAmount = grossAnnualRevenue * effectiveDiscount
    const currentAnnualRevenue = grossAnnualRevenue - discountAmount
    const currentAnnualCosts = currentAnnualRevenue - currentSurplus

    return {
      termsPerYear,
      effectiveDiscount,
      grossAnnualRevenue,
      discountAmount,
      currentAnnualRevenue,
      currentAnnualCosts,
      staffCosts: currentAnnualCosts * (staffCostShare / 100),
      nonStaffCosts: currentAnnualCosts * (1 - staffCostShare / 100),
    }
  }, [numChildren, feePerTerm, calculatedDiscountEffect, currentSurplus, staffCostShare])

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
          <Grid container spacing={3}>
            {/* Input Panel */}
            <Grid item xs={12} md={4}>
              <Card elevation={3}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Settings sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h5" component="h2">
                      Parameters
                    </Typography>
                  </Box>

                  <Stack spacing={3}>
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

                    <TextField
                      label="Staff Children"
                      type="number"
                      value={numStaffChildren}
                      onChange={(e) =>
                        setNumStaffChildren(Math.max(0, Math.min(Number(e.target.value), numChildren)))
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

                    <Box>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={useYearBreakdown}
                            onChange={(e) => setUseYearBreakdown(e.target.checked)}
                            color="primary"
                          />
                        }
                        label="Break down increases by year"
                      />
                    </Box>

                    {useYearBreakdown ? (
                      <>
                        <Accordion defaultExpanded>
                          <AccordionSummary expandIcon={<ExpandMore />}>
                            <Typography>Fee Increase by Year</Typography>
                          </AccordionSummary>
                          <AccordionDetails>
                            <Stack spacing={2}>
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
                            </Stack>
                          </AccordionDetails>
                        </Accordion>

                        <Accordion defaultExpanded>
                          <AccordionSummary expandIcon={<ExpandMore />}>
                            <Typography>Pay Increase by Year</Typography>
                          </AccordionSummary>
                          <AccordionDetails>
                            <Stack spacing={2}>
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
                            </Stack>
                          </AccordionDetails>
                        </Accordion>
                      </>
                    ) : (
                      <>
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
                      </>
                    )}

                    <Paper elevation={0} sx={{ p: 2, bgcolor: 'primary.light', color: 'white' }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Gross Annual Revenue
                      </Typography>
                      <Typography variant="h6">
                        {formatCurrency(numChildren * feePerTerm * 3)}
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 1, opacity: 0.9 }}>
                        Turnover: {formatCurrency(
                          (numChildren * feePerTerm * 3) * (1 - calculatedDiscountEffect / 100)
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

                    <Divider />

                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      Inflation Rates
                    </Typography>

                    {useYearBreakdown ? (
                      <Accordion defaultExpanded>
                        <AccordionSummary expandIcon={<ExpandMore />}>
                          <Typography>Inflation by Year</Typography>
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
                    ) : (
                      <Box>
                        <Typography gutterBottom>Inflation (all years): {inflationBase}%</Typography>
                        <Slider
                          value={inflationBase}
                          onChange={(_, value) => setInflationBase(value as number)}
                          min={0}
                          max={10}
                          step={0.1}
                          valueLabelDisplay="auto"
                        />
                      </Box>
                    )}
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
                    </CardContent>
                  </Card>

                  <Card elevation={3}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Surplus Over Time
                      </Typography>
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
                    </CardContent>
                  </Card>

                  <Card elevation={3}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Revenue Breakdown
                      </Typography>
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
                    </CardContent>
                  </Card>
                </Stack>

                {/* Manual Calculations */}
                <Card elevation={3}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <Calculate sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography variant="h5" component="h2">
                        Manual Calculations
                      </Typography>
                    </Box>

                    <Paper elevation={0} sx={{ p: 2, mb: 3, bgcolor: 'grey.50' }}>
                      <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                        Base Calculations
                      </Typography>
                      <Stack spacing={1}>
                        <Typography variant="body2">
                          <strong>Gross Annual Revenue:</strong> {numChildren} × £{formatNumber(feePerTerm)} × 3 ={' '}
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
                        <Typography variant="body2">
                          <strong>Staff Costs:</strong> {formatCurrency(baseCalculations.currentAnnualCosts)} ×{' '}
                          {formatNumber(staffCostShare)}% = {formatCurrency(baseCalculations.staffCosts)}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Non-Staff Costs:</strong> {formatCurrency(baseCalculations.currentAnnualCosts)} ×{' '}
                          {formatNumber(100 - staffCostShare)}% = {formatCurrency(baseCalculations.nonStaffCosts)}
                        </Typography>
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
                  </CardContent>
                </Card>
              </Stack>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </ThemeProvider>
  )
}

export default App
