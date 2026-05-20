import { useState } from 'react'
import api from '../../../api/axios'
import './SymptomCard.css'

const fmtDate = (d) =>
  new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

const URGENCY_BADGE = {
                        routine: 'badge-muted',
                        urgent: 'badge-amber',
                        emergency: 'badge-red',
                      }

export default function SymptomCard({ query, expanded, onExpand, onDelete }) {
  const [fullQuery, setFullQuery] = useState(null)
  const [loadingFull, setLoadingFull] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const handleExpand = async () => {
    onExpand()
    if (!expanded && !fullQuery) {
      setLoadingFull(true)
      try {
        const { data } = await api.get(`/symptoms/${query._id}`)
        setFullQuery(data.query)
      } catch {
        // silently fail
      } finally {
        setLoadingFull(false)
      }
    }
  }

  const displayQuery = fullQuery || query
  const langLabel = { en: 'English', hi: 'Hindi', mr: 'Marathi', hinglish: 'Hinglish' }[query.detectedLang] || query.detectedLang

  return (
    <div className={`symptom-card card ${expanded ? 'expanded' : ''}`}>
      {/* Header */}
      <div className="sc-header" onClick={handleExpand}>
        <div className="sc-pulse">⚡</div>

        <div className="sc-meta">
          <div className="sc-top">
            <p className="sc-text">
              {query.inputText?.slice(0, 80)}{query.inputText?.length > 80 ? '…' : ''}
            </p>
            <div className="sc-badges">
              <span className="badge badge-blue">🌐 {langLabel}</span>
              <span className="badge badge-muted">symptom</span>
            </div>
          </div>
          <span className="sc-date">
            {fmtDate(query.createdAt)} · {query.suggestions?.length || 0} test suggestions
          </span>

          {/* Chip tags */}
          {query.selectedChips?.length > 0 && (
            <div className="sc-chips">
              {query.selectedChips.map((chip) => (
                <span key={chip} className="chip" style={{ fontSize: '0.72rem', padding: '3px 9px' }}>
                  {chip}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="sc-actions" onClick={(e) => e.stopPropagation()}>
          <button className="btn btn-ghost sc-action-btn" onClick={handleExpand}>
            <ChevronIcon up={expanded} />
          </button>
          {!confirmDelete ? (
            <button
              className="btn btn-ghost sc-action-btn sc-delete"
              onClick={() => setConfirmDelete(true)}
            >
              <TrashIcon />
            </button>
          ) : (
            <div className="sc-confirm">
              <button className="btn btn-ghost sc-action-btn" onClick={() => setConfirmDelete(false)}>
                Cancel
              </button>
              <button
                className="btn sc-action-btn sc-confirm-btn"
                onClick={() => { setConfirmDelete(false); onDelete(); }}>
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Expanded suggestions */}
      {expanded && (
        <div className="sc-body animate-fadeIn">
          <div className="sc-divider" />
          {loadingFull ? (
            <div className="sc-loading">
              <span className="spinner" /> Loading suggestions…
            </div>
          ) : (
            <>
              {displayQuery.summary && (
                <p className="sc-summary">{displayQuery.summary}</p>
              )}
              {displayQuery.suggestions?.length > 0 ? (
                <div className="sc-suggestions">
                  {displayQuery.suggestions.map((s, i) => (
                    <div key={i} className="sc-suggestion">
                      <div className="sc-rank">{String(i + 1).padStart(2, '0')}</div>
                      <div className="sc-sug-body">
                        <p className="sc-sug-name">{s.testName}</p>
                        <p className="sc-sug-reason">{s.reason}</p>
                      </div>
                      <span className={`badge ${URGENCY_BADGE[s.urgency] || 'badge-muted'}`}>
                        {s.urgency}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="sc-empty">No suggestions available.</p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}

function ChevronIcon({ up }) {
  return (
    <svg width="14" 
         height="14" 
         viewBox="0 0 24 24" 
         fill="none" 
         stroke="currentColor" 
         strokeWidth="2"
         style={{ 
                  transform: up ? 'rotate(180deg)' : 'none', 
                  transition: 'transform 0.2s' 
                  }}>
                    <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg width="13" 
         height="13" 
         viewBox="0 0 24 24" 
         fill="none" 
         stroke="currentColor" 
         strokeWidth="1.8">
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
          <path d="M10 11v6M14 11v6" />
          <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  )
}