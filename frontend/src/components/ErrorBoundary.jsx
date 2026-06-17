import { Component } from 'react'

/**
 * Catches render-time errors in the routed content so a crash shows a readable
 * message instead of a blank white page. Resets when the route changes (via key).
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error('Render error:', error, info?.componentStack)
  }

  render() {
    if (this.state.error) {
      return (
        <div className="p-10">
          <div className="max-w-xl mx-auto bg-white border border-red-200 rounded-2xl shadow-sm p-6">
            <h1 className="text-lg font-bold text-red-600 mb-2">A apărut o eroare</h1>
            <p className="text-sm text-slate-600 mb-4">
              Pagina nu a putut fi afișată. Detalii pentru depanare:
            </p>
            <pre className="text-xs bg-slate-50 border border-slate-200 rounded-lg p-3 overflow-x-auto whitespace-pre-wrap text-slate-700">
{String(this.state.error?.stack || this.state.error?.message || this.state.error)}
            </pre>
            <button
              onClick={() => this.setState({ error: null })}
              className="mt-4 px-4 py-2 rounded-lg text-white text-sm font-medium cursor-pointer"
              style={{ backgroundColor: '#0f4c81' }}
            >
              Reîncearcă
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
