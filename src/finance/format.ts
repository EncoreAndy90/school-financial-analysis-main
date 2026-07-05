const currencyFormatter = new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'GBP',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

const numberFormatter = new Intl.NumberFormat('en-GB', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
})

export const formatCurrency = (value: number): string =>
  currencyFormatter.format(Number.isFinite(value) ? value : 0)

export const formatCurrencyDelta = (value: number): string => {
  const safe = Number.isFinite(value) ? value : 0
  return `${safe >= 0 ? '+' : '−'}${currencyFormatter.format(Math.abs(safe))}`
}

export const formatNumber = (value: number): string =>
  numberFormatter.format(Number.isFinite(value) ? value : 0)

export const formatPercent = (value: number, decimals = 1): string =>
  `${(Number.isFinite(value) ? value : 0).toFixed(decimals)}%`

export const formatCompactCurrency = (value: number): string => {
  const safe = Number.isFinite(value) ? value : 0
  const abs = Math.abs(safe)
  const sign = safe < 0 ? '-' : ''
  if (abs >= 1_000_000) {
    return `${sign}£${(abs / 1_000_000).toFixed(1)}m`
  }
  if (abs >= 1_000) {
    return `${sign}£${(abs / 1_000).toFixed(0)}k`
  }
  return `${sign}£${abs.toFixed(0)}`
}
