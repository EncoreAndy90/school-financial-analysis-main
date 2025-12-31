import { useState, useMemo } from 'react'
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
  Grid,
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
  IconButton,
  Divider,
  Stack,
  InputAdornment,
} from '@mui/material'
import {
  TrendingUp,
  TrendingDown,
  Settings,
  Assessment,
  Calculate,
  AccountBalance,
  People,
  School,
  AttachMoney,
  Percent,
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
  const [payIncrease, setPayIncrease] = useState(2)
  const [currentSurplus, setCurrentSurplus] = useState(100000)
  const [numStaffChildren, setNumStaffChildren] = useState(0)
  const [otherChildrenDiscount, setOtherChildrenDiscount] = useState(15)
  const [totalDiscountEffect, setTotalDiscountEffect] = useState(12.5)
  const [inflationYear1, setInflationYear1] = useState(2.5)
  const [inflationYear2, setInflationYear2] = useState(2.3)
  const [inflationYear3, setInflationYear3] = useState(2.2)

  // Calculate financial projections
  const financialData = useMemo(() => {
    const termsPerYear = 3
    const numOtherChildren = Math.max(0, numChildren - numStaffChildren)
    const staffChildrenDiscount = numStaffChildren * 0.5
    const otherChildrenDiscountAmount = numOtherChildren * (otherChildrenDiscount / 100)
    const calculatedTotalDiscount = numChildren > 0
      ? ((staffChildrenDiscount + otherChildrenDiscountAmount) / numChildren) * 100
      : 0

    const effectiveDiscount = totalDiscountEffect / 100
    const grossAnnualRevenue = numChildren * feePerTerm * termsPerYear
    const discountAmount = grossAnnualRevenue * effectiveDiscount
    const currentAnnualRevenue = grossAnnualRevenue - discountAmount
    const currentAnnualCosts = currentAnnualRevenue - currentSurplus

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
    })

    // Year 1
    const year1FeeMultiplier = 1 + feeIncrease / 100
    const year1PayMultiplier = 1 + payIncrease / 100
    const year1InflationMultiplier = 1 + inflationYear1 / 100

    const year1GrossRevenue = grossAnnualRevenue * year1FeeMultiplier
    const year1DiscountAmount = year1GrossRevenue * effectiveDiscount
    const year1Revenue = year1GrossRevenue - year1DiscountAmount
    const year1BaseCosts = currentAnnualCosts * year1PayMultiplier
    const year1Costs = year1BaseCosts * year1InflationMultiplier
    const year1Net = year1Revenue - year1Costs

    projections.push({
      year: 'Year 1',
      revenue: year1Revenue,
      costs: year1Costs,
      netPosition: year1Net,
      feeIncrease: feeIncrease,
      payIncrease: payIncrease,
      discountAmount: year1DiscountAmount,
      grossRevenue: year1GrossRevenue,
    })

    // Year 2
    const year2FeeMultiplier = 1 + feeIncrease / 100
    const year2PayMultiplier = 1 + payIncrease / 100
    const year2InflationMultiplier = 1 + inflationYear2 / 100

    const year2GrossRevenue = year1GrossRevenue * year2FeeMultiplier
    const year2DiscountAmount = year2GrossRevenue * effectiveDiscount
    const year2Revenue = year2GrossRevenue - year2DiscountAmount
    const year2BaseCosts = year1BaseCosts * year2PayMultiplier
    const year2Costs = year2BaseCosts * year2InflationMultiplier
    const year2Net = year2Revenue - year2Costs

    projections.push({
      year: 'Year 2',
      revenue: year2Revenue,
      costs: year2Costs,
      netPosition: year2Net,
      feeIncrease: feeIncrease,
      payIncrease: payIncrease,
      discountAmount: year2DiscountAmount,
      grossRevenue: year2GrossRevenue,
    })

    // Year 3
    const year3FeeMultiplier = 1 + feeIncrease / 100
    const year3PayMultiplier = 1 + payIncrease / 100
    const year3InflationMultiplier = 1 + inflationYear3 / 100

    const year3GrossRevenue = year2GrossRevenue * year3FeeMultiplier
    const year3DiscountAmount = year3GrossRevenue * effectiveDiscount
    const year3Revenue = year3GrossRevenue - year3DiscountAmount
    const year3BaseCosts = year2BaseCosts * year3PayMultiplier
    const year3Costs = year3BaseCosts * year3InflationMultiplier
    const year3Net = year3Revenue - year3Costs

    projections.push({
      year: 'Year 3',
      revenue: year3Revenue,
      costs: year3Costs,
      netPosition: year3Net,
      feeIncrease: feeIncrease,
      payIncrease: payIncrease,
      discountAmount: year3DiscountAmount,
      grossRevenue: year3GrossRevenue,
    })

    return projections
  }, [
    numChildren,
    feePerTerm,
    feeIncrease,
    payIncrease,
    currentSurplus,
    numStaffChildren,
    otherChildrenDiscount,
    totalDiscountEffect,
    inflationYear1,
    inflationYear2,
    inflationYear3,
  ])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-GB', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(value)
  }

  const baseCalculations = useMemo(() => {
    const termsPerYear = 3
    const effectiveDiscount = totalDiscountEffect / 100
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
    }
  }, [numChildren, feePerTerm, totalDiscountEffect, currentSurplus])

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
                        min={10}
                        max={20}
                        step={0.5}
                        marks
                        valueLabelDisplay="auto"
                      />
                    </Box>

                    <Box>
                      <Typography gutterBottom>
                        Total Discount Effect: {totalDiscountEffect}%
                      </Typography>
                      <Slider
                        value={totalDiscountEffect}
                        onChange={(_, value) => setTotalDiscountEffect(value as number)}
                        min={10}
                        max={15}
                        step={0.1}
                        marks
                        valueLabelDisplay="auto"
                      />
                    </Box>

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

                    <Paper elevation={0} sx={{ p: 2, bgcolor: 'primary.light', color: 'white' }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Gross Annual Revenue
                      </Typography>
                      <Typography variant="h6">
                        {formatCurrency(numChildren * feePerTerm * 3)}
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 1, opacity: 0.9 }}>
                        Turnover: {formatCurrency(
                          (numChildren * feePerTerm * 3) * (1 - totalDiscountEffect / 100)
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
                <Grid container spacing={2}>
                  <Grid item xs={12}>
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
                            <Tooltip formatter={(value: number) => formatCurrency(value)} />
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
                  </Grid>

                  <Grid item xs={12} md={6}>
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
                            <Tooltip formatter={(value: number) => formatCurrency(value)} />
                            <Legend />
                            <Bar dataKey="netPosition" fill="#1976d2" name="Surplus" />
                          </BarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid item xs={12} md={6}>
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
                            <Tooltip formatter={(value: number) => formatCurrency(value)} />
                            <Legend />
                            <Bar dataKey="revenue" fill="#2e7d32" name="Turnover" />
                            <Bar dataKey="costs" fill="#d32f2f" name="Costs" />
                          </BarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>

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
                          {totalDiscountEffect}% = {formatCurrency(baseCalculations.discountAmount)}
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
                      </Stack>
                    </Paper>

                    {financialData.slice(1).map((year, index) => {
                      const yearNum = index + 1
                      const feeMult = 1 + feeIncrease / 100
                      const payMult = 1 + payIncrease / 100
                      const inflationRate =
                        yearNum === 1 ? inflationYear1 : yearNum === 2 ? inflationYear2 : inflationYear3
                      const inflationMult = 1 + inflationRate / 100
                      const prevGrossRevenue =
                        index === 0 ? baseCalculations.grossAnnualRevenue : financialData[index].grossRevenue

                      let baseCostsBeforePay = baseCalculations.currentAnnualCosts
                      if (yearNum > 1) {
                        baseCostsBeforePay = baseCalculations.currentAnnualCosts * Math.pow(payMult, yearNum - 1)
                      }
                      const costsAfterPayIncrease = baseCostsBeforePay * payMult
                      const costsAfterInflation = costsAfterPayIncrease * inflationMult

                      return (
                        <Paper key={yearNum} elevation={1} sx={{ p: 2, mb: 2 }}>
                          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
                            Year {yearNum} Calculations
                          </Typography>
                          <Stack spacing={1.5}>
                            <Typography variant="body2">
                              <strong>Step 1:</strong> Gross Revenue = {formatCurrency(prevGrossRevenue)} × (1 +{' '}
                              {feeIncrease}%) = {formatCurrency(year.grossRevenue)}
                            </Typography>
                            <Typography variant="body2">
                              <strong>Step 2:</strong> Discount = {formatCurrency(year.grossRevenue)} ×{' '}
                              {totalDiscountEffect}% = {formatCurrency(year.discountAmount)}
                            </Typography>
                            <Typography variant="body2">
                              <strong>Step 3:</strong> Turnover = {formatCurrency(year.grossRevenue)} -{' '}
                              {formatCurrency(year.discountAmount)} = {formatCurrency(year.revenue)}
                            </Typography>
                            <Typography variant="body2">
                              <strong>Step 4:</strong> Costs (after pay increase) = {formatCurrency(baseCostsBeforePay)}{' '}
                              × (1 + {payIncrease}%) = {formatCurrency(costsAfterPayIncrease)}
                            </Typography>
                            <Typography variant="body2">
                              <strong>Step 5:</strong> Costs (after inflation) = {formatCurrency(costsAfterPayIncrease)}{' '}
                              × (1 + {inflationRate}%) = {formatCurrency(year.costs)}
                            </Typography>
                            <Typography variant="body2">
                              <strong>Step 6:</strong> Surplus = {formatCurrency(year.revenue)} -{' '}
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
