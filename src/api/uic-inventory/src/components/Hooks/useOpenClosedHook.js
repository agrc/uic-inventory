import { useState, useMemo } from 'react';

export function useOpenClosed() {
  const [state, setState] = useState(false);

  const handlers = useMemo(
    () => ({
      open: () => {
        setState(true);
      },
      close: () => {
        setState(false);
      },
      toggle: () => {
        setState((s) => (s ? false : true));
      },
    }),
    []
  );

  return [state, handlers];
}
