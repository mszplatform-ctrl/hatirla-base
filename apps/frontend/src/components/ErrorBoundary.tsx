import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif",
          background: '#f7fafc',
          gap: '16px',
        }}>
          <div style={{ fontSize: '40px' }}>⚠️</div>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: '#0f172a' }}>
            Something went wrong.
          </h2>
          <p style={{ margin: 0, fontSize: '14px', color: '#64748b' }}>
            Please refresh the page.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: '8px',
              background: '#0ea5e9',
              color: 'white',
              border: 'none',
              padding: '10px 24px',
              borderRadius: '999px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 600,
              fontFamily: 'inherit',
            }}
          >
            Refresh
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
