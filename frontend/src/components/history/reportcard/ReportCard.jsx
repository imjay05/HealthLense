import { useState } from 'react'
import api from '../../../api/axios'
import './ReportCard.css'

const fmtDate = (d) =>
  new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

const fmtTime = (d) =>
  new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })

const LANG_LABEL = { en: 'English', hi: 'Hindi', mr: 'Marathi' }
const TYPE_LABEL = { full: 'Full Analysis', conclusion: 'Conclusion' }

export default function ReportCard({ report, expanded, onExpand, onDelete }) {
  const [fullReport, setFullReport]       = useState(null)
  const [loadingFull, setLoadingFull]     = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [openEntryId, setOpenEntryId]     = useState(null)
  const [deletingEntry, setDeletingEntry] = useState(null)

  if (!report || !report._id) return null

  const handleExpand = async () => {
    onExpand()
    if (!expanded && !fullReport) {
      setLoadingFull(true)
      try {
        const { data } = await api.get(`/reports/${report._id}`)
        setFullReport(data.report)
        if (data.report.analyses?.length) {
          const latest = [...data.report.analyses].sort(
            (a, b) => new Date(b.analyzedAt) - new Date(a.analyzedAt)
          )[0]
          setOpenEntryId(latest._id)
        }
      } catch { /* silently fail */ }
      finally { setLoadingFull(false) }
    }
  }

  const handleDeleteEntry = async (entryId) => {
    setDeletingEntry(entryId)
    try {
      const { data } = await api.delete(`/reports/${report._id}/analyses/${entryId}`)
      if (data.report) {
        setFullReport(data.report)
        if (openEntryId === entryId) setOpenEntryId(null)
      } else {
        onDelete()
      }
    } catch { /* silently fail */ }
    finally { setDeletingEntry(null) }
  }

  const displayReport = fullReport || report
  const analyses = [...(displayReport.analyses || [])]
    .sort((a, b) => new Date(b.analyzedAt) - new Date(a.analyzedAt))

  return (
    <div className={`report-card card ${expanded ? 'expanded' : ''}`}>
      <div className="rc-header" onClick={handleExpand}>
        <div className="rc-thumb">
          {report.thumbnailUrl
            ? <img src={report.thumbnailUrl} alt="" />
            : <span>{report.fileType === 'pdf' ? '📄' : '🖼'}</span>}
        </div>

        <div className="rc-meta">
          <div className="rc-top">
            <span className="rc-type">{report.fileType?.toUpperCase() ?? '—'}</span>
            <span className="rc-count">{analyses.length} analysis{analyses.length !== 1 ? 'es' : ''}</span>
          </div>
          <span className="rc-date">{fmtDate(report.displayDate || report.createdAt)}</span>
        </div>

        <div className="rc-actions" onClick={(e) => e.stopPropagation()}>
          <button
            className="btn btn-ghost rc-action-btn"
            title="Expand"
            onClick={handleExpand}>
            <ChevronIcon up={expanded} />
          </button>

          {!confirmDelete ? (
            <button
              className="btn btn-ghost rc-action-btn rc-delete"
              title="Delete entire report"
              onClick={() => setConfirmDelete(true)}>
              <TrashIcon />
            </button>
          ) : (
            <div className="rc-confirm">
              <button className="btn btn-ghost rc-action-btn" onClick={() => setConfirmDelete(false)}>
                Cancel
              </button>
              <button
                className="btn rc-action-btn rc-confirm-btn"
                onClick={() => { setConfirmDelete(false); onDelete() }}>
                Delete All
              </button>
            </div>
          )}
        </div>
      </div>

      {expanded && (
        <div className="rc-body animate-fadeIn">
          <div className="rc-divider" />

          {loadingFull ? (
            <div className="rc-loading"><span className="spinner" /> Loading analyses…</div>
          ) : analyses.length === 0 ? (
            <p className="rc-no-analysis">No analysis records found.</p>
          ) : (
            <div className="rc-entries">
              {analyses.map((entry) => (
                <div key={entry._id} className="rc-entry">
                  <div
                    className="rc-entry-header"
                    onClick={() => setOpenEntryId(openEntryId === entry._id ? null : entry._id)}>
                    <div className="rc-entry-meta">
                      <span className={`badge ${
                        entry.outputLang === 'hi' ? 'badge-blue'
                        : entry.outputLang === 'mr' ? 'badge-green'
                        : 'badge-muted'
                      }`}>
                        {LANG_LABEL[entry.outputLang] || entry.outputLang}
                      </span>
                      <span className="badge badge-muted">{TYPE_LABEL[entry.analysisType]}</span>
                      <span className="rc-entry-time">{fmtTime(entry.analyzedAt)}</span>
                    </div>
                    <div className="rc-entry-actions" onClick={(e) => e.stopPropagation()}>
                      {deletingEntry === entry._id ? (
                        <span className="rc-entry-deleting">Deleting…</span>
                      ) : (
                        <button
                          className="btn btn-ghost rc-action-btn rc-delete"
                          title="Delete this analysis"
                          onClick={() => handleDeleteEntry(entry._id)}>
                          <TrashIcon />
                        </button>
                      )}
                      <ChevronIcon up={openEntryId === entry._id} />
                    </div>
                  </div>

                  {openEntryId === entry._id && (
                    <div className="rc-entry-body animate-fadeIn">
                      {entry.analysisResult
                        ? entry.analysisResult.split('\n').map((line, i) => {
                            if (!line.trim()) return <br key={i} />
                            const stripped = line.trim()
                              .replace(/\*\*(.*?)\*\*/g, '$1')
                              .replace(/^#{1,3}\s/, '')
                            if (/^(\d+\.|#{1,3}\s|[A-Z][A-Z\s]{4,}:)/.test(line.trim())) {
                              return <p key={i} className="rc-heading">{stripped}</p>
                            }
                            return <p key={i} className="rc-line">{stripped}</p>
                          })
                        : <p className="rc-no-analysis">No result for this entry.</p>
                      }
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function ChevronIcon({ up }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2"
      style={{ transform: up ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  )
}