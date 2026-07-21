import { Component } from 'react'

export default class ErrorBoundary extends Component {
  state = { error: null }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error('Unhandled UI error', error, info)
  }

  render() {
    if (!this.state.error) return this.props.children

    return (
      <div className="empty-state" style={{ minHeight: '100svh', justifyContent: 'center' }}>
        <strong>Something went wrong</strong>
        <p>
          The page hit an unexpected error. Reloading usually clears it — your saved tickets are
          untouched.
        </p>
        <button type="button" className="btn btn-primary" onClick={() => window.location.reload()}>
          Reload page
        </button>
      </div>
    )
  }
}
