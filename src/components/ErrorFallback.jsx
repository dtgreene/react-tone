import { proxy, useSnapshot } from 'valtio';
import { Button } from './ui/Button';

const errorState = proxy({
  expanded: false,
});

export const ErrorFallback = ({ error }) => {
  const snap = useSnapshot(errorState);
  const errorInfo = {
    message: '',
    stack: [],
  };

  if (error instanceof Error) {
    errorInfo.message = error.message;
    errorInfo.stack = error.stack?.split('\n') ?? [];
    errorInfo.stack = errorInfo.stack.filter(Boolean).slice(0, 10);
  }

  const handleStackClick = () => {
    errorState.expanded = !errorState.expanded;
  };

  return (
    <div className="flex justify-center">
      <div className="border bg-accent rounded-md p-4 w-full max-w-[800px]">
        <div className="mb-4 text-4xl">OOF</div>
        <div className="flex justify-between items-center mb-4">
          <div>
            <div>Caught an error...</div>
            <div>{errorInfo.message}</div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                localStorage.clear();
                window.location.reload();
              }}
            >
              Clear state
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                window.location.reload();
              }}
            >
              Reload
            </Button>
          </div>
        </div>
        <Button variant="link" onClick={handleStackClick}>
          View stack
        </Button>
        {errorInfo.stack.length > 0 && snap.expanded && (
          <div className="border rounded py-2 mt-2 text-sm">
            {errorInfo.stack.map((value) => (
              <div key={value} className="ml-2">
                {value}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
