import { useState, useEffect, useCallback } from 'react'

// ── Generic async state ───────────────────────────
export interface AsyncState<T> {
  data:    T | null
  loading: boolean
  error:   string | null
}

// ── useApi — fire once on mount ───────────────────
export function useApi<T>(fn: () => Promise<T>, deps: unknown[] = []) {
  const [state, setState] = useState<AsyncState<T>>({
    data:    null,
    loading: true,
    error:   null,
  })

  const execute = useCallback(async () => {
    setState(s => ({ ...s, loading: true, error: null }))
    try {
      const result = await fn()
      setState({ data: result, loading: false, error: null })
    } catch (err) {
      setState({ data: null, loading: false, error: err instanceof Error ? err.message : 'Unknown error' })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  useEffect(() => { execute() }, [execute])

  return { ...state, refetch: execute }
}

// ── Loading spinner ───────────────────────────────
export function Spinner() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem', color: 'var(--muted)' }}>
      <div style={{
        width: 28, height: 28, borderRadius: '50%',
        border: '3px solid var(--border)',
        borderTopColor: 'var(--accent)',
        animation: 'spin 0.7s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}

// ── Error box ─────────────────────────────────────
export function ErrorBox({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div style={{
      background: 'var(--red)11', border: '1px solid var(--red)44',
      borderRadius: 'var(--radius-md)', padding: '1rem 1.25rem',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--red)', flexShrink: 0 }} />
        <span style={{ fontSize: 13, color: 'var(--red)' }}>{message}</span>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          style={{ padding: '5px 12px', borderRadius: 6, border: '1px solid var(--red)44', background: 'none', color: 'var(--red)', cursor: 'pointer', fontSize: 12, whiteSpace: 'nowrap' }}
        >
          Retry
        </button>
      )}
    </div>
  )
}
