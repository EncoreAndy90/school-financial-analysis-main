// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from './App'

// jsdom lacks matchMedia and ResizeObserver (used by MUI/recharts).
vi.stubGlobal(
  'matchMedia',
  vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
)

class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
vi.stubGlobal('ResizeObserver', ResizeObserverStub)

describe('App', () => {
  it('renders the planner with calculated results', () => {
    render(<App />)

    expect(screen.getByText('School Budget Planner')).toBeTruthy()
    expect(screen.getByText('Income & expenditure projection')).toBeTruthy()
    expect(screen.getByText('Sensitivity analysis')).toBeTruthy()
    expect(screen.getByText('Scenario comparison')).toBeTruthy()

    // Surplus is presented as a calculated output, not an input.
    expect(screen.getAllByText(/Surplus \/ \(deficit\)/).length).toBeGreaterThan(0)
    expect(screen.getByText(/never entered as assumptions/)).toBeTruthy()
  })
})
