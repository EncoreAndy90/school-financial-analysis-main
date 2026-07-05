import { Alert, AlertTitle, Stack } from '@mui/material'
import type { ModelWarning } from '../finance/types'

export const WarningsPanel = ({ warnings }: { warnings: ModelWarning[] }) => (
  <Stack spacing={1}>
    {warnings.map((warning) => (
      <Alert key={warning.title} severity={warning.severity}>
        <AlertTitle>{warning.title}</AlertTitle>
        {warning.message}
      </Alert>
    ))}
  </Stack>
)
