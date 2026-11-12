import React from 'react';
import { reportError } from '@/utils/telemetry.js';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(err, info) {
    console.error('[ErrorBoundary]', err, info);
    reportError(err, info);
  }
  render() {
    if (this.state.hasError) {
      return <div className="p-4">Something went wrong. Please refresh.</div>;
    }
    return this.props.children;
  }
}
