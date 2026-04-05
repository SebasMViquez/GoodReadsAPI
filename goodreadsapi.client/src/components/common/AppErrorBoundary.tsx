import { Component, type ErrorInfo, type PropsWithChildren, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { reportError } from '@/services/monitoring/reporting';

interface AppErrorBoundaryState {
  hasError: boolean;
}

export class AppErrorBoundary extends Component<PropsWithChildren, AppErrorBoundaryState> {
  override state: AppErrorBoundaryState = {
    hasError: false,
  };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    reportError(error, {
      componentStack: errorInfo.componentStack,
      source: 'AppErrorBoundary',
    });
  }

  override render(): ReactNode {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <section className="section page-top-spacing">
        <div className="container">
          <div className="empty-state">
            <span className="eyebrow">Application state</span>
            <h3>Something interrupted this view.</h3>
            <p>
              We captured the error and kept the session shell available. Return to a stable route and try again.
            </p>
            <div className="auth-form__footer">
              <Link className="button button--primary" to="/">
                Return home
              </Link>
              <button
                type="button"
                className="button button--ghost"
                onClick={() => window.location.reload()}
              >
                Reload app
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }
}
