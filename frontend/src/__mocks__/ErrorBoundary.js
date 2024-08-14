import React from 'react';

class MockErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <div data-testid="mock-error-boundary">Something went wrong. Please try refreshing the page.</div>;
    }

    return this.props.children;
  }
}

export default MockErrorBoundary;