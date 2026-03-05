import { render, screen } from '@testing-library/react'
import App from './App'

describe('App Component', () => {
  it('renders the main heading', () => {
    render(<App />)
    const heading = screen.getByText(/Home/i) // Using a basic keyword check depending on your app
    expect(heading).toBeInTheDocument()
  })
})