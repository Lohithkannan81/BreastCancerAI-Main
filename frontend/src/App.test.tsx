import { render, screen } from '@testing-library/react'
import App from './App'

describe('App Component', () => {
  it('renders the main heading', () => {
    render(<App />)
    const heading = screen.getAllByText(/BreastCancerAI/i)[0] // Check for platform branding
    expect(heading).toBeInTheDocument()
  })
})