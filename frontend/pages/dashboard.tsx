import { useEffect, useState } from 'react'

export default function Dashboard() {
  const [summary, setSummary] = useState<string | null>(null)
  const [optOut, setOptOut] = useState<boolean>(false)

  useEffect(() => {
    const stored = window.localStorage.getItem('aiSummaryOptOut')
    setOptOut(stored === 'true')
  }, [])

  useEffect(() => {
    if (!optOut) {
      fetch('/api/ai-summary')
        .then(res => res.json())
        .then(data => setSummary(data.summary))
        .catch(() => setSummary('Failed to load summary'))
    }
  }, [optOut])

  const toggleOptOut = () => {
    const newValue = !optOut
    setOptOut(newValue)
    window.localStorage.setItem('aiSummaryOptOut', newValue.toString())
  }

  return (
    <div style={{ display: 'flex' }}>
      <aside style={{ width: '250px', borderRight: '1px solid #ccc', padding: '1rem' }}>
        <h2>Sidebar</h2>
        <label>
          <input type="checkbox" checked={optOut} onChange={toggleOptOut} />
          Disable AI Summary
        </label>
        {!optOut && (
          <div style={{ marginTop: '1rem' }}>
            <h3>AI Summary</h3>
            <p>{summary || 'Loading...'}</p>
          </div>
        )}
      </aside>
      <main style={{ flex: 1, padding: '1rem' }}>
        <h1>Verifier Dashboard</h1>
        <p>Dashboard content goes here.</p>
      </main>
    </div>
  )
}
