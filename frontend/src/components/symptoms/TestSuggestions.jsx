import './TestSuggestions.css'

export default function TestSuggestions({ suggestions = [], summary, detectedLang }) {
  if (!suggestions.length) return null

  const langLabel = {
    en: 'English', hi: 'Hindi', mr: 'Marathi', hinglish: 'Hinglish'
  }[detectedLang] || detectedLang

  return (
    <div className="suggestions animate-fadeUp">
      <div className="sug-header">
        <h3 className="section-title">Recommended Tests</h3>
        <div style={{ display: 'flex', gap: 8 }}>
          {detectedLang &&
            <span className="badge badge-blue">🌐 {langLabel}</span>
          }
          <span className="badge badge-muted">{suggestions.length} tests</span>
        </div>
      </div>

      {summary && <p className="sug-summary">{summary}</p>}

      <div className="sug-list">
        {suggestions.map((s, i) => (
          <div key={i} className={`sug-item animate-fadeUp delay-${Math.min(i + 1, 4)}`}>
            <div className="sug-rank">{String(i + 1).padStart(2, '0')}</div>
            <div className="sug-body">
              <div className="sug-name">{s.testName}</div>
              <div className="sug-reason">{s.reason}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}