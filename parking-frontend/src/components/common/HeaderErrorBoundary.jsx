import React from 'react';

class HeaderErrorBoundary extends React.Component {
  state = { hasError: false };
  
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  
  componentDidCatch(error, errorInfo) {
    console.error('Header Error:', error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <header className="bg-white border-b border-gray-200 p-4">
          <div className="text-red-600">Error loading header. Please refresh.</div>
        </header>
      );
    }
    return this.props.children;
  }
}

export default HeaderErrorBoundary;