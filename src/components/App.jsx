import { ErrorBoundary } from 'react-error-boundary';
import { ErrorFallback } from './ErrorFallback';
import { Synth } from './Synth';

export const App = () => (
  <div className="p-8">
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <Synth />
    </ErrorBoundary>
  </div>
);
