import type { NavigateFunction } from 'react-router-dom';

export function goBackSafe(navigate: NavigateFunction, fallback = '/turnos'): void {
  const historyIndex =
    typeof window !== 'undefined' &&
    window.history.state &&
    typeof window.history.state.idx === 'number'
      ? window.history.state.idx
      : 0;

  if (historyIndex > 0) {
    navigate(-1);
    return;
  }

  navigate(fallback, { replace: true });
}